import {TotalStats, TypographyFunctions} from "./types";
import {Data} from "../Table/types";

export const typographyValues: TypographyFunctions = {
  labelValueCountByLabelName: (value: number): string => `Top ${value} label names with value count`,
  seriesCountByLabelValuePair: (value: number): string => `Top ${value} series count by label value pairs`,
  seriesCountByMetricName: (value: number): string => `Top ${value} series count by metric names`,
};

export const progressCount = (totalStats: TotalStats, key: string, row: Data): Data => {
  switch (key) {
    case "labelValueCountByLabelName":
      row.progressValue = row.value / totalStats.numOfLabelPairs * 100;
      return row;
    case "seriesCountByLabelValuePair":
      row.progressValue = row.value / totalStats.numberOfLabelsValuePairs * 100;
      return row;
    case "seriesCountByMetricName":
      row.progressValue = row.value / totalStats.numSeries * 100;
      return row;
    default:
      return row;
  }
};
