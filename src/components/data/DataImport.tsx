import { useState, useCallback } from "react";
import { FileSelector } from "../common/FileSelector";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { loadCsv, loadExcel } from "../../api/commands";
import { useProjectStore } from "../../stores/projectStore";
import { useOutputStore } from "../../stores/outputStore";

type FileFormat = "csv" | "xlsx" | "unknown";

/**
 * Detect file format from file extension.
 */
function detectFormat(path: string): FileFormat {
  const lower = path.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "xlsx";
  return "unknown";
}

/**
 * Extract the file name from a full path.
 */
function getFileName(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path;
}

interface PreviewRow {
  [key: string]: unknown;
}

export function DataImport() {
  const [filePath, setFilePath] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [_previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [imported, setImported] = useState(false);

  const addDataset = useProjectStore((s) => s.addDataset);
  const setActiveDataset = useProjectStore((s) => s.setActiveDataset);
  const addLine = useOutputStore((s) => s.addLine);

  const format = filePath ? detectFormat(filePath) : null;

  /**
   * When a file is selected, attempt to load a preview of the first 10 rows.
   */
  const handleFileChange = useCallback(
    async (path: string) => {
      setFilePath(path);
      setError(null);
      setImported(false);
      setPreviewColumns([]);
      setPreviewRows([]);

      if (!path) return;

      const fmt = detectFormat(path);
      if (fmt === "unknown") {
        setError("Unsupported file format. Please select a CSV or XLSX file.");
        return;
      }

      setLoading(true);
      try {
        // Load the full dataset to get a preview
        // The backend returns DatasetInfo; we reload to show preview rows
        let dsInfo;
        if (fmt === "csv") {
          dsInfo = await loadCsv(path);
        } else {
          dsInfo = await loadExcel(path, sheetName);
        }
        setPreviewColumns(dsInfo.columns);
        // We don't have the raw rows from DatasetInfo, so we store the info
        // and use the column names for the preview table header.
        // The preview rows will be populated on successful import.
        // For now we just store the dataset info for preview display.

        // Clean up: remove this temporary dataset from the store since
        // we are only previewing. We'll re-import on the Import button.
        // Actually, let's keep this dataset in memory and just show the info.
        // We'll remove it if user cancels or re-selects.
        setPreviewColumns(dsInfo.columns);
        setPreviewRows([]); // Will be populated separately if backend supports it
        addLine("info", `Preview loaded: ${getFileName(path)} (${dsInfo.columns.length} columns, ${dsInfo.row_count} rows)`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to preview file: ${msg}`);
        addLine("error", `Preview failed for ${getFileName(path)}: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [sheetName, addLine],
  );

  /**
   * Import the selected file into the project store.
   */
  async function handleImport() {
    if (!filePath) return;

    const fmt = detectFormat(filePath);
    if (fmt === "unknown") {
      setError("Unsupported file format.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let dsInfo;
      if (fmt === "csv") {
        dsInfo = await loadCsv(filePath);
      } else {
        dsInfo = await loadExcel(filePath, sheetName);
      }

      addDataset(dsInfo);
      setActiveDataset(dsInfo.id);
      setImported(true);
      addLine(
        "success",
        `Imported ${dsInfo.name}: ${dsInfo.row_count} rows, ${dsInfo.columns.length} columns`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Import failed: ${msg}`);
      addLine("error", `Import failed for ${getFileName(filePath)}: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
        Import Data
      </h2>

      <div className="space-y-4 w-full max-w-2xl">
        {/* File selector */}
        <FileSelector
          value={filePath}
          onChange={handleFileChange}
          label="Data File"
          extensions={["csv", "xlsx", "xls"]}
        />

        {/* Detected format */}
        {filePath && format && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--text-secondary)]">Detected format:</span>
            <span
              className={`px-2 py-0.5 rounded font-medium ${
                format === "unknown"
                  ? "bg-[var(--error)]/15 text-[var(--error)]"
                  : "bg-[var(--accent)]/15 text-[var(--accent)]"
              }`}
            >
              {format.toUpperCase()}
            </span>
          </div>
        )}

        {/* Sheet name for Excel files */}
        {format === "xlsx" && (
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 font-medium">
              Sheet Name
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Sheet1"
              className="w-full sm:w-48 px-2 py-1.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--error)]/15 border border-[var(--error)]/30 rounded text-xs text-[var(--error)]">
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Preview table */}
        {previewColumns.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
              Column Preview
            </h3>
            <div className="overflow-x-auto border border-[var(--border-color)] rounded">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-[var(--text-secondary)] font-semibold bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-[var(--text-secondary)] font-semibold bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
                      Column Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewColumns.slice(0, 10).map((col, idx) => (
                    <tr
                      key={col}
                      className={`${
                        idx % 2 === 0
                          ? "bg-[var(--bg-primary)]"
                          : "bg-[var(--bg-secondary)]"
                      } hover:bg-[var(--bg-hover)] transition-colors`}
                    >
                      <td className="px-3 py-1.5 text-[var(--text-muted)] font-mono border-b border-[var(--border-color)]/30">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-1.5 text-[var(--text-primary)] border-b border-[var(--border-color)]/30">
                        {col}
                      </td>
                    </tr>
                  ))}
                  {previewColumns.length > 10 && (
                    <tr className="bg-[var(--bg-secondary)]">
                      <td
                        colSpan={2}
                        className="px-3 py-1.5 text-center text-[var(--text-muted)] italic border-b border-[var(--border-color)]/30"
                      >
                        ... and {previewColumns.length - 10} more columns
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import button */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleImport}
            disabled={loading || !filePath || format === "unknown" || imported}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <LoadingSpinner size={14} />}
            {loading ? "Importing..." : imported ? "Imported" : "Import"}
          </button>

          {imported && (
            <span className="text-xs text-[var(--success)]">
              Dataset imported successfully
            </span>
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <LoadingSpinner size={16} />
            <span>Processing file...</span>
          </div>
        )}
      </div>
    </div>
  );
}
