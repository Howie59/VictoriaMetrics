import {TypographyFunctions} from "./types";

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
