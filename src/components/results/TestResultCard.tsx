interface TestResultCardProps {
  testName: string;
  statistic: number;
  pValue: number;
  threshold?: number;
}

function significanceStars(p: number): string {
  if (p < 0.001) return "***";
  if (p < 0.01) return "**";
  if (p < 0.05) return "*";
  if (p < 0.1) return ".";
  return "";
}

export function TestResultCard({
  testName,
  statistic,
  pValue,
  threshold = 0.05,
}: TestResultCardProps) {
  const rejected = pValue < threshold;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            {testName}
          </h4>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-secondary)]">
                Test Statistic:
              </span>
              <span className="font-mono text-[var(--text-primary)]">
                {statistic.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-secondary)]">p-Value:</span>
              <span
                className={`font-mono font-semibold ${
                  rejected
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {pValue.toFixed(6)}
              </span>
              <span className="text-[var(--accent)] font-semibold">
                {significanceStars(pValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Pass / Fail indicator */}
        <div
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
            rejected
              ? "bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/30"
              : "bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30"
          }`}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              rejected ? "bg-[var(--error)]" : "bg-[var(--success)]"
            }`}
          />
          {rejected ? "Reject H0" : "Fail to Reject"}
        </div>
      </div>

      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        Significance level: {(threshold * 100).toFixed(0)}%
      </p>
    </div>
  );
}
