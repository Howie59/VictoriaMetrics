package fs

import (
	"os"
	"strings"
	"time"

	"github.com/VictoriaMetrics/VictoriaMetrics/lib/logger"
	"github.com/VictoriaMetrics/VictoriaMetrics/lib/syncwg"
	"github.com/VictoriaMetrics/metrics"
)

// MustRemoveAll 将它内部所有内容都移除掉. 在路径内容移除后，它调用父级目录的fsyncs指令.
// It properly handles NFS issue https://github.com/VictoriaMetrics/VictoriaMetrics/issues/61 .
func MustRemoveAll(path string) {
	if tryRemoveAll(path) {
		return
	}
	select {
	case removeDirConcurrencyCh <- struct{}{}:
	default:
		logger.Panicf("FATAL: cannot schedule %s for removal, since the removal queue is full (%d entries)", path, cap(removeDirConcurrencyCh))
	}
	dirRemoverWG.Add(1)
	go func() {
		defer func() {
			dirRemoverWG.Done()
			<-removeDirConcurrencyCh
		}()
		for {
			time.Sleep(time.Second)
			if tryRemoveAll(path) {
				return
			}
		}
	}()
}

var dirRemoverWG syncwg.WaitGroup

func tryRemoveAll(path string) bool {
	err := os.RemoveAll(path)
	if err == nil || isStaleNFSFileHandleError(err) {
		// Make sure the parent directory doesn't contain references
		// to the current directory.
		mustSyncParentDirIfExists(path)
		return true
	}
	if !isTemporaryNFSError(err) {
		logger.Panicf("FATAL: cannot remove %q: %s", path, err)
	}
	// NFS 通过打开文件避免了移除文件夹。后面再考虑清除
	// 参考这个https://github.com/VictoriaMetrics/VictoriaMetrics/issues/61 .
	nfsDirRemoveFailedAttempts.Inc()
	return false
}

var (
	nfsDirRemoveFailedAttempts = metrics.NewCounter(`vm_nfs_dir_remove_failed_attempts_total`)
	_                          = metrics.NewGauge(`vm_nfs_pending_dirs_to_remove`, func() float64 {
		return float64(len(removeDirConcurrencyCh))
	})
)

var removeDirConcurrencyCh = make(chan struct{}, 1024)

func isStaleNFSFileHandleError(err error) bool {
	errStr := err.Error()
	return strings.Contains(errStr, "stale NFS file handle")
}

func isTemporaryNFSError(err error) bool {
	// See https://github.com/VictoriaMetrics/VictoriaMetrics/issues/61 for details.
	errStr := err.Error()
	return strings.Contains(errStr, "directory not empty") || strings.Contains(errStr, "device or resource busy")
}

// MustStopDirRemover must be called in the end of graceful shutdown
// in order to wait for removing the remaining directories from removeDirConcurrencyCh.
//
// It is expected that nobody calls MustRemoveAll when MustStopDirRemover is called.
func MustStopDirRemover() {
	doneCh := make(chan struct{})
	go func() {
		dirRemoverWG.Wait()
		close(doneCh)
	}()
	const maxWaitTime = 10 * time.Second
	select {
	case <-doneCh:
		return
	case <-time.After(maxWaitTime):
		logger.Errorf("cannot stop dirRemover in %s; the remaining empty NFS directories should be automatically removed on the next startup", maxWaitTime)
	}
}
