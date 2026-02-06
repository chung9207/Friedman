import { invoke } from "@tauri-apps/api/core";
import type {
  DatasetInfo,
  VarEstimateParams,
  VarLagSelectParams,
  VarStabilityParams,
  BvarEstimateParams,
  BvarPosteriorParams,
  IrfComputeParams,
  FevdComputeParams,
  HdComputeParams,
  LpEstimateParams,
  LpIvParams,
  LpSmoothParams,
  LpStateParams,
  LpPropensityParams,
  LpMultiParams,
  LpRobustParams,
  FactorStaticParams,
  FactorDynamicParams,
  FactorGdfmParams,
  TestAdfParams,
  TestKpssParams,
  TestPpParams,
  TestZaParams,
  TestNpParams,
  TestJohansenParams,
  GmmEstimateParams,
  ArimaEstimateParams,
  ArimaForecastParams,
  ArimaAutoParams,
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

// ── BVAR ─────────────────────────────────────────────────────────────────────

export async function bvarEstimate(params: BvarEstimateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("bvar_estimate", { params });
}

export async function bvarPosterior(params: BvarPosteriorParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("bvar_posterior", { params });
}

// ── IRF ──────────────────────────────────────────────────────────────────────

export async function irfCompute(params: IrfComputeParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("irf_compute", { params });
}

// ── FEVD ─────────────────────────────────────────────────────────────────────

export async function fevdCompute(params: FevdComputeParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("fevd_compute", { params });
}

// ── HD ───────────────────────────────────────────────────────────────────────

export async function hdCompute(params: HdComputeParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("hd_compute", { params });
}

// ── Local Projections ────────────────────────────────────────────────────────

export async function lpEstimate(params: LpEstimateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_estimate", { params });
}

export async function lpIv(params: LpIvParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_iv", { params });
}

export async function lpSmooth(params: LpSmoothParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_smooth", { params });
}

export async function lpState(params: LpStateParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_state", { params });
}

export async function lpPropensity(params: LpPropensityParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_propensity", { params });
}

export async function lpMulti(params: LpMultiParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_multi", { params });
}

export async function lpRobust(params: LpRobustParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("lp_robust", { params });
}

// ── Factor Models ────────────────────────────────────────────────────────────

export async function factorStatic(params: FactorStaticParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("factor_static", { params });
}

export async function factorDynamic(params: FactorDynamicParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("factor_dynamic", { params });
}

export async function factorGdfm(params: FactorGdfmParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("factor_gdfm", { params });
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

export async function arimaAuto(params: ArimaAutoParams): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("arima_auto", { params });
}
