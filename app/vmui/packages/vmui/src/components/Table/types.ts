import {ChangeEvent, MouseEvent, ReactNode, SyntheticEvent} from "react";
import {TableCell} from "@mui/material";

export type Order = "asc" | "desc";

export interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
}

export interface EnhancedHeaderTableProps {
  numSelected: number;
  onRequestSort: (event: MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  headerCells: HeadCell[];
}

export interface TableProps {
  rows: Data[];
  headerCells: HeadCell[],
  defaultSortColumn: keyof Data,
  tableCells: (row: Data) => ReactNode[],
  isPagingEnabled?: boolean,
}


export interface Data {
  name: string;
  value: number;
  progressValue: number;
  actions: string;
}
