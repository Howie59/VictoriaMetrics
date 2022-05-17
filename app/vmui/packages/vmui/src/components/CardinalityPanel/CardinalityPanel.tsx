import React, {FC} from "preact/compat";
import {Typography, Grid} from "@mui/material";
import {useFetchQuery} from "../../hooks/useCardinalityFetch";
import EnhancedTable from "../Table/Table";
import {TSDBStatus, HeadStats, TopHeapEntry} from "./types";
import {defaultHeadCells, headCellsWithProgress, typographyValues} from "./consts";
import {Data} from "../Table/types";



const CardinalityPanel: FC = () => {

  const {isLoading, tsdbStatus} = useFetchQuery({headsData: undefined, visible: false});

  const headsStats = Object.keys(tsdbStatus.headsStats).map((key: string) => {
    return {name: key, value: tsdbStatus.headsStats[key as keyof HeadStats]} as Data;
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={6}>
        <Typography gutterBottom variant="h4" component="h4">
          Head Stats
        </Typography>
        <EnhancedTable rows={headsStats} headerCells={defaultHeadCells} defaultSortColumn={"value"} />
      </Grid>
      {Object.keys(tsdbStatus).map((key ) => {
        if (key == "headsStats") {
          return null;
        }
        const typographyFn = typographyValues[key];
        const numberOfValues = tsdbStatus[key as keyof TSDBStatus] as TopHeapEntry[];
        const rows = tsdbStatus[key as keyof TSDBStatus] as unknown as Data[];
        rows.forEach((row) => row.progressValue = 55);
        return (
          <Grid item xs={12} md={6} lg={6} key={key}>
            <Typography gutterBottom variant="h4" component="h4">
              {typographyFn(numberOfValues.length)}
            </Typography>
            <EnhancedTable
              rows={rows}
              headerCells={headCellsWithProgress}
              defaultSortColumn={"value"}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CardinalityPanel;
