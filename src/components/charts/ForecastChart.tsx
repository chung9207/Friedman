import Plot from "react-plotly.js";
import { solarizedLayout, SOLARIZED_PALETTE } from "../../lib/chartTheme";

export interface ForecastChartData {
  dates: string[];
  actual: number[];
  forecast: number[];
  lower?: number[];
  upper?: number[];
}

interface ForecastChartProps {
  data: ForecastChartData;
}

export function ForecastChart({ data }: ForecastChartProps) {
  const traces: Plotly.Data[] = [];

  traces.push({
    x: data.dates,
    y: data.actual,
    name: "Actual",
    type: "scatter" as const,
    mode: "lines" as const,
    line: { color: SOLARIZED_PALETTE[0], width: 2 },
  });

  if (data.upper) {
    traces.push({
      x: data.dates,
      y: data.upper,
      name: "Upper Bound",
      type: "scatter" as const,
      mode: "lines" as const,
      line: { width: 0 },
      showlegend: false,
      hoverinfo: "skip",
    });
  }

  if (data.lower && data.upper) {
    traces.push({
      x: data.dates,
      y: data.lower,
      name: "Confidence Interval",
      type: "scatter" as const,
      mode: "lines" as const,
      line: { width: 0 },
      fill: "tonexty",
      fillcolor: `${SOLARIZED_PALETTE[1]}26`,
      showlegend: true,
    });
  }

  traces.push({
    x: data.dates,
    y: data.forecast,
    name: "Forecast",
    type: "scatter" as const,
    mode: "lines+markers" as const,
    line: { color: SOLARIZED_PALETTE[1], width: 2, dash: "dash" },
    marker: { size: 4, color: SOLARIZED_PALETTE[1] },
  });

  const layout: Partial<Plotly.Layout> = {
    ...solarizedLayout,
    title: { text: "Forecast", font: { color: "#073642", size: 13 } },
    xaxis: { ...solarizedLayout.xaxis, title: { text: "Date", font: { color: "#586e75" } } },
    yaxis: { ...solarizedLayout.yaxis, title: { text: "Value", font: { color: "#586e75" } } },
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
