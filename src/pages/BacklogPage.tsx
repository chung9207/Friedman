import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { useOutputStore } from "../stores/outputStore";

const LEVEL_COLORS: Record<string, string> = {
  info: "text-[var(--text-secondary)]",
  warn: "text-[var(--warning)]",
  error: "text-[var(--error)]",
  success: "text-[var(--success)]",
};

export default function BacklogPage() {
  const lines = useOutputStore((s) => s.lines);
  const clear = useOutputStore((s) => s.clear);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Sidecar Output Log
        </h2>
        {lines.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors min-h-[44px] md:min-h-0"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Log content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {lines.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[var(--text-muted)]">
              No output yet. Run commands from the Journal to see sidecar output here.
            </p>
          </div>
        ) : (
          <div className="font-mono text-xs leading-relaxed space-y-0.5">
            {lines.map((line) => {
              const time = new Date(line.timestamp);
              const ts = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}:${String(time.getSeconds()).padStart(2, "0")}`;
              return (
                <div
                  key={line.id}
                  className={`whitespace-pre-wrap break-all ${LEVEL_COLORS[line.level] ?? ""}`}
                >
                  <span className="text-[var(--text-muted)] select-none">[{ts}] </span>
                  {line.message}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
