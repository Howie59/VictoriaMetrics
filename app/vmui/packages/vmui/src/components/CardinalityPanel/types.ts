export interface TSDBStatus {
  totalStats: TotalStats;
  labelValueCountByLabelName: TopHeapEntry[]; // [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
  seriesCountByLabelValuePair: TopHeapEntry[]; // (10) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
  seriesCountByMetricName: TopHeapEntry[]
}

export interface TotalStats {
  numOfLabelPairs: number;
  numSeries: number;
  numberOfLabelsValuePairs: number;
}

export interface TopHeapEntry {
  name:  string;
  count: number;
}

export type TypographyFunctions = {
  [key: string]: (value: number) => string,
}
