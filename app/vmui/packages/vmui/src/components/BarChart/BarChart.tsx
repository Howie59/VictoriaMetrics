import React, {FC, useCallback, useEffect, useRef, useState} from "preact/compat";
import uPlot, {Options as uPlotOptions, Range, Scale, Scales} from "uplot";
import useResize from "../../hooks/useResize";
import {BarChartProps} from "./types";
import {seriesBarsPlugin} from "./plugin";



const BarChart: FC<BarChartProps> = ({data, container}) => {

  const uPlotRef = useRef<HTMLDivElement>(null);
  const [isPanning, setPanning] = useState(false);
  const [uPlotInst, setUPlotInst] = useState<uPlot>();
  const layoutSize = useResize(container);

  const options: uPlotOptions ={
    width: layoutSize.width || 400,
    height: 400,
    title: "Variable bar colors",
    padding: [null, 0, null, 0],
    axes: [
      {},
      {},
    ],
    series: [
      {
        label: "Build #",
        value: (u, v) => v
      },
      {
        label: "Server #SNAFU",
        width: 2,
        fill: "#33BB55A0",
        values: (u, seriesIdx) => {
          const idxs = u.legend.idxs || [];

          if (u.data === null || idxs.length === 0)
            return {"Build": null, "Duration": null,};

          const dataIdx = idxs[seriesIdx] || 0;

          const build = u.data[0][dataIdx];
          const duration = u.data[seriesIdx][dataIdx];

          return {"Name": build, "Value": duration};
        }
      },
      /*
        {
          label: "Status",
          fill: "",
          value: (u, v) => v == 0 ? "Success" : v == 1 ? "Pending" : "Failed"
        },
      */
    ],
    plugins: [
      seriesBarsPlugin({
        which: [1],
        ori: 0,
        dir: 1,
        radius: 0,
        disp: {
          stroke: {
            unit: 3,
            values: (u: { data: number[][]; }) => u.data[2].map((v: number) =>
              v == 0 ? "#33BB55" :
                v == 1 ? "#F79420" :
                  "#BB1133"
            ),
          },
          fill: {
            unit: 3,
            values: (u: { data: number[][]; }) => u.data[2].map((v: number) =>
              v == 0 ? "#33BB55A0" :
                v == 1 ? "#F79420A0" :
                  "#BB1133A0"
            ),
          }
        }
      }),
    ],
  };

  const updateChart = (): void => {
    if (!uPlotInst) return;
    uPlotInst.setData(data);
    if (!isPanning) uPlotInst.redraw();
  };

  useEffect(() => {
    if (!uPlotRef.current) return;
    const u = new uPlot(options, data, uPlotRef.current);
    setUPlotInst(u);
    return u.destroy;
  }, [uPlotRef.current, layoutSize]);

  useEffect(() => updateChart(), [data]);

  return <div style={{pointerEvents: isPanning ? "none" : "auto", height: "100%"}}>
    <div ref={uPlotRef}/>
  </div>;
};

export default BarChart;
