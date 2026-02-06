interface Coefficient {
  name: string;
  estimate: number;
  std_error: number;
  t_stat: number;
  p_value: number;
}

interface CoefficientTableProps {
  coefficients: Coefficient[];
}

function formatNum(val: number, decimals = 4): string {
  return val.toFixed(decimals);
}

function significanceStars(p: number): string {
  if (p < 0.001) return "***";
  if (p < 0.01) return "**";
  if (p < 0.05) return "*";
  if (p < 0.1) return ".";
  return "";
}

export function CoefficientTable({ coefficients }: CoefficientTableProps) {
  if (coefficients.length === 0) {
    return (
      <p className="text-xs text-[var(--text-muted)] italic">
        No coefficients to display.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-semibold">
              Variable
            </th>
            <th className="text-right px-3 py-2 text-[var(--text-secondary)] font-semibold">
              Estimate
            </th>
            <th className="text-right px-3 py-2 text-[var(--text-secondary)] font-semibold">
              Std. Error
            </th>
            <th className="text-right px-3 py-2 text-[var(--text-secondary)] font-semibold">
              t-Stat
            </th>
            <th className="text-right px-3 py-2 text-[var(--text-secondary)] font-semibold">
              p-Value
            </th>
          </tr>
        </thead>
        <tbody>
          {coefficients.map((coeff) => {
            const isSignificant = coeff.p_value < 0.05;
            return (
              <tr
                key={coeff.name}
                className={`border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors ${
                  isSignificant ? "bg-[var(--accent)]/5" : ""
                }`}
              >
                <td className="px-3 py-2 text-[var(--text-primary)] font-medium">
                  {coeff.name}
                </td>
                <td className="px-3 py-2 text-[var(--text-secondary)] text-right font-mono">
                  {formatNum(coeff.estimate)}
                </td>
                <td className="px-3 py-2 text-[var(--text-secondary)] text-right font-mono">
                  {formatNum(coeff.std_error)}
                </td>
                <td className="px-3 py-2 text-[var(--text-secondary)] text-right font-mono">
                  {formatNum(coeff.t_stat)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-mono ${
                    isSignificant
                      ? "text-[var(--accent)] font-semibold"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {formatNum(coeff.p_value)}{" "}
                  <span className="text-[var(--accent)]">
                    {significanceStars(coeff.p_value)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-3 py-1.5 text-[10px] text-[var(--text-muted)] border-t border-[var(--border-color)]">
        Signif. codes: 0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1
      </div>
    </div>
  );
}
