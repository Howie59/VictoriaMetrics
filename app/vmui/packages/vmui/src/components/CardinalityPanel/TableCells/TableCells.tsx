import {TableCell, ButtonGroup} from "@mui/material";
import {Data} from "../../Table/types";
import {BorderLinearProgressWithLabel} from "../../BorderLineProgress/BorderLinearProgress";
import React from "preact/compat";
import IconButton from "@mui/material/IconButton";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import Tooltip from "@mui/material/Tooltip";
import {SyntheticEvent} from "react";

export const tableCells = (
  row: Data,
  onFilterClick: (e: SyntheticEvent) => void,
  onGraphClick: (e: SyntheticEvent) => void) => {
  return Object.keys(row).map((key, idx) => {
    if (idx === 0) {
      return (<TableCell component="th" scope="row" key={key}>
        {row[key as keyof Data]}
      </TableCell>);
    }
    if (key === "progressValue") {
      return (
        <TableCell key={key}>
          <BorderLinearProgressWithLabel
            variant="determinate"
            value={row[key as keyof Data] as number}
          />
        </TableCell>
      );
    }
    if (key === "actions") {
      const title = `Filter by ${row.name}`;
      const vmuiTitle = `go to graph with value: ${row.name}`;
      return (<TableCell key={key}>
        <ButtonGroup variant="contained">
          <Tooltip title={title}>
            <IconButton
              id={row.name}
              onClick={onFilterClick}
              sx={{height: "49px", width: "49px"}}>
              <PlayCircleOutlineIcon/>
            </IconButton>
          </Tooltip>
          {row[key]==="1" ? <Tooltip title={vmuiTitle}>
            <IconButton
              id={row.name}
              onClick={onGraphClick}
              sx={{height: "49px", width: "49px"}}>
              <ShowChartIcon />
            </IconButton>
          </Tooltip>: null}
        </ButtonGroup>
      </TableCell>);
    }
    return (<TableCell key={key}>{row[key as keyof Data]}</TableCell>);
  });
};
