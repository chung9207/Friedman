import Plot from "react-plotly.js";
import { solarizedLayout, SOLARIZED_PALETTE } from "../../lib/chartTheme";

export interface ScreePlotDatum {
  factor: number;
  eigenvalue: number;
  cumulative_variance: number;
}

interface ScreePlotProps {
  data: ScreePlotDatum[];
}

export function ScreePlot({ data }: ScreePlotProps) {
  const factors = data.map((d) => d.factor);
  const eigenvalues = data.map((d) => d.eigenvalue);
  const cumVariance = data.map((d) => d.cumulative_variance);

  const traces: Plotly.Data[] = [
    {
      x: factors,
      y: eigenvalues,
      name: "Eigenvalue",
      type: "bar" as const,
      marker: { color: SOLARIZED_PALETTE[0] },
      yaxis: "y",
    },
    {
      x: factors,
      y: cumVariance,
      name: "Cumulative Variance",
      type: "scatter" as const,
      mode: "lines+markers" as const,
      line: { color: SOLARIZED_PALETTE[1], width: 2 },
      marker: { size: 6, color: SOLARIZED_PALETTE[1] },
      yaxis: "y2",
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    ...solarizedLayout,
    title: { text: "Scree Plot", font: { color: "#073642", size: 13 } },
    xaxis: { ...solarizedLayout.xaxis, title: { text: "Factor", font: { color: "#586e75" } }, dtick: 1 },
    yaxis: { ...solarizedLayout.yaxis, title: { text: "Eigenvalue", font: { color: SOLARIZED_PALETTE[0] } }, side: "left" },
    yaxis2: {
      gridcolor: "#eee8d5", zerolinecolor: "#93a1a1",
      title: { text: "Cumulative Variance", font: { color: SOLARIZED_PALETTE[1] } },
      side: "right", overlaying: "y", range: [0, 1.05],
    },
    margin: { ...solarizedLayout.margin, r: 60 },
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true, displayModeBar: false }}
    />
  );
}
