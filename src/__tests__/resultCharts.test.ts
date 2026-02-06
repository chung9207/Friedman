import { describe, it, expect } from "vitest";
import {
  transformIRF,
  transformFEVD,
  transformHD,
  transformForecast,
  transformScree,
  getChartForCommand,
} from "../lib/resultCharts";

// ── transformIRF ─────────────────────────────────────────────────────────────

describe("transformIRF", () => {
  it("transforms flat row data into IRFChartDatum[]", () => {
    const data = [
      { horizon: 0, gdp: 0.5, gdp_lower: 0.3, gdp_upper: 0.7, cpi: 0.1, cpi_lower: 0.0, cpi_upper: 0.2 },
      { horizon: 1, gdp: 0.4, gdp_lower: 0.2, gdp_upper: 0.6, cpi: 0.15, cpi_lower: 0.05, cpi_upper: 0.25 },
      { horizon: 2, gdp: 0.3, gdp_lower: 0.1, gdp_upper: 0.5, cpi: 0.12, cpi_lower: 0.02, cpi_upper: 0.22 },
    ];

    const result = transformIRF(data);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const gdp = result![0];
    expect(gdp.impulse).toBe("Shock");
    expect(gdp.response).toBe("gdp");
    expect(gdp.horizon).toEqual([0, 1, 2]);
    expect(gdp.irf).toEqual([0.5, 0.4, 0.3]);
    expect(gdp.lower).toEqual([0.3, 0.2, 0.1]);
    expect(gdp.upper).toEqual([0.7, 0.6, 0.5]);

    const cpi = result![1];
    expect(cpi.response).toBe("cpi");
    expect(cpi.irf).toEqual([0.1, 0.15, 0.12]);
  });

  it("handles _16pct/_84pct CI naming convention", () => {
    const data = [
      { horizon: 0, y: 1.0, y_16pct: 0.8, y_84pct: 1.2 },
      { horizon: 1, y: 0.9, y_16pct: 0.7, y_84pct: 1.1 },
    ];

    const result = transformIRF(data);
    expect(result).toHaveLength(1);
    expect(result![0].lower).toEqual([0.8, 0.7]);
    expect(result![0].upper).toEqual([1.2, 1.1]);
  });

  it("handles data without CI bands", () => {
    const data = [
      { horizon: 0, y: 1.0 },
      { horizon: 1, y: 0.9 },
    ];

    const result = transformIRF(data);
    expect(result).toHaveLength(1);
    expect(result![0].lower).toBeUndefined();
    expect(result![0].upper).toBeUndefined();
  });

  it("returns null for non-array input", () => {
    expect(transformIRF("not array")).toBeNull();
    expect(transformIRF(null)).toBeNull();
    expect(transformIRF({})).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(transformIRF([])).toBeNull();
  });

  it("returns null if no horizon column", () => {
    expect(transformIRF([{ x: 1, y: 2 }])).toBeNull();
  });

  it("returns null if only horizon column exists", () => {
    expect(transformIRF([{ horizon: 0 }])).toBeNull();
  });
});

// ── transformFEVD ────────────────────────────────────────────────────────────

describe("transformFEVD", () => {
  it("transforms flat row data into FEVDChartDatum[]", () => {
    const data = [
      { horizon: 1, shock_gdp: 0.6, shock_cpi: 0.4 },
      { horizon: 2, shock_gdp: 0.55, shock_cpi: 0.45 },
      { horizon: 3, shock_gdp: 0.5, shock_cpi: 0.5 },
    ];

    const result = transformFEVD(data);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].variable).toBe("Response");
    expect(result![0].horizon).toEqual([1, 2, 3]);
    expect(result![0].decomposition).toHaveLength(2);
    expect(result![0].decomposition[0]).toEqual({
      shock: "shock_gdp",
      values: [0.6, 0.55, 0.5],
    });
  });

  it("returns null for non-array input", () => {
    expect(transformFEVD(42)).toBeNull();
  });

  it("returns null if no horizon column", () => {
    expect(transformFEVD([{ a: 1, b: 2 }])).toBeNull();
  });

  it("returns null if only horizon column", () => {
    expect(transformFEVD([{ horizon: 1 }])).toBeNull();
  });
});

