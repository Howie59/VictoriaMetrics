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

export const labels = {
  numSeries: "Number of Series",
  numOfLabelPairs:	"Number of Label Pairs",
  numberOfLabelsValuePairs: "Number of Label value Pairs",
};
