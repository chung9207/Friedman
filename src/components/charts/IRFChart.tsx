import type { Layout } from "plotly.js";
import Plot from "react-plotly.js";
import { solarizedLayout, SOLARIZED_PALETTE } from "../../lib/chartTheme";

export interface IRFChartDatum {
  impulse: string;
  response: string;
  horizon: number[];
  irf: number[];
  lower?: number[];
  upper?: number[];
}

interface IRFChartProps {
  data: IRFChartDatum[];
}

export function IRFChart({ data }: IRFChartProps) {
  const useSinglePlot = data.length <= 1;

  if (useSinglePlot) {
    const traces: Plotly.Data[] = [];
    data.forEach((d, i) => {
      const color = SOLARIZED_PALETTE[i % SOLARIZED_PALETTE.length];
      const name = `${d.impulse} -> ${d.response}`;

      if (d.upper) {
        traces.push({
          x: d.horizon,
          y: d.upper,
          mode: "lines",
          line: { width: 0 },
          showlegend: false,
          name: `${name} upper`,
          hoverinfo: "skip",
        });
      }

      if (d.lower && d.upper) {
        traces.push({
          x: d.horizon,
          y: d.lower,
          mode: "lines",
          line: { width: 0 },
          fill: "tonexty",
          fillcolor: `${color}26`,
          showlegend: false,
          name: `${name} lower`,
          hoverinfo: "skip",
        });
      }

      traces.push({
        x: d.horizon,
        y: d.irf,
        mode: "lines+markers",
        line: { color, width: 2 },
        marker: { size: 4, color },
        name,
      });
    });

    const layout: Partial<Plotly.Layout> = {
      ...solarizedLayout,
      title: { text: "Impulse Response Functions", font: { color: "#073642", size: 13 } },
      xaxis: { ...solarizedLayout.xaxis, title: { text: "Horizon", font: { color: "#586e75" } } },
      yaxis: { ...solarizedLayout.yaxis, title: { text: "Response", font: { color: "#586e75" } } },
      shapes: [
        {
          type: "line",
          x0: 0, x1: 1, xref: "paper",
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

  // Multiple pairs: subplots
  const nPairs = data.length;
  const cols = Math.min(nPairs, 3);
  const rows = Math.ceil(nPairs / cols);

  const traces: Plotly.Data[] = [];
  const layout: Partial<Layout> = {
    ...solarizedLayout,
    title: { text: "Impulse Response Functions", font: { color: "#073642", size: 13 } },
    grid: { rows, columns: cols, pattern: "independent" as const },
    height: rows * 250 + 60,
  };

  data.forEach((d, i) => {
    const color = SOLARIZED_PALETTE[i % SOLARIZED_PALETTE.length];
    const axIdx = i === 0 ? "" : String(i + 1);
    const xAxisKey = `xaxis${axIdx}`;
    const yAxisKey = `yaxis${axIdx}`;
    const xRef = i === 0 ? "x" : `x${i + 1}`;
    const yRef = i === 0 ? "y" : `y${i + 1}`;

    (layout as Record<string, unknown>)[xAxisKey] = {
      gridcolor: "#eee8d5",
      zerolinecolor: "#93a1a1",
      title: { text: "Horizon", font: { color: "#586e75", size: 9 } },
    };
    (layout as Record<string, unknown>)[yAxisKey] = {
      gridcolor: "#eee8d5",
      zerolinecolor: "#93a1a1",
      title: { text: `${d.impulse}->${d.response}`, font: { color: "#586e75", size: 9 } },
    };

    if (d.upper) {
      traces.push({
        x: d.horizon, y: d.upper, mode: "lines", line: { width: 0 },
        showlegend: false, xaxis: xRef, yaxis: yRef, hoverinfo: "skip",
      } as Plotly.Data);
    }

    if (d.lower && d.upper) {
      traces.push({
        x: d.horizon, y: d.lower, mode: "lines", line: { width: 0 },
        fill: "tonexty", fillcolor: `${color}26`,
        showlegend: false, xaxis: xRef, yaxis: yRef, hoverinfo: "skip",
      } as Plotly.Data);
    }

    traces.push({
      x: d.horizon, y: d.irf, mode: "lines+markers",
      line: { color, width: 2 }, marker: { size: 3, color },
      name: `${d.impulse}->${d.response}`, xaxis: xRef, yaxis: yRef,
    } as Plotly.Data);
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
