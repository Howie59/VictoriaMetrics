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
  numOfLabelPairs:	"Number of unique Label Pairs",
  numberOfLabelsValuePairs: "Total series count by lable name",
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
