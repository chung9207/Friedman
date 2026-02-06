import { useEffect, useState } from "react";
import { DataGrid } from "./DataGrid";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorBanner } from "../common/ErrorBanner";
import { previewData } from "../../api/commands";

interface DataPreviewProps {
  datasetId: string;
}

export function DataPreview({ datasetId }: DataPreviewProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPreview() {
      setLoading(true);
      setError(null);
      setColumns([]);
      setRows([]);

      try {
        const result = await previewData(datasetId, 100);
        if (!cancelled) {
          setColumns(result.columns);
          setRows(result.rows);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPreview();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-[var(--text-muted)] text-sm">
        <LoadingSpinner size={20} />
        <span>Loading data preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorBanner message={`Failed to load preview: ${error}`} />
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--text-muted)] text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Data Preview
        </h3>
        <span className="text-[10px] text-[var(--text-muted)]">
          Showing up to 100 rows
        </span>
      </div>
      <DataGrid
        columns={columns}
        data={rows}
        maxHeight="calc(100vh - 260px)"
      />
    </div>
  );
}
