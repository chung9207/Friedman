import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";

interface FileSelectorProps {
  value: string;
  onChange: (path: string) => void;
  label?: string;
  extensions?: string[];
}

export function FileSelector({
  value,
  onChange,
  label = "Data File",
  extensions = ["csv", "xlsx", "xls"],
}: FileSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  async function handleBrowse() {
    try {
      setLoading(true);
      const selected = await open({
        multiple: false,
        filters: [{ name: "Data Files", extensions }],
      });
      if (selected) {
        const path = String(selected);
        setDraft(path);
        onChange(path);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && draft.trim()) {
      onChange(draft.trim());
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-xs text-[var(--text-secondary)] mb-1 font-medium">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Select a file or type path and press Enter..."
          className="flex-1 px-2 py-1.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          onClick={handleBrowse}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 transition-colors"
          title="Browse files"
        >
          <FolderOpen size={12} />
          {loading ? "Opening..." : "Browse"}
        </button>
      </div>
    </div>
  );
}
