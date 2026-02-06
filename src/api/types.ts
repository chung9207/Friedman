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

export interface VarIrfParams {
  data: string;
  lags?: number;
  shock?: number;
  horizons?: number;
  id?: string; // cholesky|sign|narrative|longrun|arias
  ci?: string; // none|bootstrap|theoretical
  replications?: number;
  config?: string;
}

export interface VarFevdParams {
  data: string;
  lags?: number;
  horizons?: number;
  id?: string;
  config?: string;
}

export interface VarHdParams {
  data: string;
  lags?: number;
  id?: string;
  config?: string;
}

export interface VarForecastParams {
  data: string;
  lags?: number;
  horizons?: number;
  confidence?: number;
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

export interface BvarIrfParams {
  data: string;
  lags?: number;
  shock?: number;
  horizons?: number;
  id?: string;
  draws?: number;
  sampler?: string;
  config?: string;
}

export interface BvarFevdParams {
  data: string;
  lags?: number;
  horizons?: number;
  id?: string;
  draws?: number;
  sampler?: string;
  config?: string;
}

export interface BvarHdParams {
  data: string;
  lags?: number;
  id?: string;
  draws?: number;
  sampler?: string;
  config?: string;
}

export interface BvarForecastParams {
  data: string;
  lags?: number;
  horizons?: number;
  draws?: number;
  sampler?: string;
  config?: string;
}

// ── LP ───────────────────────────────────────────────────────────────────────

export interface LpEstimateParams {
  data: string;
  method?: string; // standard|iv|smooth|state|propensity|robust
  shock?: number;
  horizons?: number;
  control_lags?: number;
  vcov?: string;
  // iv-specific
  instruments?: string;
  // smooth-specific
  knots?: number;
  lambda?: number;
  // state-specific
  state_var?: number;
  gamma?: number;
  transition?: string;
  // propensity/robust
  treatment?: number;
  score_method?: string;
}

export interface LpIrfParams {
  data: string;
  shock?: number;
  shocks?: string;
  horizons?: number;
  lags?: number;
  var_lags?: number;
  id?: string;
  ci?: string;
  replications?: number;
  conf_level?: number;
  vcov?: string;
  config?: string;
}

export interface LpFevdParams {
  data: string;
  horizons?: number;
  lags?: number;
  var_lags?: number;
  id?: string;
  vcov?: string;
  config?: string;
}

export interface LpHdParams {
  data: string;
  lags?: number;
  var_lags?: number;
  id?: string;
  vcov?: string;
  config?: string;
}

export interface LpForecastParams {
  data: string;
  shock?: number;
  horizons?: number;
  shock_size?: number;
  lags?: number;
  vcov?: string;
  ci_method?: string;
  conf_level?: number;
  n_boot?: number;
}

// ── Factor ───────────────────────────────────────────────────────────────────

export interface FactorEstimateParams {
  data: string;
  model_type: string; // static|dynamic|gdfm
  nfactors?: number;
  criterion?: string;
  factor_lags?: number;
  method?: string;
  dynamic_rank?: number;
}

export interface FactorForecastParams {
  data: string;
  nfactors?: number;
  horizon?: number;
  ci_method?: string;
  conf_level?: number;
  model?: string; // static|dynamic|gdfm
  factor_lags?: number;
  method?: string;
  dynamic_rank?: number;
}

// ── Non-Gaussian SVAR ───────────────────────────────────────────────────────

export interface NongaussianFasticaParams {
  data: string;
  lags?: number;
  method?: string; // fastica|infomax|jade|sobi|dcov|hsic
  contrast?: string; // logcosh|exp|kurtosis
}

export interface NongaussianMlParams {
  data: string;
  lags?: number;
  distribution?: string; // student_t|skew_t|ghd|mixture_normal|pml|skew_normal
}

export interface NongaussianHeteroskedasticityParams {
  data: string;
  lags?: number;
  method?: string; // markov|garch|smooth_transition|external
  config?: string;
  regimes?: number;
}

export interface NongaussianNormalityParams {
  data: string;
  lags?: number;
}

export interface NongaussianIdentifiabilityParams {
  data: string;
  lags?: number;
  test?: string; // strength|gaussianity|independence|all|overidentification
  method?: string; // fastica|infomax|jade|sobi|dcov|hsic
  contrast?: string; // logcosh|exp|kurtosis
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
  p?: number; // optional: omit for auto mode
  d?: number;
  q?: number;
  method?: string;
  // auto-mode params
  max_p?: number;
  max_d?: number;
  max_q?: number;
  criterion?: string;
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
