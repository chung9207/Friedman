import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import * as commands from "../api/commands";

const mockInvoke = vi.mocked(invoke);

describe("command integration (invoke param shapes)", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    mockInvoke.mockResolvedValue({});
  });

  // ── VAR ─────────────────────────────────────────────────────────────────

  describe("VAR", () => {
    it("var-estimate defaults (data only)", async () => {
      await commands.varEstimate({ data: "/data.csv" });
      expect(mockInvoke).toHaveBeenCalledWith("var_estimate", {
        params: { data: "/data.csv" },
      });
    });

    it("var-estimate with explicit lags + trend=none", async () => {
      await commands.varEstimate({ data: "/data.csv", lags: 4, trend: "none" });
      expect(mockInvoke).toHaveBeenCalledWith("var_estimate", {
        params: { data: "/data.csv", lags: 4, trend: "none" },
      });
    });

    it("var-estimate trend=constant", async () => {
      await commands.varEstimate({ data: "/d.csv", trend: "constant" });
      expect(mockInvoke).toHaveBeenCalledWith("var_estimate", {
        params: { data: "/d.csv", trend: "constant" },
      });
    });

    it("var-estimate trend=trend", async () => {
      await commands.varEstimate({ data: "/d.csv", trend: "trend" });
      expect(mockInvoke).toHaveBeenCalledWith("var_estimate", {
        params: { data: "/d.csv", trend: "trend" },
      });
    });

    it("var-estimate trend=both", async () => {
      await commands.varEstimate({ data: "/d.csv", trend: "both" });
      expect(mockInvoke).toHaveBeenCalledWith("var_estimate", {
        params: { data: "/d.csv", trend: "both" },
      });
    });

    it("var-lagselect with max_lags + criterion=aic", async () => {
      await commands.varLagSelect({ data: "/d.csv", max_lags: 12, criterion: "aic" });
      expect(mockInvoke).toHaveBeenCalledWith("var_lagselect", {
        params: { data: "/d.csv", max_lags: 12, criterion: "aic" },
      });
    });

    it("var-lagselect with criterion=bic", async () => {
      await commands.varLagSelect({ data: "/d.csv", criterion: "bic" });
      expect(mockInvoke).toHaveBeenCalledWith("var_lagselect", {
        params: { data: "/d.csv", criterion: "bic" },
      });
    });

    it("var-stability without lags (auto)", async () => {
      await commands.varStability({ data: "/d.csv" });
      expect(mockInvoke).toHaveBeenCalledWith("var_stability", {
        params: { data: "/d.csv" },
      });
    });

    it("var-stability with explicit lags", async () => {
      await commands.varStability({ data: "/d.csv", lags: 3 });
      expect(mockInvoke).toHaveBeenCalledWith("var_stability", {
        params: { data: "/d.csv", lags: 3 },
      });
    });
  });

  // ── BVAR ────────────────────────────────────────────────────────────────

  describe("BVAR", () => {
    it("bvar-estimate with lags, prior=minnesota, draws, sampler=gibbs", async () => {
      await commands.bvarEstimate({
        data: "/d.csv", lags: 4, prior: "minnesota", draws: 1000, sampler: "gibbs",
      });
      expect(mockInvoke).toHaveBeenCalledWith("bvar_estimate", {
        params: { data: "/d.csv", lags: 4, prior: "minnesota", draws: 1000, sampler: "gibbs" },
      });
    });

    it("bvar-posterior method=mean", async () => {
      await commands.bvarPosterior({ data: "/d.csv", method: "mean" });
      expect(mockInvoke).toHaveBeenCalledWith("bvar_posterior", {
        params: { data: "/d.csv", method: "mean" },
      });
    });

    it("bvar-posterior method=median", async () => {
      await commands.bvarPosterior({ data: "/d.csv", method: "median" });
      expect(mockInvoke).toHaveBeenCalledWith("bvar_posterior", {
        params: { data: "/d.csv", method: "median" },
      });
    });
  });

  // ── IRF ─────────────────────────────────────────────────────────────────

  describe("IRF", () => {
    it("irf-compute non-bayesian", async () => {
      await commands.irfCompute({
        data: "/d.csv", shock: 1, horizons: 20, id: "cholesky",
        ci: "bootstrap", replications: 500,
      });
      expect(mockInvoke).toHaveBeenCalledWith("irf_compute", {
        params: {
          data: "/d.csv", shock: 1, horizons: 20, id: "cholesky",
          ci: "bootstrap", replications: 500,
        },
      });
    });

    it("irf-compute with explicit lags", async () => {
      await commands.irfCompute({ data: "/d.csv", lags: 4, horizons: 10 });
      expect(mockInvoke).toHaveBeenCalledWith("irf_compute", {
        params: { data: "/d.csv", lags: 4, horizons: 10 },
      });
    });

    it("irf-compute bayesian", async () => {
      await commands.irfCompute({
        data: "/d.csv", bayesian: true, draws: 2000, sampler: "gibbs",
      });
      expect(mockInvoke).toHaveBeenCalledWith("irf_compute", {
        params: { data: "/d.csv", bayesian: true, draws: 2000, sampler: "gibbs" },
      });
    });
  });

  // ── FEVD ────────────────────────────────────────────────────────────────

  describe("FEVD", () => {
    it("fevd-compute basic", async () => {
      await commands.fevdCompute({ data: "/d.csv", horizons: 20, id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("fevd_compute", {
        params: { data: "/d.csv", horizons: 20, id: "cholesky" },
      });
    });

    it("fevd-compute with lags", async () => {
      await commands.fevdCompute({ data: "/d.csv", lags: 3, horizons: 15 });
      expect(mockInvoke).toHaveBeenCalledWith("fevd_compute", {
        params: { data: "/d.csv", lags: 3, horizons: 15 },
      });
    });

    it("fevd-compute bayesian", async () => {
      await commands.fevdCompute({
        data: "/d.csv", bayesian: true, draws: 1000, sampler: "gibbs",
      });
      expect(mockInvoke).toHaveBeenCalledWith("fevd_compute", {
        params: { data: "/d.csv", bayesian: true, draws: 1000, sampler: "gibbs" },
      });
    });
  });

  // ── HD ──────────────────────────────────────────────────────────────────

  describe("HD", () => {
    it("hd-compute basic", async () => {
      await commands.hdCompute({ data: "/d.csv", id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("hd_compute", {
        params: { data: "/d.csv", id: "cholesky" },
      });
    });

    it("hd-compute with lags", async () => {
      await commands.hdCompute({ data: "/d.csv", lags: 4, id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("hd_compute", {
        params: { data: "/d.csv", lags: 4, id: "cholesky" },
      });
    });

    it("hd-compute bayesian", async () => {
      await commands.hdCompute({
        data: "/d.csv", bayesian: true, draws: 1000, sampler: "gibbs",
      });
      expect(mockInvoke).toHaveBeenCalledWith("hd_compute", {
        params: { data: "/d.csv", bayesian: true, draws: 1000, sampler: "gibbs" },
      });
    });
  });

  // ── LP ──────────────────────────────────────────────────────────────────

  describe("LP", () => {
    it("lp-estimate with newey_west vcov", async () => {
      await commands.lpEstimate({ data: "/d.csv", vcov: "newey_west" });
      expect(mockInvoke).toHaveBeenCalledWith("lp_estimate", {
        params: { data: "/d.csv", vcov: "newey_west" },
      });
    });

    it("lp-estimate with white vcov", async () => {
      await commands.lpEstimate({ data: "/d.csv", vcov: "white" });
      expect(mockInvoke).toHaveBeenCalledWith("lp_estimate", {
        params: { data: "/d.csv", vcov: "white" },
      });
    });

    it("lp-iv without instruments", async () => {
      await commands.lpIv({ data: "/d.csv", shock: 1, horizons: 20 });
      expect(mockInvoke).toHaveBeenCalledWith("lp_iv", {
        params: { data: "/d.csv", shock: 1, horizons: 20 },
      });
    });

    it("lp-smooth with knots + lambda", async () => {
      await commands.lpSmooth({ data: "/d.csv", knots: 5, lambda: 0.1 });
      expect(mockInvoke).toHaveBeenCalledWith("lp_smooth", {
        params: { data: "/d.csv", knots: 5, lambda: 0.1 },
      });
    });

    it("lp-state with logistic method + gamma", async () => {
      await commands.lpState({ data: "/d.csv", method: "logistic", gamma: 1.5 });
      expect(mockInvoke).toHaveBeenCalledWith("lp_state", {
        params: { data: "/d.csv", method: "logistic", gamma: 1.5 },
      });
    });

    it("lp-state with explicit state_var", async () => {
      await commands.lpState({ data: "/d.csv", state_var: 2 });
      expect(mockInvoke).toHaveBeenCalledWith("lp_state", {
        params: { data: "/d.csv", state_var: 2 },
      });
    });

    it("lp-propensity with logit score_method", async () => {
      await commands.lpPropensity({ data: "/d.csv", score_method: "logit" });
      expect(mockInvoke).toHaveBeenCalledWith("lp_propensity", {
        params: { data: "/d.csv", score_method: "logit" },
      });
    });

    it("lp-propensity with probit score_method", async () => {
      await commands.lpPropensity({ data: "/d.csv", score_method: "probit" });
      expect(mockInvoke).toHaveBeenCalledWith("lp_propensity", {
        params: { data: "/d.csv", score_method: "probit" },
      });
    });

    it("lp-multi with shocks='1,2'", async () => {
      await commands.lpMulti({ data: "/d.csv", shocks: "1,2" });
      expect(mockInvoke).toHaveBeenCalledWith("lp_multi", {
        params: { data: "/d.csv", shocks: "1,2" },
      });
    });

    it("lp-robust", async () => {
      await commands.lpRobust({ data: "/d.csv", treatment: 1, horizons: 20 });
      expect(mockInvoke).toHaveBeenCalledWith("lp_robust", {
        params: { data: "/d.csv", treatment: 1, horizons: 20 },
      });
    });
  });

  // ── Factor ──────────────────────────────────────────────────────────────

  describe("Factor", () => {
    it("factor-static auto (no nfactors)", async () => {
      await commands.factorStatic({ data: "/d.csv" });
      expect(mockInvoke).toHaveBeenCalledWith("factor_static", {
        params: { data: "/d.csv" },
      });
    });

    it("factor-static with explicit nfactors", async () => {
      await commands.factorStatic({ data: "/d.csv", nfactors: 3 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_static", {
        params: { data: "/d.csv", nfactors: 3 },
      });
    });

    it("factor-dynamic with twostep method", async () => {
      await commands.factorDynamic({ data: "/d.csv", method: "twostep" });
      expect(mockInvoke).toHaveBeenCalledWith("factor_dynamic", {
        params: { data: "/d.csv", method: "twostep" },
      });
    });

    it("factor-dynamic with em method + nfactors", async () => {
      await commands.factorDynamic({ data: "/d.csv", method: "em", nfactors: 2 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_dynamic", {
        params: { data: "/d.csv", method: "em", nfactors: 2 },
      });
    });

    it("factor-gdfm auto and with explicit params", async () => {
      await commands.factorGdfm({ data: "/d.csv", nfactors: 3, dynamic_rank: 2 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_gdfm", {
        params: { data: "/d.csv", nfactors: 3, dynamic_rank: 2 },
      });
    });

    it("factor-forecast auto (no nfactors)", async () => {
      await commands.factorForecast({ data: "/d.csv" });
      expect(mockInvoke).toHaveBeenCalledWith("factor_forecast", {
        params: { data: "/d.csv" },
      });
    });

    it("factor-forecast with explicit nfactors + horizon", async () => {
      await commands.factorForecast({ data: "/d.csv", nfactors: 2, horizon: 6 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_forecast", {
        params: { data: "/d.csv", nfactors: 2, horizon: 6 },
      });
    });

    it("factor-forecast with ci_method=bootstrap", async () => {
      await commands.factorForecast({ data: "/d.csv", ci_method: "bootstrap", conf_level: 0.9 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_forecast", {
        params: { data: "/d.csv", ci_method: "bootstrap", conf_level: 0.9 },
      });
    });
  });

  // ── Non-Gaussian SVAR ──────────────────────────────────────────────────

  describe("Non-Gaussian SVAR", () => {
    it("nongaussian-fastica with defaults", async () => {
      await commands.nongaussianFastica({ data: "/d.csv" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_fastica", {
        params: { data: "/d.csv" },
      });
    });

    it("nongaussian-fastica with explicit lags + method + contrast", async () => {
      await commands.nongaussianFastica({ data: "/d.csv", lags: 2, method: "jade", contrast: "exp" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_fastica", {
        params: { data: "/d.csv", lags: 2, method: "jade", contrast: "exp" },
      });
    });

    it("nongaussian-ml with student_t distribution", async () => {
      await commands.nongaussianMl({ data: "/d.csv", distribution: "student_t" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_ml", {
        params: { data: "/d.csv", distribution: "student_t" },
      });
    });

    it("nongaussian-ml with lags", async () => {
      await commands.nongaussianMl({ data: "/d.csv", lags: 4 });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_ml", {
        params: { data: "/d.csv", lags: 4 },
      });
    });

    it("nongaussian-heteroskedasticity with markov method", async () => {
      await commands.nongaussianHeteroskedasticity({ data: "/d.csv", method: "markov", regimes: 2 });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_heteroskedasticity", {
        params: { data: "/d.csv", method: "markov", regimes: 2 },
      });
    });

    it("nongaussian-heteroskedasticity with config", async () => {
      await commands.nongaussianHeteroskedasticity({ data: "/d.csv", method: "external", config: "/cfg.toml" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_heteroskedasticity", {
        params: { data: "/d.csv", method: "external", config: "/cfg.toml" },
      });
    });

    it("nongaussian-normality with defaults", async () => {
      await commands.nongaussianNormality({ data: "/d.csv" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_normality", {
        params: { data: "/d.csv" },
      });
    });

    it("nongaussian-normality with lags", async () => {
      await commands.nongaussianNormality({ data: "/d.csv", lags: 3 });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_normality", {
        params: { data: "/d.csv", lags: 3 },
      });
    });

    it("nongaussian-identifiability defaults", async () => {
      await commands.nongaussianIdentifiability({ data: "/d.csv" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_identifiability", {
        params: { data: "/d.csv" },
      });
    });

    it("nongaussian-identifiability with explicit test + method + contrast", async () => {
      await commands.nongaussianIdentifiability({ data: "/d.csv", test: "strength", method: "jade", contrast: "kurtosis" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_identifiability", {
        params: { data: "/d.csv", test: "strength", method: "jade", contrast: "kurtosis" },
      });
    });
  });

  // ── Unit Root Tests ─────────────────────────────────────────────────────

  describe("Unit Root Tests", () => {
    it("test-adf with column + trend=constant", async () => {
      await commands.testAdf({ data: "/d.csv", column: 1, trend: "constant" });
      expect(mockInvoke).toHaveBeenCalledWith("test_adf", {
        params: { data: "/d.csv", column: 1, trend: "constant" },
      });
    });

    it("test-adf with max_lags + trend=trend", async () => {
      await commands.testAdf({ data: "/d.csv", max_lags: 8, trend: "trend" });
      expect(mockInvoke).toHaveBeenCalledWith("test_adf", {
        params: { data: "/d.csv", max_lags: 8, trend: "trend" },
      });
    });

    it("test-kpss constant", async () => {
      await commands.testKpss({ data: "/d.csv", trend: "constant" });
      expect(mockInvoke).toHaveBeenCalledWith("test_kpss", {
        params: { data: "/d.csv", trend: "constant" },
      });
    });

    it("test-kpss trend", async () => {
      await commands.testKpss({ data: "/d.csv", trend: "trend" });
      expect(mockInvoke).toHaveBeenCalledWith("test_kpss", {
        params: { data: "/d.csv", trend: "trend" },
      });
    });

    it("test-pp constant", async () => {
      await commands.testPp({ data: "/d.csv", trend: "constant" });
      expect(mockInvoke).toHaveBeenCalledWith("test_pp", {
        params: { data: "/d.csv", trend: "constant" },
      });
    });

    it("test-za with trim=0.15 + trend=both", async () => {
      await commands.testZa({ data: "/d.csv", trim: 0.15, trend: "both" });
      expect(mockInvoke).toHaveBeenCalledWith("test_za", {
        params: { data: "/d.csv", trim: 0.15, trend: "both" },
      });
    });

    it("test-za with trend=intercept", async () => {
      await commands.testZa({ data: "/d.csv", trend: "intercept" });
      expect(mockInvoke).toHaveBeenCalledWith("test_za", {
        params: { data: "/d.csv", trend: "intercept" },
      });
    });

    it("test-np constant", async () => {
      await commands.testNp({ data: "/d.csv", trend: "constant" });
      expect(mockInvoke).toHaveBeenCalledWith("test_np", {
        params: { data: "/d.csv", trend: "constant" },
      });
    });

    it("test-johansen with lags + trend", async () => {
      await commands.testJohansen({ data: "/d.csv", lags: 2, trend: "constant" });
      expect(mockInvoke).toHaveBeenCalledWith("test_johansen", {
        params: { data: "/d.csv", lags: 2, trend: "constant" },
      });
    });
  });

  // ── GMM ─────────────────────────────────────────────────────────────────

  describe("GMM", () => {
    it("gmm-estimate with weighting=twostep", async () => {
      await commands.gmmEstimate({ data: "/d.csv", weighting: "twostep" });
      expect(mockInvoke).toHaveBeenCalledWith("gmm_estimate", {
        params: { data: "/d.csv", weighting: "twostep" },
      });
    });
  });

  // ── ARIMA ───────────────────────────────────────────────────────────────

  describe("ARIMA", () => {
    it("arima-estimate (1,0,0) with css_mle", async () => {
      await commands.arimaEstimate({
        data: "/d.csv", p: 1, d: 0, q: 0, method: "css_mle",
      });
      expect(mockInvoke).toHaveBeenCalledWith("arima_estimate", {
        params: { data: "/d.csv", p: 1, d: 0, q: 0, method: "css_mle" },
      });
    });

    it("arima-estimate (1,1,1) with mle", async () => {
      await commands.arimaEstimate({
        data: "/d.csv", p: 1, d: 1, q: 1, method: "mle",
      });
      expect(mockInvoke).toHaveBeenCalledWith("arima_estimate", {
        params: { data: "/d.csv", p: 1, d: 1, q: 1, method: "mle" },
      });
    });

    it("arima-auto with bic criterion", async () => {
      await commands.arimaAuto({ data: "/d.csv", criterion: "bic" });
      expect(mockInvoke).toHaveBeenCalledWith("arima_auto", {
        params: { data: "/d.csv", criterion: "bic" },
      });
    });

    it("arima-auto with aic criterion", async () => {
      await commands.arimaAuto({ data: "/d.csv", criterion: "aic" });
      expect(mockInvoke).toHaveBeenCalledWith("arima_auto", {
        params: { data: "/d.csv", criterion: "aic" },
      });
    });

    it("arima-forecast with explicit p", async () => {
      await commands.arimaForecast({
        data: "/d.csv", p: 2, d: 1, q: 1, horizons: 12,
      });
      expect(mockInvoke).toHaveBeenCalledWith("arima_forecast", {
        params: { data: "/d.csv", p: 2, d: 1, q: 1, horizons: 12 },
      });
    });

    it("arima-forecast without p (auto)", async () => {
      await commands.arimaForecast({ data: "/d.csv", horizons: 10 });
      expect(mockInvoke).toHaveBeenCalledWith("arima_forecast", {
        params: { data: "/d.csv", horizons: 10 },
      });
    });
  });
});
