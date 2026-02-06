export interface DatasetInfo {
  id: string;
  name: string;
  path: string;
  columns: string[];
  row_count: number;
}

// ── VAR ──────────────────────────────────────────────────────────────────────

export interface VarEstimateParams {
  data: string;
  lags?: number;
  trend?: string; // none|constant|trend|both
}

export interface VarLagSelectParams {
  data: string;
  max_lags?: number;
  criterion?: string; // aic|bic|hqc
}

export interface VarStabilityParams {
  data: string;
  lags?: number;
}

// ── BVAR ─────────────────────────────────────────────────────────────────────

export interface BvarEstimateParams {
  data: string;
  lags?: number;
  prior?: string;
  draws?: number;
  sampler?: string;
  config?: string;
}

export interface BvarPosteriorParams {
  data: string;
  lags?: number;
  draws?: number;
  sampler?: string;
  method?: string;
  config?: string;
}

// ── IRF ──────────────────────────────────────────────────────────────────────

export interface IrfComputeParams {
  data: string;
  lags?: number;
  shock?: number;
  horizons?: number;
  id?: string; // cholesky|sign|narrative|longrun|arias
  ci?: string; // none|bootstrap|theoretical
  replications?: number;
  bayesian?: boolean;
  config?: string;
  draws?: number;
  sampler?: string;
}

// ── FEVD ─────────────────────────────────────────────────────────────────────

export interface FevdComputeParams {
  data: string;
  lags?: number;
  horizons?: number;
  id?: string;
  bayesian?: boolean;
  config?: string;
  draws?: number;
  sampler?: string;
}

// ── HD ───────────────────────────────────────────────────────────────────────

export interface HdComputeParams {
  data: string;
  lags?: number;
  id?: string;
  bayesian?: boolean;
  config?: string;
  draws?: number;
  sampler?: string;
}

// ── LP ───────────────────────────────────────────────────────────────────────

export interface LpEstimateParams {
  data: string;
  shock?: number;
  horizons?: number;
  control_lags?: number;
  vcov?: string;
}

export interface LpIvParams {
  data: string;
  shock?: number;
  instruments?: string;
  horizons?: number;
  control_lags?: number;
  vcov?: string;
}

export interface LpSmoothParams {
  data: string;
  shock?: number;
  horizons?: number;
  knots?: number;
  lambda?: number;
}

export interface LpStateParams {
  data: string;
  shock?: number;
  state_var?: number;
  horizons?: number;
  gamma?: number;
  method?: string;
}

export interface LpPropensityParams {
  data: string;
  treatment?: number;
  horizons?: number;
  score_method?: string;
}

export interface LpMultiParams {
  data: string;
  shocks?: string;
  horizons?: number;
  control_lags?: number;
  vcov?: string;
}

export interface LpRobustParams {
  data: string;
  treatment?: number;
  horizons?: number;
  score_method?: string;
}

// ── Factor ───────────────────────────────────────────────────────────────────

export interface FactorStaticParams {
  data: string;
  nfactors?: number;
  criterion?: string;
}

export interface FactorDynamicParams {
  data: string;
  nfactors?: number;
  factor_lags?: number;
  method?: string;
}

export interface FactorGdfmParams {
  data: string;
  nfactors?: number;
  dynamic_rank?: number;
}

// ── Tests ────────────────────────────────────────────────────────────────────

export interface TestAdfParams {
  data: string;
  column?: number;
  max_lags?: number;
  trend?: string;
}

export interface TestKpssParams {
  data: string;
  column?: number;
  trend?: string;
}

export interface TestPpParams {
  data: string;
  column?: number;
  trend?: string;
}

export interface TestZaParams {
  data: string;
  column?: number;
  trend?: string;
  trim?: number;
}

export interface TestNpParams {
  data: string;
  column?: number;
  trend?: string;
}

export interface TestJohansenParams {
  data: string;
  lags?: number;
  trend?: string;
}

// ── GMM ──────────────────────────────────────────────────────────────────────

export interface GmmEstimateParams {
  data: string;
  config?: string;
  weighting?: string;
}

// ── ARIMA ────────────────────────────────────────────────────────────────────

export interface ArimaEstimateParams {
  data: string;
  column?: number;
  p?: number;
  d?: number;
  q?: number;
  method?: string;
}

export interface ArimaAutoParams {
  data: string;
  column?: number;
  max_p?: number;
  max_d?: number;
  max_q?: number;
  criterion?: string;
  method?: string;
}

export interface ArimaForecastParams {
  data: string;
  column?: number;
  p?: number;
  d?: number;
  q?: number;
  horizons?: number;
  confidence?: number;
  method?: string;
}

// ── Output ───────────────────────────────────────────────────────────────────

export interface OutputLine {
  id: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "success";
  message: string;
}
