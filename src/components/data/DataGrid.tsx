import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";

interface DataGridProps {
  columns: string[];
  data: Record<string, unknown>[];
  maxHeight?: string;
}

/**
 * Determines if a value looks numeric so we can apply monospace styling.
 */
function isNumeric(val: unknown): boolean {
  if (val == null || val === "") return false;
  return !isNaN(Number(val));
}

export function DataGrid({
  columns,
  data,
  maxHeight = "calc(100vh - 200px)",
}: DataGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columnHelper = createColumnHelper<Record<string, unknown>>();

  const tableColumns = useMemo<ColumnDef<Record<string, unknown>, unknown>[]>(
    () =>
      columns.map((col) =>
        columnHelper.accessor((row) => row[col], {
          id: col,
          header: col,
          cell: (info) => {
            const value = info.getValue();
            const displayVal =
              value == null ? "" : String(value);
            const numeric = isNumeric(value);
            return (
              <span
                className={numeric ? "font-mono" : ""}
                style={numeric ? { textAlign: "right", display: "block" } : undefined}
              >
                {displayVal}
              </span>
            );
          },
          sortingFn: "auto",
        }),
      ),
    [columns, columnHelper],
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col border border-[var(--border-color)] rounded overflow-hidden">
      {/* Scrollable table area */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-3 py-2 text-left text-[var(--text-secondary)] font-semibold bg-[var(--bg-surface)] border-b border-[var(--border-color)] cursor-pointer select-none whitespace-nowrap hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span className="text-[var(--text-muted)] text-[10px]">
                          {sorted === "asc"
                            ? " \u25B2"
                            : sorted === "desc"
                              ? " \u25BC"
                              : ""}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`
                  ${rowIndex % 2 === 0 ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-secondary)]"}
                  hover:bg-[var(--bg-hover)] transition-colors
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-1.5 text-[var(--text-primary)] border-b border-[var(--border-color)]/30 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with row count */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-surface)] border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)]">
        <span>
          {data.length.toLocaleString()} row{data.length !== 1 ? "s" : ""}
          {" \u00B7 "}
          {columns.length} column{columns.length !== 1 ? "s" : ""}
        </span>
        {sorting.length > 0 && (
          <span>
            Sorted by {sorting[0].id} ({sorting[0].desc ? "desc" : "asc"})
          </span>
        )}
      </div>
    </div>
  );
}
