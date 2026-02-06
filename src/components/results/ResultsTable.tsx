interface ResultsTableProps {
  data: Record<string, unknown>;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "--";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(6);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function isNestedObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function ResultsTable({ data }: ResultsTableProps) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <p className="text-xs text-[var(--text-muted)] italic">No results.</p>
    );
  }

  return (
    <div className="overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-semibold">
              Key
            </th>
            <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-semibold">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr
              key={key}
              className="border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <td className="px-3 py-2 text-[var(--text-primary)] font-medium align-top whitespace-nowrap">
                {key}
              </td>
              <td className="px-3 py-2 text-[var(--text-secondary)] align-top">
                {isNestedObject(value) ? (
                  <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span className="whitespace-pre-wrap">
                    {formatValue(value)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
