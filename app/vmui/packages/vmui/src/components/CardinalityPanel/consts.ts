export const headCellsWithProgress = [
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
  {
    disablePadding: false,
    id: "percentage",
    label: "Percentage",
    numeric: false,
  },
  {
    disablePadding: false,
    id: "action",
    label: "Action",
    numeric: false,
  }
];

export const defaultHeadCells = headCellsWithProgress.filter((head) => head.id!=="percentage");

export const labels = {
  numSeries: "Number of Series",
  numOfLabelPairs:	"Number of unique Label Pairs",
  numberOfLabelsValuePairs: "Total series count by label name",
};

export const spinnerContainerStyles = (height: string) =>  {
  return {
    width: "100%",
    maxWidth: "100%",
    position: "absolute",
    height: height ?? "50%",
    background: "rgba(255, 255, 255, 0.7)",
    pointerEvents: "none",
    zIndex: 1000,
  };
};
