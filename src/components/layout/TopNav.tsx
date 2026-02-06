import { useRef, useEffect, useState, useCallback } from "react";
import { Database, BookOpen, BarChart3, ScrollText } from "lucide-react";
import { useNavigationStore, type Page } from "../../stores/navigationStore";

const NAV_ITEMS: { page: Page; label: string; icon: typeof Database }[] = [
  { page: "data", label: "Data", icon: Database },
  { page: "journal", label: "Journal", icon: BookOpen },
  { page: "result", label: "Result", icon: BarChart3 },
  { page: "backlog", label: "Backlog", icon: ScrollText },
];

export function TopNav() {
  const activePage = useNavigationStore((s) => s.activePage);
  const setActivePage = useNavigationStore((s) => s.setActivePage);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<Page, HTMLButtonElement>>(new Map());
  const [highlight, setHighlight] = useState({ left: 0, width: 0 });

  const updateHighlight = useCallback(() => {
    const btn = buttonRefs.current.get(activePage);
    const container = containerRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setHighlight({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activePage]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [updateHighlight]);

  return (
    <nav className="flex justify-center py-2 sm:py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
      <div
        ref={containerRef}
        className="relative flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-1"
      >
        {/* Sliding highlight */}
        <div
          className="absolute top-1 bottom-1 rounded-md bg-[var(--accent)] shadow-sm transition-all duration-300 ease-in-out"
          style={{ left: highlight.left, width: highlight.width }}
        />

        {NAV_ITEMS.map(({ page, label, icon: _Icon }) => {
          const isActive = activePage === page;
          return (
            <button
              key={page}
              ref={(el) => { if (el) buttonRefs.current.set(page, el); }}
              onClick={() => setActivePage(page)}
              className={`relative z-10 px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center text-sm font-medium rounded-md transition-colors duration-300
                ${isActive
                  ? "text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }
              `}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
