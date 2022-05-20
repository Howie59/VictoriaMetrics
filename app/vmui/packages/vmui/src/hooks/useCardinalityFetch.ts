import {ErrorTypes} from "../types";
import {useAppState} from "../state/common/StateContext";
import {useEffect, useState} from "preact/compat";
import {CardinalityRequestsParams, getCardinalityInfo} from "../api/tsdb";
import {getAppModeEnable, getAppModeParams} from "../utils/app-mode";
import {TSDBStatus} from "../components/CardinalityPanel/types";
import {useCardinalityState} from "../state/cardinality/CardinalityStateContext";

interface FetchQueryParams {
  visible: boolean
  headsData: any,
}

const appModeEnable = getAppModeEnable();
const {serverURL: appServerUrl} = getAppModeParams();
const defaultTSDBStatus = {
  headsStats: {
    numOfLabelPairs: 0,
    numSeries: 0,
    numberOfLabelsValuePairs: 0,
  },
  labelValueCountByLabelName: [],
  seriesCountByLabelValuePair: [],
  seriesCountByMetricName: []
};

export const useFetchQuery = ({visible}: FetchQueryParams): {
  fetchUrl?: string[],
  isLoading: boolean,
  error?: ErrorTypes | string
  tsdbStatus: TSDBStatus,
} => {
  const {topN, extraLabel, match, date, runQuery} = useCardinalityState();

  const {serverUrl, queryControls: {nocache}} = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorTypes | string>();
  const [tsdbStatus, setTSDBStatus] = useState<TSDBStatus>(defaultTSDBStatus);

  useEffect(() => {
    if (error) {
      setTSDBStatus(defaultTSDBStatus);
      setIsLoading(false);
    }
  }, [error]);

  const fetchCardinalityInfo = async (requestParams: CardinalityRequestsParams) => {
    const server = appModeEnable ? appServerUrl : serverUrl;
    if (!server) return;
    setError("");
    setIsLoading(true);
    setTSDBStatus(defaultTSDBStatus);
    const url = getCardinalityInfo(server, requestParams);

    try {
      const response = await fetch(url);
      const resp = await response.json();
      if (response.ok) {
        const {headsStats, data} = resp;
        setTSDBStatus({
          headsStats: headsStats,
          labelValueCountByLabelName: data.labelValueCountByLabelName,
          seriesCountByLabelValuePair: data.seriesCountByLabelValuePair,
          seriesCountByMetricName: data.seriesCountByMetricName,
        });
        setIsLoading(false);
      } else {
        setError(resp.error);
        setTSDBStatus(defaultTSDBStatus);
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      if (e instanceof Error) setError(`${e.name}: ${e.message}`);
    }
  };


  useEffect(() => {
    fetchCardinalityInfo({topN, extraLabel, match, date});
  }, [serverUrl, runQuery]);

  return {isLoading, tsdbStatus, error};
};
