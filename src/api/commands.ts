import { invoke } from "@tauri-apps/api/core";
import type {
  DatasetInfo,
  VarEstimateParams,
  VarLagSelectParams,
  VarStabilityParams,
  VarIrfParams,
  VarFevdParams,
  VarHdParams,
  VarForecastParams,
  BvarEstimateParams,
  BvarPosteriorParams,
  BvarIrfParams,
  BvarFevdParams,
  BvarHdParams,
  BvarForecastParams,
  LpEstimateParams,
  LpIrfParams,
  LpFevdParams,
  LpHdParams,
  LpForecastParams,
  FactorEstimateParams,
  FactorForecastParams,
  NongaussianFasticaParams,
  NongaussianMlParams,
  NongaussianHeteroskedasticityParams,
  NongaussianNormalityParams,
  NongaussianIdentifiabilityParams,
  TestAdfParams,
  TestKpssParams,
  TestPpParams,
  TestZaParams,
  TestNpParams,
  TestJohansenParams,
  GmmEstimateParams,
  ArimaEstimateParams,
  ArimaForecastParams,
} from "./types";

// ── Data ─────────────────────────────────────────────────────────────────────

export async function loadCsv(path: string): Promise<DatasetInfo> {
  return invoke<DatasetInfo>("load_csv", { path });
}

export async function loadExcel(path: string, sheet: string): Promise<DatasetInfo> {
  return invoke<DatasetInfo>("load_excel", { path, sheet });
}

export async function previewData(
  datasetId: string,
  limit: number = 100,
): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> {
  return invoke<{ columns: string[]; rows: Record<string, unknown>[] }>(
    "preview_data",
    { datasetId, limit },
  );
}

// ── VAR ──────────────────────────────────────────────────────────────────────

export async function varEstimate(params: VarEstimateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("var_estimate", { params });
}

export async function varLagSelect(params: VarLagSelectParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("var_lagselect", { params });
}

export async function varStability(params: VarStabilityParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("var_stability", { params });
}

export async function varIrf(params: VarIrfParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("var_irf", { params });
}

export async function varFevd(params: VarFevdParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("var_fevd", { params });
}

export async function varHd(params: VarHdParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("var_hd", { params });
}

export async function varForecast(params: VarForecastParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("var_forecast", { params });
}

// ── BVAR ─────────────────────────────────────────────────────────────────────

export async function bvarEstimate(params: BvarEstimateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("bvar_estimate", { params });
}

export async function bvarPosterior(params: BvarPosteriorParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("bvar_posterior", { params });
}

export async function bvarIrf(params: BvarIrfParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("bvar_irf", { params });
}

export async function bvarFevd(params: BvarFevdParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("bvar_fevd", { params });
}

export async function bvarHd(params: BvarHdParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("bvar_hd", { params });
}

export async function bvarForecast(params: BvarForecastParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("bvar_forecast", { params });
}

// ── Local Projections ────────────────────────────────────────────────────────

export async function lpEstimate(params: LpEstimateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_estimate", { params });
}

export async function lpIrf(params: LpIrfParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_irf", { params });
}

export async function lpFevd(params: LpFevdParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_fevd", { params });
}

export async function lpHd(params: LpHdParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_hd", { params });
}

export async function lpForecast(params: LpForecastParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_forecast", { params });
}

// ── Factor Models ────────────────────────────────────────────────────────────

export async function factorEstimate(params: FactorEstimateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("factor_estimate", { params });
}

export async function factorForecast(params: FactorForecastParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("factor_forecast", { params });
}

// ── Non-Gaussian SVAR ───────────────────────────────────────────────────────

export async function nongaussianFastica(params: NongaussianFasticaParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("nongaussian_fastica", { params });
}

export async function nongaussianMl(params: NongaussianMlParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("nongaussian_ml", { params });
}

export async function nongaussianHeteroskedasticity(params: NongaussianHeteroskedasticityParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("nongaussian_heteroskedasticity", { params });
}

export async function nongaussianNormality(params: NongaussianNormalityParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("nongaussian_normality", { params });
}

export async function nongaussianIdentifiability(params: NongaussianIdentifiabilityParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("nongaussian_identifiability", { params });
}

// ── Unit Root & Cointegration Tests ──────────────────────────────────────────

export async function testAdf(params: TestAdfParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("test_adf", { params });
}

export async function testKpss(params: TestKpssParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("test_kpss", { params });
}

export async function testPp(params: TestPpParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("test_pp", { params });
}

export async function testZa(params: TestZaParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("test_za", { params });
}

export async function testNp(params: TestNpParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("test_np", { params });
}

export async function testJohansen(params: TestJohansenParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("test_johansen", { params });
}

// ── GMM ──────────────────────────────────────────────────────────────────────

export async function gmmEstimate(params: GmmEstimateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("gmm_estimate", { params });
}

// ── ARIMA ────────────────────────────────────────────────────────────────────

export async function arimaEstimate(params: ArimaEstimateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("arima_estimate", { params });
}

export async function arimaForecast(params: ArimaForecastParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("arima_forecast", { params });
}
