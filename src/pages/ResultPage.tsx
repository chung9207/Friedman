import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { useResultStore, type SavedResult } from "../stores/resultStore";
import { COMMAND_LABELS } from "../lib/journalFlow";
import { getChartForCommand } from "../lib/resultCharts";
import { IRFChart, type IRFChartDatum } from "../components/charts/IRFChart";
import { FEVDChart } from "../components/charts/FEVDChart";
import { HDChart } from "../components/charts/HDChart";
import { ForecastChart } from "../components/charts/ForecastChart";
import { ScreePlot } from "../components/charts/ScreePlot";

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function chartContainerHeight(chart: { type: string; data: unknown }): number {
  if (chart.type === "irf") {
    const irfData = chart.data as IRFChartDatum[];
    if (irfData.length > 1) {
      const cols = Math.min(irfData.length, 3);
      const rows = Math.ceil(irfData.length / cols);
      return rows * 280 + 80;
    }
  }
  return 350;
}

function ResultDataView({ command, data }: { command: string; data: unknown }) {
  const chart = getChartForCommand(command, data);
  const [showRaw, setShowRaw] = useState(false);

  if (!chart) {
    return (
      <div>
        <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
          Result
        </p>
        <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono bg-[var(--bg-primary)] border border-[var(--border-color)] rounded p-3 max-h-80 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  const height = chartContainerHeight(chart);

  return (
    <div>
      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
        Result
      </p>
      <div style={{ height }} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded">
        {chart.type === "irf" && <IRFChart data={chart.data} />}
        {chart.type === "fevd" && <FEVDChart data={chart.data} />}
        {chart.type === "hd" && <HDChart data={chart.data} />}
        {chart.type === "forecast" && <ForecastChart data={chart.data} />}
        {chart.type === "scree" && <ScreePlot data={chart.data} />}
      </div>
      <button
        onClick={() => setShowRaw((v) => !v)}
        className="flex items-center gap-1 mt-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        {showRaw ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Raw Data
      </button>
      {showRaw && (
        <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono bg-[var(--bg-primary)] border border-[var(--border-color)] rounded p-3 max-h-80 overflow-auto mt-1">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function ResultCard({ result, onRemove }: { result: SavedResult; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const label = COMMAND_LABELS[result.command] ?? result.label;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-h-[44px]"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
            {label}
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {formatTimestamp(result.timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[var(--border-color)] p-3">
          {/* Params summary */}
          {Object.keys(result.params).length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
                Parameters
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.params).map(([k, v]) => (
                  <span
                    key={k}
                    className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-[var(--text-secondary)]"
                  >
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chart + raw data */}
          <ResultDataView command={result.command} data={result.data} />
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  const results = useResultStore((s) => s.results);
  const removeResult = useResultStore((s) => s.removeResult);
  const clearAll = useResultStore((s) => s.clearAll);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Saved Results ({results.length})
        </h2>
        {results.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors min-h-[44px] md:min-h-0"
          >
            <Trash2 size={12} />
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BarChart3 size={48} className="text-[var(--text-muted)] mb-4" />
            <p className="text-sm text-[var(--text-secondary)]">
              No results yet.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Use the Journal to run analyses. Results will be saved here automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl mx-auto">
            {results.map((r) => (
              <ResultCard
                key={r.id}
                result={r}
                onRemove={() => removeResult(r.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
