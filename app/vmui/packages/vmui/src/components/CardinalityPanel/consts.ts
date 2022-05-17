import {HeadStats, TypographyFunctions} from "./types";
import {Data} from "../Table/types";

export const defaultHeadCells = [
  {
    disablePadding: false,
    id: "name",
    label: "Name",
    numeric: false,
  },
  {
    disablePadding: false,
    id: "value",
    label: "Value",
    numeric: false,
  },
];

export const headCellsWithProgress = [...defaultHeadCells, {
  disablePadding: false,
  id: "percentage",
  label: "Percentage",
  numeric: false,
}];


export const typographyValues: TypographyFunctions = {
  labelValueCountByLabelName: (value: number): string => `Top ${value} label names with value count`,
  seriesCountByLabelValuePair: (value: number): string => `Top ${value} series count by label value pairs`,
  seriesCountByMetricName: (value: number): string => `Top ${value} series count by metric names`,
};

export const progressCount = (headStats: HeadStats, key: string, row: Data): Data => {
  switch (key) {
    case "labelValueCountByLabelName":
      row.progressValue = row.value / headStats.numOfLabelPairs * 100;
      return row;
    case "seriesCountByLabelValuePair":
      row.progressValue = row.value / headStats.numberOfLabelsValuePairs * 100;
      return row;
    case "seriesCountByMetricName":
      row.progressValue = row.value / headStats.numSeries * 100;
      return row;
    default:
      return row;
  }
};
