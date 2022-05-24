import React, {FC, useState} from "react";
import Box from "@mui/material/Box";
import QueryEditor from "../../CustomPanel/Configurator/Query/QueryEditor";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import {useFetchQueryOptions} from "../../../hooks/useFetchQueryOptions";
import {useAppDispatch, useAppState} from "../../../state/common/StateContext";
import FormControlLabel from "@mui/material/FormControlLabel";
import BasicSwitch from "../../../theme/switch";
import {saveToStorage} from "../../../utils/storage";
import {useCardinalityDispatch, useCardinalityState} from "../../../state/cardinality/CardinalityStateContext";
import TextField from "@mui/material/TextField";

const CardinalityConfigurator: FC = () => {

  const dispatch = useAppDispatch();
  const cardinalityDispatch = useCardinalityDispatch();

  const {topN, match} = useCardinalityState();

  const {queryOptions} = useFetchQueryOptions();
  const error = "";
  const [query, setQuery] = useState(match || "");
  const {queryControls: {autocomplete}} = useAppState();
  const [queryHistoryIndex, setQueryHistoryIndex] = useState(0);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const onRunQuery = () => {
    setQueryHistory(prev => [...prev, query]);
    setQueryHistoryIndex(prev => prev + 1);
    cardinalityDispatch({type: "SET_MATCH", payload: query});
    cardinalityDispatch({type: "RUN_QUERY"});
  };

  const onSetQuery = (query: string) => {
    setQuery(query);
  };

  const onSetHistory = (step: number) => {
    const newIndexHistory = queryHistoryIndex + step;
    if (newIndexHistory < 0 || newIndexHistory >= queryHistory.length) return;
    setQueryHistoryIndex(newIndexHistory);
    setQuery(queryHistory[newIndexHistory]);
  };

  const onChangeAutocomplete = () => {
    dispatch({type: "TOGGLE_AUTOCOMPLETE"});
    saveToStorage("AUTOCOMPLETE", !autocomplete);
  };

  return <Box boxShadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;" p={4} pb={2} mb={2}>
    <Box>
      <Box display="grid" gridTemplateColumns="1fr auto auto" gap="4px" width="100%" mb={0}>
        <QueryEditor query={query} index={0} autocomplete={autocomplete} queryOptions={queryOptions}
          error={error} setHistoryIndex={onSetHistory} runQuery={onRunQuery} setQuery={onSetQuery}/>
        <Tooltip title="Execute Query">
          <IconButton onClick={onRunQuery} sx={{height: "49px", width: "49px"}}>
            <PlayCircleOutlineIcon/>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
    <Box display="flex" alignItems="center" mt={3} mr={"53px"}>
      <Box>
        <FormControlLabel label="Enable autocomplete"
          control={<BasicSwitch checked={autocomplete} onChange={onChangeAutocomplete}/>}
        />
      </Box>
      <Box ml={2}>
        <TextField
          label="Number of top entries"
          type="number"
          size="small"
          variant="outlined"
          value={topN}
          error={topN < 1}
          helperText={topN < 1 ? "Number can't be less than zero" : " "}
          onChange={(e) => {
            cardinalityDispatch({type: "SET_TOP_N", payload: +e.target.value});
          }}/>
      </Box>
    </Box>
  </Box>;
};

export default CardinalityConfigurator;
