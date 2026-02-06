import { useState, useEffect } from "react";
import { Trash2, Database } from "lucide-react";
import { DataImport } from "../components/data/DataImport";
import { DataGrid } from "../components/data/DataGrid";
import { useProjectStore } from "../stores/projectStore";
import { previewData } from "../api/commands";

export default function DataPage() {
  const datasets = useProjectStore((s) => s.datasets);
  const activeDatasetId = useProjectStore((s) => s.activeDatasetId);
  const setActiveDataset = useProjectStore((s) => s.setActiveDataset);
  const removeDataset = useProjectStore((s) => s.removeDataset);

  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId);

  useEffect(() => {
    if (!activeDatasetId) {
      setPreviewColumns([]);
      setPreviewRows([]);
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);
    previewData(activeDatasetId, 100)
      .then((result) => {
        if (!cancelled) {
          setPreviewColumns(result.columns);
          setPreviewRows(result.rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewColumns(activeDataset?.columns ?? []);
          setPreviewRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });

    return () => { cancelled = true; };
  }, [activeDatasetId, activeDataset?.columns]);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      {/* Import section */}
      <DataImport />

      {/* Dataset cards */}
      {datasets.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Loaded Datasets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {datasets.map((ds) => {
              const isActive = ds.id === activeDatasetId;
              return (
                <button
                  key={ds.id}
                  onClick={() => setActiveDataset(ds.id)}
                  className={`text-left p-3 rounded border transition-colors min-h-[44px]
                    ${isActive
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Database size={14} className="shrink-0 text-[var(--accent)]" />
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {ds.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDataset(ds.id);
                        if (isActive) setActiveDataset(null);
                      }}
                      className="shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                      title="Remove dataset"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    {ds.row_count.toLocaleString()} rows, {ds.columns.length} columns
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Data grid preview */}
      {activeDataset && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Preview: {activeDataset.name}
          </h3>
          {loadingPreview ? (
            <p className="text-xs text-[var(--text-muted)]">Loading preview...</p>
          ) : previewRows.length > 0 ? (
            <DataGrid
              columns={previewColumns}
              data={previewRows}
              maxHeight="calc(100vh - 420px)"
            />
          ) : (
            <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-4">
              <p>Columns: {activeDataset.columns.join(", ")}</p>
              <p className="mt-1">{activeDataset.row_count.toLocaleString()} rows</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {datasets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Database size={48} className="text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">
            No datasets loaded yet.
          </p>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Use the import form above to load a CSV or Excel file.
          </p>
        </div>
      )}
    </div>
  );
}