// ── transformHD ──────────────────────────────────────────────────────────────

describe("transformHD", () => {
  it("transforms flat row data into HDChartDatum[]", () => {
    const data = [
      { period: 1, actual: 100, initial: 99, contrib_monetary: 0.5, contrib_fiscal: 0.3 },
      { period: 2, actual: 101, initial: 99, contrib_monetary: 0.8, contrib_fiscal: 0.4 },
    ];

    const result = transformHD(data);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].variable).toBe("Variable");
    expect(result![0].dates).toEqual(["1", "2"]);
    expect(result![0].contributions).toHaveLength(2);
    expect(result![0].contributions[0]).toEqual({
      shock: "monetary",
      values: [0.5, 0.8],
    });
    expect(result![0].contributions[1]).toEqual({
      shock: "fiscal",
      values: [0.3, 0.4],
    });
  });

  it("returns null for non-array input", () => {
    expect(transformHD(undefined)).toBeNull();
  });

  it("returns null if no period column", () => {
    expect(transformHD([{ time: 1, contrib_x: 0.5 }])).toBeNull();
  });

  it("returns null if no contrib_ columns", () => {
    expect(transformHD([{ period: 1, actual: 100 }])).toBeNull();
  });
});

// ── transformForecast ────────────────────────────────────────────────────────

describe("transformForecast", () => {
  it("transforms flat row data into ForecastChartData", () => {
    const data = [
      { horizon: 1, forecast: 100.1, ci_lower: 98.5, ci_upper: 101.7, se: 0.7 },
      { horizon: 2, forecast: 100.5, ci_lower: 97.8, ci_upper: 103.2, se: 1.2 },
      { horizon: 3, forecast: 101.0, ci_lower: 97.0, ci_upper: 105.0, se: 1.8 },
    ];

    const result = transformForecast(data);
    expect(result).not.toBeNull();
    expect(result!.dates).toEqual(["1", "2", "3"]);
    expect(result!.actual).toEqual([]);
    expect(result!.forecast).toEqual([100.1, 100.5, 101.0]);
    expect(result!.lower).toEqual([98.5, 97.8, 97.0]);
    expect(result!.upper).toEqual([101.7, 103.2, 105.0]);
  });

  it("handles data without CI columns", () => {
    const data = [
      { horizon: 1, forecast: 100.0 },
      { horizon: 2, forecast: 101.0 },
    ];

    const result = transformForecast(data);
    expect(result).not.toBeNull();
    expect(result!.forecast).toEqual([100.0, 101.0]);
    expect(result!.lower).toBeUndefined();
    expect(result!.upper).toBeUndefined();
  });

  it("returns null for non-array input", () => {
    expect(transformForecast(false)).toBeNull();
  });

  it("returns null if no forecast column", () => {
    expect(transformForecast([{ horizon: 1, value: 100 }])).toBeNull();
  });
});

// ── transformScree ───────────────────────────────────────────────────────────

describe("transformScree", () => {
  it("transforms flat row data into ScreePlotDatum[]", () => {
    const data = [
      { component: 1, eigenvalue: 12.3, cumulative: 0.45 },
      { component: 2, eigenvalue: 5.6, cumulative: 0.65 },
      { component: 3, eigenvalue: 2.1, cumulative: 0.73 },
    ];

    const result = transformScree(data);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(3);
    expect(result![0]).toEqual({ factor: 1, eigenvalue: 12.3, cumulative_variance: 0.45 });
    expect(result![2]).toEqual({ factor: 3, eigenvalue: 2.1, cumulative_variance: 0.73 });
  });

  it("returns null for non-array input", () => {
    expect(transformScree("bad")).toBeNull();
  });

  it("returns null if missing required columns", () => {
    expect(transformScree([{ component: 1, eigenvalue: 5 }])).toBeNull();
    expect(transformScree([{ eigenvalue: 5, cumulative: 0.5 }])).toBeNull();
    expect(transformScree([{ component: 1, cumulative: 0.5 }])).toBeNull();
  });
});

