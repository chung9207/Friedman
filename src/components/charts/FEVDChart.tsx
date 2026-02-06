import type { Layout } from "plotly.js";
import Plot from "react-plotly.js";
import { solarizedLayout, SOLARIZED_PALETTE } from "../../lib/chartTheme";

export interface FEVDChartDatum {
  variable: string;
  horizon: number[];
  decomposition: { shock: string; values: number[] }[];
}

interface FEVDChartProps {
  data: FEVDChartDatum[];
}

export function FEVDChart({ data }: FEVDChartProps) {
  const useSinglePlot = data.length <= 1;

  if (useSinglePlot) {
    const item = data[0];
    if (!item) return null;

    const shockNames = item.decomposition.map((d) => d.shock);

    const traces: Plotly.Data[] = shockNames.map((shock, i) => {
      const dec = item.decomposition.find((d) => d.shock === shock)!;
      return {
        x: item.horizon,
        y: dec.values,
        name: shock,
        type: "bar" as const,
        marker: { color: SOLARIZED_PALETTE[i % SOLARIZED_PALETTE.length] },
      };
    });

    const layout: Partial<Plotly.Layout> = {
      ...solarizedLayout,
      barmode: "stack",
      title: { text: `FEVD: ${item.variable}`, font: { color: "#073642", size: 13 } },
      xaxis: { ...solarizedLayout.xaxis, title: { text: "Horizon", font: { color: "#586e75" } } },
      yaxis: { ...solarizedLayout.yaxis, title: { text: "Share of Variance", font: { color: "#586e75" } }, range: [0, 1.05] },
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

  // Multiple variables: subplot grid
  const nVars = data.length;
  const cols = Math.min(nVars, 3);
  const rows = Math.ceil(nVars / cols);

  const allShocks = Array.from(
    new Set(data.flatMap((d) => d.decomposition.map((dec) => dec.shock))),
  );

  const traces: Plotly.Data[] = [];
  const layout: Partial<Layout> = {
    ...solarizedLayout,
    barmode: "stack",
    title: { text: "Forecast Error Variance Decomposition", font: { color: "#073642", size: 13 } },
    grid: { rows, columns: cols, pattern: "independent" as const },
    height: rows * 280 + 60,
  };

  const legendShown = new Set<string>();

  data.forEach((item, vi) => {
    const axIdx = vi === 0 ? "" : String(vi + 1);
    const xAxisKey = `xaxis${axIdx}`;
    const yAxisKey = `yaxis${axIdx}`;
    const xRef = vi === 0 ? "x" : `x${vi + 1}`;
    const yRef = vi === 0 ? "y" : `y${vi + 1}`;

    (layout as Record<string, unknown>)[xAxisKey] = {
      gridcolor: "#eee8d5", zerolinecolor: "#93a1a1",
      title: { text: "Horizon", font: { color: "#586e75", size: 9 } },
    };
    (layout as Record<string, unknown>)[yAxisKey] = {
      gridcolor: "#eee8d5", zerolinecolor: "#93a1a1",
      title: { text: item.variable, font: { color: "#586e75", size: 9 } },
      range: [0, 1.05],
    };

    allShocks.forEach((shock, si) => {
      const dec = item.decomposition.find((d) => d.shock === shock);
      const values = dec ? dec.values : item.horizon.map(() => 0);
      const showLeg = !legendShown.has(shock);
      if (showLeg) legendShown.add(shock);

      traces.push({
        x: item.horizon, y: values, name: shock, type: "bar" as const,
        marker: { color: SOLARIZED_PALETTE[si % SOLARIZED_PALETTE.length] },
        xaxis: xRef, yaxis: yRef, showlegend: showLeg, legendgroup: shock,
      } as Plotly.Data);
    });
  });

  return (
    <Plot
      data={traces}
      layout={layout as Partial<Layout>}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true, displayModeBar: false }}
    />
  );
}
