package persistentqueue

import (
	"fmt"
	"sync"

	"github.com/VictoriaMetrics/VictoriaMetrics/lib/bytesutil"
	"github.com/VictoriaMetrics/VictoriaMetrics/lib/fasttime"
	"github.com/VictoriaMetrics/VictoriaMetrics/lib/logger"
	"github.com/VictoriaMetrics/metrics"
)

// FastQueue 是持久化队列，倾向于使用内存发送数据.
// 如果读者跟不上写入速度，它会降级到文件写入.
type FastQueue struct {
	// 锁
	mu sync.Mutex

	// 新数据被添加或者 MustClose 被调用的时候cond用于通知阻塞的读者.
	cond sync.Cond

	// pq 是磁盘队列
	pq *queue

	// ch 是内存队列
	ch chan *bytesutil.ByteBuffer

	// pendingInmemoryBytes 内存中阻塞的字节大小
	pendingInmemoryBytes uint64

	// lastInmemoryBlockReadTime 上一次内存块的读写时间
	lastInmemoryBlockReadTime uint64

	// stopDeadline 当前时间加5s为过期时间
	stopDeadline uint64
}

// MustOpenFastQueue 按照指定路径打开持久化队列.
// 它在内存维护 maxInmemoryBlocks 大小的数据，超过就会落盘.
//
// 如果 maxPendingBytes 为0，队列长度无限大. 否则受制于该大小.
// 当队列长度达到这个，最老的数据就会被丢弃.
func MustOpenFastQueue(path, name string, maxInmemoryBlocks, maxPendingBytes int) *FastQueue {
	pq := mustOpen(path, name, maxPendingBytes)
	fq := &FastQueue{
		pq: pq,
		ch: make(chan *bytesutil.ByteBuffer, maxInmemoryBlocks),
	}
	fq.cond.L = &fq.mu
	fq.lastInmemoryBlockReadTime = fasttime.UnixTimestamp()
	_ = metrics.GetOrCreateGauge(fmt.Sprintf(`vm_persistentqueue_bytes_pending{path=%q}`, path), func() float64 {
		fq.mu.Lock()
		n := fq.pq.GetPendingBytes()
		fq.mu.Unlock()
		return float64(n)
	})
	pendingBytes := fq.GetPendingBytes()
	logger.Infof("opened fast persistent queue at %q with maxInmemoryBlocks=%d, it contains %d pending bytes", path, maxInmemoryBlocks, pendingBytes)
	return fq
}

// UnblockAllReaders 为所有读取者unblocks.
func (fq *FastQueue) UnblockAllReaders() {
	fq.mu.Lock()
	defer fq.mu.Unlock()

	// Unblock blocked readers
	// Allow for up to 5 seconds for sending Prometheus stale markers.
	// See https://github.com/VictoriaMetrics/VictoriaMetrics/issues/1526
	fq.stopDeadline = fasttime.UnixTimestamp() + 5
	fq.cond.Broadcast()
}

// MustClose 为所有读者unblock
// 期待本地调用后不会有新的写入
func (fq *FastQueue) MustClose() {
	fq.UnblockAllReaders()

	fq.mu.Lock()
	defer fq.mu.Unlock()

	// 持久化
	fq.flushInmemoryBlocksToFileLocked()

	// Close fq.pq
	fq.pq.MustClose()

	logger.Infof("closed fast persistent queue at %q", fq.pq.dir)
}

func (fq *FastQueue) flushInmemoryBlocksToFileIfNeededLocked() {
	if len(fq.ch) == 0 {
		return
	}
	if fasttime.UnixTimestamp() < fq.lastInmemoryBlockReadTime+5 {
		return
	}
	fq.flushInmemoryBlocksToFileLocked()
}

func (fq *FastQueue) flushInmemoryBlocksToFileLocked() {
	// fq.mu 应该被调用者执行lock
	for len(fq.ch) > 0 {
		bb := <-fq.ch
		fq.pq.MustWriteBlock(bb.B)
		fq.pendingInmemoryBytes -= uint64(len(bb.B))
		fq.lastInmemoryBlockReadTime = fasttime.UnixTimestamp()
		blockBufPool.Put(bb)
	}
	// Unblock 所有潜在的读取，它们可以读磁盘队列.
	fq.cond.Broadcast()
}

// GetPendingBytes returns the number of pending bytes in the fq.
func (fq *FastQueue) GetPendingBytes() uint64 {
	fq.mu.Lock()
	defer fq.mu.Unlock()

	n := fq.pendingInmemoryBytes
	n += fq.pq.GetPendingBytes()
	return n
}

// GetInmemoryQueueLen returns the length of inmemory queue.
func (fq *FastQueue) GetInmemoryQueueLen() int {
	fq.mu.Lock()
	defer fq.mu.Unlock()

	return len(fq.ch)
}

// MustWriteBlock writes block to fq.
func (fq *FastQueue) MustWriteBlock(block []byte) {
	fq.mu.Lock()
	defer fq.mu.Unlock()

	fq.flushInmemoryBlocksToFileIfNeededLocked()
	if n := fq.pq.GetPendingBytes(); n > 0 {
		// 还在读取文件队列，说明内存队列还是满的.
		if len(fq.ch) > 0 {
			logger.Panicf("BUG: the in-memory queue must be empty when the file-based queue is non-empty; it contains %d pending bytes", n)
		}
		fq.pq.MustWriteBlock(block)
		return
	}
	if len(fq.ch) == cap(fq.ch) {
		// 内存队列放满了。将数据放到磁盘文件队列.
		fq.flushInmemoryBlocksToFileLocked()
		fq.pq.MustWriteBlock(block)
		return
	}
	// There is enough space in the in-memory queue.
	bb := blockBufPool.Get()
	bb.B = append(bb.B[:0], block...)
	fq.ch <- bb
	fq.pendingInmemoryBytes += uint64(len(block))

	// Notify potentially blocked reader.
	// See https://github.com/VictoriaMetrics/VictoriaMetrics/pull/484 for the context.
	fq.cond.Signal()
}

// MustReadBlock reads the next block from fq to dst and returns it.
func (fq *FastQueue) MustReadBlock(dst []byte) ([]byte, bool) {
	fq.mu.Lock()
	defer fq.mu.Unlock()

	for {
		if fq.stopDeadline > 0 && fasttime.UnixTimestamp() > fq.stopDeadline {
			return dst, false
		}
		if len(fq.ch) > 0 {
			if n := fq.pq.GetPendingBytes(); n > 0 {
				logger.Panicf("BUG: the file-based queue must be empty when the inmemory queue is non-empty; it contains %d pending bytes", n)
			}
			bb := <-fq.ch
			fq.pendingInmemoryBytes -= uint64(len(bb.B))
			fq.lastInmemoryBlockReadTime = fasttime.UnixTimestamp()
			dst = append(dst, bb.B...)
			blockBufPool.Put(bb)
			return dst, true
		}
		if n := fq.pq.GetPendingBytes(); n > 0 {
			data, ok := fq.pq.MustReadBlockNonblocking(dst)
			if ok {
				return data, true
			}
			dst = data
			continue
		}
		if fq.stopDeadline > 0 {
			return dst, false
		}
		// There are no blocks. Wait for new block.
		fq.pq.ResetIfEmpty()
		fq.cond.Wait()
	}
}
