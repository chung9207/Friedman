import type { Layout } from "plotly.js";
import Plot from "react-plotly.js";
import { solarizedLayout, SOLARIZED_PALETTE } from "../../lib/chartTheme";

export interface HDChartDatum {
  variable: string;
  dates: string[];
  contributions: { shock: string; values: number[] }[];
}

interface HDChartProps {
  data: HDChartDatum[];
}

export function HDChart({ data }: HDChartProps) {
  const useSinglePlot = data.length <= 1;

  if (useSinglePlot) {
    const item = data[0];
    if (!item) return null;

    const traces: Plotly.Data[] = item.contributions.map((contrib, i) => ({
      x: item.dates,
      y: contrib.values,
      name: contrib.shock,
      type: "bar" as const,
      marker: { color: SOLARIZED_PALETTE[i % SOLARIZED_PALETTE.length] },
    }));

    const layout: Partial<Plotly.Layout> = {
      ...solarizedLayout,
      barmode: "relative",
      title: { text: `Historical Decomposition: ${item.variable}`, font: { color: "#073642", size: 13 } },
      xaxis: {
        ...solarizedLayout.xaxis,
        title: { text: "Date", font: { color: "#586e75" } },
        type: "category", tickangle: -45, nticks: 20,
      },
      yaxis: { ...solarizedLayout.yaxis, title: { text: "Contribution", font: { color: "#586e75" } } },
      shapes: [
        {
          type: "line", x0: 0, x1: 1, xref: "paper",
          y0: 0, y1: 0, yref: "y",
          line: { color: "#93a1a1", width: 1, dash: "dash" },
        },
      ],
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
  const cols = Math.min(nVars, 2);
  const rows = Math.ceil(nVars / cols);

  const allShocks = Array.from(
    new Set(data.flatMap((d) => d.contributions.map((c) => c.shock))),
  );

  const traces: Plotly.Data[] = [];
  const layout: Partial<Layout> = {
    ...solarizedLayout,
    barmode: "relative",
    title: { text: "Historical Decomposition", font: { color: "#073642", size: 13 } },
    grid: { rows, columns: cols, pattern: "independent" as const },
    height: rows * 300 + 60,
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
      title: { text: "Date", font: { color: "#586e75", size: 9 } },
      type: "category", tickangle: -45, nticks: 15,
    };
    (layout as Record<string, unknown>)[yAxisKey] = {
      gridcolor: "#eee8d5", zerolinecolor: "#93a1a1",
      title: { text: item.variable, font: { color: "#586e75", size: 9 } },
    };

    allShocks.forEach((shock, si) => {
      const contrib = item.contributions.find((c) => c.shock === shock);
      const values = contrib ? contrib.values : item.dates.map(() => 0);
      const showLeg = !legendShown.has(shock);
      if (showLeg) legendShown.add(shock);

      traces.push({
        x: item.dates, y: values, name: shock, type: "bar" as const,
        marker: { color: SOLARIZED_PALETTE[si % SOLARIZED_PALETTE.length] },
        xaxis: xRef, yaxis: yRef, showlegend: showLeg, legendgroup: shock,
      } as Plotly.Data);
    });
  });

  const shapes = data.map((_, i) => {
    const yRef = i === 0 ? "y" : `y${i + 1}`;
    const xRef = i === 0 ? "x" : `x${i + 1}`;
    return {
      type: "line" as const,
      x0: 0, x1: 1,
      xref: `${xRef} domain` as Plotly.XAxisName,
      y0: 0, y1: 0,
      yref: yRef as Plotly.YAxisName,
      line: { color: "#93a1a1", width: 1, dash: "dash" as const },
    };
  });
  (layout as Record<string, unknown>)["shapes"] = shapes;

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