// ── getChartForCommand dispatcher ────────────────────────────────────────────

describe("getChartForCommand", () => {
  const irfData = [{ horizon: 0, y: 1.0 }];
  const fevdData = [{ horizon: 1, s1: 0.5, s2: 0.5 }];
  const hdData = [{ period: 1, actual: 100, contrib_x: 0.5 }];
  const forecastData = [{ horizon: 1, forecast: 100 }];
  const screeData = [{ component: 1, eigenvalue: 5, cumulative: 0.5 }];

  // IRF routing — all 3 model types
  it("routes var-irf to IRF chart", () => {
    const result = getChartForCommand("var-irf", irfData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("irf");
  });

  it("routes bvar-irf to IRF chart", () => {
    const result = getChartForCommand("bvar-irf", irfData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("irf");
  });

  it("routes lp-irf to IRF chart", () => {
    const result = getChartForCommand("lp-irf", irfData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("irf");
  });

  // FEVD routing — all 3 model types
  it("routes var-fevd to FEVD chart", () => {
    const result = getChartForCommand("var-fevd", fevdData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("fevd");
  });

  it("routes bvar-fevd to FEVD chart", () => {
    const result = getChartForCommand("bvar-fevd", fevdData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("fevd");
  });

  it("routes lp-fevd to FEVD chart", () => {
    const result = getChartForCommand("lp-fevd", fevdData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("fevd");
  });

  // HD routing — all 3 model types
  it("routes var-hd to HD chart", () => {
    const result = getChartForCommand("var-hd", hdData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("hd");
  });

  it("routes bvar-hd to HD chart", () => {
    const result = getChartForCommand("bvar-hd", hdData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("hd");
  });

  it("routes lp-hd to HD chart", () => {
    const result = getChartForCommand("lp-hd", hdData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("hd");
  });

  // Forecast routing — all 4 model types
  it("routes var-forecast to forecast chart", () => {
    const result = getChartForCommand("var-forecast", forecastData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("forecast");
  });

  it("routes bvar-forecast to forecast chart", () => {
    const result = getChartForCommand("bvar-forecast", forecastData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("forecast");
  });

  it("routes lp-forecast to forecast chart", () => {
    const result = getChartForCommand("lp-forecast", forecastData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("forecast");
  });

  it("routes arima-forecast to forecast chart", () => {
    const result = getChartForCommand("arima-forecast", forecastData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("forecast");
  });

  // Scree routing
  it("routes factor-estimate to scree plot", () => {
    const result = getChartForCommand("factor-estimate", screeData);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("scree");
  });

  // Non-visual commands return null
  it("returns null for non-visual commands", () => {
    expect(getChartForCommand("var-estimate", {})).toBeNull();
    expect(getChartForCommand("test-adf", {})).toBeNull();
    expect(getChartForCommand("arima-estimate", {})).toBeNull();
    expect(getChartForCommand("gmm-estimate", {})).toBeNull();
  });

  // Bad data returns null
  it("returns null when transform fails on bad data", () => {
    expect(getChartForCommand("var-irf", "bad")).toBeNull();
    expect(getChartForCommand("var-fevd", null)).toBeNull();
    expect(getChartForCommand("var-hd", [])).toBeNull();
    expect(getChartForCommand("arima-forecast", 42)).toBeNull();
    expect(getChartForCommand("factor-estimate", undefined)).toBeNull();
  });
});
