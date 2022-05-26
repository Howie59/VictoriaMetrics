import {TableCell, ButtonGroup} from "@mui/material";
import {Data} from "../../Table/types";
import {BorderLinearProgressWithLabel} from "../../BorderLineProgress/BorderLinearProgress";
import React from "preact/compat";
import IconButton from "@mui/material/IconButton";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SendIcon from "@mui/icons-material/Send";
import Tooltip from "@mui/material/Tooltip";
import {SyntheticEvent} from "react";

export const tableCells = (row: Data, onIconClick: (_: SyntheticEvent, name: string) => void) => {
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
              onClick={(e) => onIconClick(e, row.name)}
              sx={{height: "49px", width: "49px"}}>
              <PlayCircleOutlineIcon/>
            </IconButton>
          </Tooltip>
          <Tooltip title={vmuiTitle}>
            <IconButton
              onClick={(e) => onIconClick(e, row.name)}
              sx={{height: "49px", width: "49px"}}>
              <SendIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </TableCell>);
    }
    return (<TableCell key={key}>{row[key as keyof Data]}</TableCell>);
  });
};
