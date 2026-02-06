import { X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--error)]/15 border border-[var(--error)]/30 rounded text-xs text-[var(--error)]">
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 hover:text-[var(--text-primary)] transition-colors"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
