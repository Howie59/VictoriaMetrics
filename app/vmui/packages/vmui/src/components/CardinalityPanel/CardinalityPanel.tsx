import React, {FC, useState} from "preact/compat";
import {SyntheticEvent} from "react";
import {Typography, Grid, Alert, Box, Tabs} from "@mui/material";
import {useFetchQuery} from "../../hooks/useCardinalityFetch";
import EnhancedTable from "../Table/Table";
import {TSDBStatus, TopHeapEntry, DefaultState, Tabs as TabsType, Containers} from "./types";
import {defaultHeadCells, headCellsWithProgress, spinnerContainerStyles} from "./consts";
import {defaultProperties, progressCount, typographyValues} from "./helpers";
import {Data} from "../Table/types";
import BarChart from "../BarChart/BarChart";
import CardinalityConfigurator from "./CardinalityConfigurator/CardinalityConfigurator";
import {barOptions} from "../BarChart/consts";
import Spinner from "../common/Spinner";
import Tab from "@mui/material/Tab";
import TabPanel from "../TabPanel/TabPanel";

const CardinalityPanel: FC = () => {

  const {isLoading, tsdbStatus, error} = useFetchQuery();
  const defaultProps = defaultProperties(tsdbStatus);
  const [stateTabs, setTab] = useState(defaultProps.defaultState);

  const handleTabChange = (e: SyntheticEvent, newValue: number) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setTab({...stateTabs, [e.target.id]: newValue});
  };

  return (
    <>
      {isLoading && <Spinner isLoading={isLoading} height={"800px"} containerStyles={spinnerContainerStyles("100%")} />}
      <CardinalityConfigurator/>
      {error && <Alert color="error" severity="error" sx={{whiteSpace: "pre-wrap", mt: 2}}>{error}</Alert>}
      {Object.keys(tsdbStatus).map((key ) => {
        if (key == "numSeries") {
          return null;
        }
        const typographyFn = typographyValues[key];
        const numberOfValues = tsdbStatus[key as keyof TSDBStatus] as TopHeapEntry[];
        const rows = tsdbStatus[key as keyof TSDBStatus] as unknown as Data[];
        rows.forEach((row) => progressCount(tsdbStatus.numSeries, key, row));
        return (
          <>
            <Grid container spacing={2} sx={{px: 2}}>
              <Grid item xs={12} md={12} lg={12} key={key}>
                <Typography gutterBottom variant="h4" component="h4">
                  {typographyFn(numberOfValues.length)}
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={stateTabs[key as keyof DefaultState]} onChange={handleTabChange} aria-label="basic tabs example">
                    {defaultProps.tabs[key as keyof TabsType].map((title: string, i: number) =>
                      <Tab key={title} label={title} aria-controls={`tabpanel-${i}`} id={key} />
                    )}
                  </Tabs>
                </Box>
                {defaultProps.tabs[key as keyof TabsType].map((_,idx) =>
                  <div
                    ref={defaultProps.containerRefs[key as keyof Containers<HTMLDivElement>]}
                    style={{width: "100%", paddingRight: idx !== 0 ? "40px" : 0 }} key={`${key}-${idx}`}>
                    <TabPanel value={stateTabs[key as keyof DefaultState]} index={idx}>
                      {stateTabs[key as keyof DefaultState] === 0 ? <EnhancedTable
                        rows={rows}
                        headerCells={key == "seriesCountByMetricName" ? headCellsWithProgress : defaultHeadCells}
                        defaultSortColumn={"value"}
                      />: <BarChart
                        data={[
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          rows.map((v) => v.name),
                          rows.map((v) => v.value),
                          rows.map((_, i) => i % 12 == 0 ? 1 : i % 10 == 0 ? 2 : 0),
                        ]}
                        container={defaultProps.containerRefs[key as keyof Containers<HTMLDivElement>]?.current}
                        configs={barOptions}
                      />}
                    </TabPanel>
                  </div>
                )}
              </Grid>
            </Grid>
          </>
        );
      })}
    </>
  );
};

export default CardinalityPanel;
