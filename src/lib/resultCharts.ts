import type { IRFChartDatum } from "../components/charts/IRFChart";
import type { FEVDChartDatum } from "../components/charts/FEVDChart";
import type { HDChartDatum } from "../components/charts/HDChart";
import type { ForecastChartData } from "../components/charts/ForecastChart";
import type { ScreePlotDatum } from "../components/charts/ScreePlot";

// ── Helpers ──────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function isRowArray(data: unknown): data is Row[] {
  return Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null;
}

function num(v: unknown): number {
  return typeof v === "number" ? v : Number(v);
}

// ── IRF Transform ────────────────────────────────────────────────────────────

const CI_SUFFIXES = ["_lower", "_upper", "_16pct", "_84pct"];

export function transformIRF(data: unknown): IRFChartDatum[] | null {
  if (!isRowArray(data)) return null;

  const keys = Object.keys(data[0]);
  if (!keys.includes("horizon")) return null;

  // Find base variable names (not horizon, not CI bands)
  const baseVars = keys.filter(
    (k) => k !== "horizon" && !CI_SUFFIXES.some((s) => k.endsWith(s))
  );
  if (baseVars.length === 0) return null;

  const horizons = data.map((r) => num(r.horizon));

  return baseVars.map((varName) => {
    const irf = data.map((r) => num(r[varName]));

    // Try both naming conventions for CI bands
    const lowerKey = keys.find((k) => k === `${varName}_lower` || k === `${varName}_16pct`);
    const upperKey = keys.find((k) => k === `${varName}_upper` || k === `${varName}_84pct`);

    const datum: IRFChartDatum = {
      impulse: "Shock",
      response: varName,
      horizon: [...horizons],
      irf,
    };

    if (lowerKey) datum.lower = data.map((r) => num(r[lowerKey]));
    if (upperKey) datum.upper = data.map((r) => num(r[upperKey]));

    return datum;
  });
}

// ── FEVD Transform ───────────────────────────────────────────────────────────

export function transformFEVD(data: unknown): FEVDChartDatum[] | null {
  if (!isRowArray(data)) return null;

  const keys = Object.keys(data[0]);
  if (!keys.includes("horizon")) return null;

  const shockNames = keys.filter((k) => k !== "horizon");
  if (shockNames.length === 0) return null;

  const horizons = data.map((r) => num(r.horizon));

  const decomposition = shockNames.map((shock) => ({
    shock,
    values: data.map((r) => num(r[shock])),
  }));

  return [
    {
      variable: "Response",
      horizon: horizons,
      decomposition,
    },
  ];
}

// ── HD Transform ─────────────────────────────────────────────────────────────

export function transformHD(data: unknown): HDChartDatum[] | null {
  if (!isRowArray(data)) return null;

  const keys = Object.keys(data[0]);
  if (!keys.includes("period")) return null;

  const contribKeys = keys.filter((k) => k.startsWith("contrib_"));
  if (contribKeys.length === 0) return null;

  const dates = data.map((r) => String(r.period));

  const contributions = contribKeys.map((k) => ({
    shock: k.replace(/^contrib_/, ""),
    values: data.map((r) => num(r[k])),
  }));

  return [
    {
      variable: "Variable",
      dates,
      contributions,
    },
  ];
}

// ── Forecast Transform ───────────────────────────────────────────────────────

export function transformForecast(data: unknown): ForecastChartData | null {
  if (!isRowArray(data)) return null;

  const keys = Object.keys(data[0]);
  if (!keys.includes("forecast")) return null;

  const dates = data.map((r) =>
    r.horizon != null ? String(r.horizon) : String(r.period ?? "")
  );
  const forecast = data.map((r) => num(r.forecast));

  const result: ForecastChartData = {
    dates,
    actual: [],
    forecast,
  };

  if (keys.includes("ci_lower")) result.lower = data.map((r) => num(r.ci_lower));
  if (keys.includes("ci_upper")) result.upper = data.map((r) => num(r.ci_upper));

  return result;
}

// ── Scree Transform ──────────────────────────────────────────────────────────

export function transformScree(data: unknown): ScreePlotDatum[] | null {
  if (!isRowArray(data)) return null;

  const keys = Object.keys(data[0]);
  if (!keys.includes("component") || !keys.includes("eigenvalue") || !keys.includes("cumulative")) {
    return null;
  }

  return data.map((r) => ({
    factor: num(r.component),
    eigenvalue: num(r.eigenvalue),
    cumulative_variance: num(r.cumulative),
  }));
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export type ChartMatch =
  | { type: "irf"; data: IRFChartDatum[] }
  | { type: "fevd"; data: FEVDChartDatum[] }
  | { type: "hd"; data: HDChartDatum[] }
  | { type: "forecast"; data: ForecastChartData }
  | { type: "scree"; data: ScreePlotDatum[] };

export function getChartForCommand(command: string, data: unknown): ChartMatch | null {
  switch (command) {
    case "var-irf":
    case "bvar-irf":
    case "lp-irf": {
      const result = transformIRF(data);
      return result ? { type: "irf", data: result } : null;
    }
    case "var-fevd":
    case "bvar-fevd":
    case "lp-fevd": {
      const result = transformFEVD(data);
      return result ? { type: "fevd", data: result } : null;
    }
    case "var-hd":
    case "bvar-hd":
    case "lp-hd": {
      const result = transformHD(data);
      return result ? { type: "hd", data: result } : null;
    }
    case "var-forecast":
    case "bvar-forecast":
    case "lp-forecast":
    case "arima-forecast": {
      const result = transformForecast(data);
      return result ? { type: "forecast", data: result } : null;
    }
    case "factor-estimate": {
      const result = transformScree(data);
      return result ? { type: "scree", data: result } : null;
    }
    default:
      return null;
  }
}
