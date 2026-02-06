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

  return (
    <nav className="flex bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
      {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
        const isActive = activePage === page;
        return (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`flex-1 flex items-center justify-center gap-2 h-14 md:h-14 min-h-[44px] text-sm md:text-base font-medium transition-colors relative
              ${isActive
                ? "text-[var(--accent)] bg-[var(--bg-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }
            `}
          >
            <Icon size={18} />
            <span>{label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--accent)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
