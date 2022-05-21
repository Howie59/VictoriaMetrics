import React, {FC, useRef} from "preact/compat";
import {Typography, Grid, Alert} from "@mui/material";
import {useFetchQuery} from "../../hooks/useCardinalityFetch";
import EnhancedTable from "../Table/Table";
import {TSDBStatus, TotalStats, TopHeapEntry} from "./types";
import {defaultHeadCells, headCellsWithProgress, labels, spinnerContainerStyles} from "./consts";
import {progressCount, typographyValues} from "./helpers";
import {Data} from "../Table/types";
import BarChart from "../BarChart/BarChart";
import CardinalityConfigurator from "./CardinalityConfigurator/CardinalityConfigurator";
import {barOptions} from "../BarChart/consts";
import Spinner from "../common/Spinner";

const CardinalityPanel: FC = () => {

  const {isLoading, tsdbStatus, error} = useFetchQuery();

  const headsStats = Object.keys(tsdbStatus.totalStats).map((key: string) => {
    return {name: labels[key as keyof TotalStats], value: tsdbStatus.totalStats[key as keyof TotalStats]} as Data;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {isLoading && <Spinner isLoading={isLoading} height={"800px"} containerStyles={spinnerContainerStyles("100%")} />}
      <CardinalityConfigurator/>
      {error && <Alert color="error" severity="error" sx={{whiteSpace: "pre-wrap", mt: 2}}>{error}</Alert>}
      <Grid container spacing={2} sx={{px: 2}}>
        <Grid item xs={12} md={12} lg={12}>
          <Typography gutterBottom variant="h4" component="h4">
            Total Statistic
          </Typography>
          <EnhancedTable
            rows={headsStats}
            headerCells={defaultHeadCells}
            defaultSortColumn={"value"}
          />
        </Grid>
        {Object.keys(tsdbStatus).map((key ) => {
          if (key == "totalStats") {
            return null;
          }
          const typographyFn = typographyValues[key];
          const numberOfValues = tsdbStatus[key as keyof TSDBStatus] as TopHeapEntry[];
          const rows = tsdbStatus[key as keyof TSDBStatus] as unknown as Data[];
          rows.forEach((row) => progressCount(tsdbStatus.totalStats, key, row));
          return (
            <>
              <Grid item xs={6} md={6} lg={6} key={key}>
                <Typography gutterBottom variant="h4" component="h4">
                  {typographyFn(numberOfValues.length)}
                </Typography>
                <EnhancedTable
                  rows={rows}
                  headerCells={headCellsWithProgress}
                  defaultSortColumn={"value"}
                />
              </Grid>
              <Grid xs={6} md={6} lg={6} key={key}>
                <div style={{width: "100%", paddingTop: "40px"}} ref={containerRef}>
                  {containerRef?.current && !isLoading ?
                    <BarChart  data={[
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      rows.map((v) => v.name),
                      rows.map((v) => v.value),
                      rows.map((_, i) => i % 12 == 0 ? 1 : i % 10 == 0 ? 2 : 0),
                    ]} container={containerRef?.current} configs={barOptions} /> : null}
                </div>
              </Grid>
            </>
          );
        })}
      </Grid>
    </>
  );
};

export default CardinalityPanel;
