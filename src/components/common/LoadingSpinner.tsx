export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent)]"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
