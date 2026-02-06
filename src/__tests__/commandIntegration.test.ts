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

    it("var-irf with all params", async () => {
      await commands.varIrf({
        data: "/d.csv", lags: 4, shock: 1, horizons: 20,
        id: "cholesky", ci: "bootstrap", replications: 500,
      });
      expect(mockInvoke).toHaveBeenCalledWith("var_irf", {
        params: {
          data: "/d.csv", lags: 4, shock: 1, horizons: 20,
          id: "cholesky", ci: "bootstrap", replications: 500,
        },
      });
    });

    it("var-irf with sign restrictions", async () => {
      await commands.varIrf({ data: "/d.csv", id: "sign", config: "/sign.toml" });
      expect(mockInvoke).toHaveBeenCalledWith("var_irf", {
        params: { data: "/d.csv", id: "sign", config: "/sign.toml" },
      });
    });

    it("var-fevd with horizons + id", async () => {
      await commands.varFevd({ data: "/d.csv", horizons: 20, id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("var_fevd", {
        params: { data: "/d.csv", horizons: 20, id: "cholesky" },
      });
    });

    it("var-hd basic", async () => {
      await commands.varHd({ data: "/d.csv", id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("var_hd", {
        params: { data: "/d.csv", id: "cholesky" },
      });
    });

    it("var-forecast with horizons + confidence", async () => {
      await commands.varForecast({ data: "/d.csv", horizons: 12, confidence: 0.95 });
      expect(mockInvoke).toHaveBeenCalledWith("var_forecast", {
        params: { data: "/d.csv", horizons: 12, confidence: 0.95 },
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

    it("bvar-irf with all params", async () => {
      await commands.bvarIrf({
        data: "/d.csv", lags: 4, shock: 1, horizons: 20,
        id: "cholesky", draws: 2000, sampler: "gibbs",
      });
      expect(mockInvoke).toHaveBeenCalledWith("bvar_irf", {
        params: {
          data: "/d.csv", lags: 4, shock: 1, horizons: 20,
          id: "cholesky", draws: 2000, sampler: "gibbs",
        },
      });
    });

    it("bvar-fevd basic", async () => {
      await commands.bvarFevd({ data: "/d.csv", horizons: 20, id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("bvar_fevd", {
        params: { data: "/d.csv", horizons: 20, id: "cholesky" },
      });
    });

    it("bvar-hd basic", async () => {
      await commands.bvarHd({ data: "/d.csv", id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("bvar_hd", {
        params: { data: "/d.csv", id: "cholesky" },
      });
    });

    it("bvar-forecast with draws + sampler", async () => {
      await commands.bvarForecast({ data: "/d.csv", horizons: 12, draws: 1000, sampler: "gibbs" });
      expect(mockInvoke).toHaveBeenCalledWith("bvar_forecast", {
        params: { data: "/d.csv", horizons: 12, draws: 1000, sampler: "gibbs" },
      });
    });
  });

  // ── LP ──────────────────────────────────────────────────────────────────

  describe("LP", () => {
    it("lp-estimate standard method", async () => {
      await commands.lpEstimate({ data: "/d.csv", method: "standard", vcov: "hac" });
      expect(mockInvoke).toHaveBeenCalledWith("lp_estimate", {
        params: { data: "/d.csv", method: "standard", vcov: "hac" },
      });
    });

    it("lp-estimate iv method with instruments", async () => {
      await commands.lpEstimate({
        data: "/d.csv", method: "iv", instruments: "3,4", shock: 1, horizons: 20,
      });
      expect(mockInvoke).toHaveBeenCalledWith("lp_estimate", {
        params: { data: "/d.csv", method: "iv", instruments: "3,4", shock: 1, horizons: 20 },
      });
    });

    it("lp-estimate smooth method with knots + lambda", async () => {
      await commands.lpEstimate({
        data: "/d.csv", method: "smooth", knots: 5, lambda: 0.1,
      });
      expect(mockInvoke).toHaveBeenCalledWith("lp_estimate", {
        params: { data: "/d.csv", method: "smooth", knots: 5, lambda: 0.1 },
      });
    });

    it("lp-estimate state method with transition + gamma", async () => {
      await commands.lpEstimate({
        data: "/d.csv", method: "state", state_var: 2, gamma: 1.5, transition: "logistic",
      });
      expect(mockInvoke).toHaveBeenCalledWith("lp_estimate", {
        params: { data: "/d.csv", method: "state", state_var: 2, gamma: 1.5, transition: "logistic" },
      });
    });

    it("lp-estimate propensity method", async () => {
      await commands.lpEstimate({
        data: "/d.csv", method: "propensity", treatment: 1, score_method: "logit",
      });
      expect(mockInvoke).toHaveBeenCalledWith("lp_estimate", {
        params: { data: "/d.csv", method: "propensity", treatment: 1, score_method: "logit" },
      });
    });

    it("lp-estimate robust method", async () => {
      await commands.lpEstimate({
        data: "/d.csv", method: "robust", treatment: 1, horizons: 20,
      });
      expect(mockInvoke).toHaveBeenCalledWith("lp_estimate", {
        params: { data: "/d.csv", method: "robust", treatment: 1, horizons: 20 },
      });
    });

    it("lp-irf with shocks list", async () => {
      await commands.lpIrf({ data: "/d.csv", shocks: "1,2", horizons: 20 });
      expect(mockInvoke).toHaveBeenCalledWith("lp_irf", {
        params: { data: "/d.csv", shocks: "1,2", horizons: 20 },
      });
    });

    it("lp-irf with single shock + ci", async () => {
      await commands.lpIrf({
        data: "/d.csv", shock: 1, horizons: 20, ci: "bootstrap", replications: 500,
      });
      expect(mockInvoke).toHaveBeenCalledWith("lp_irf", {
        params: { data: "/d.csv", shock: 1, horizons: 20, ci: "bootstrap", replications: 500 },
      });
    });

    it("lp-fevd basic", async () => {
      await commands.lpFevd({ data: "/d.csv", horizons: 20, id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("lp_fevd", {
        params: { data: "/d.csv", horizons: 20, id: "cholesky" },
      });
    });

    it("lp-hd basic", async () => {
      await commands.lpHd({ data: "/d.csv", id: "cholesky" });
      expect(mockInvoke).toHaveBeenCalledWith("lp_hd", {
        params: { data: "/d.csv", id: "cholesky" },
      });
    });

    it("lp-forecast with all params", async () => {
      await commands.lpForecast({
        data: "/d.csv", shock: 1, horizons: 12, shock_size: 1.0,
        lags: 4, vcov: "hac", ci_method: "bootstrap", conf_level: 0.95, n_boot: 500,
      });
      expect(mockInvoke).toHaveBeenCalledWith("lp_forecast", {
        params: {
          data: "/d.csv", shock: 1, horizons: 12, shock_size: 1.0,
          lags: 4, vcov: "hac", ci_method: "bootstrap", conf_level: 0.95, n_boot: 500,
        },
      });
    });
  });

  // ── Factor ──────────────────────────────────────────────────────────────

  describe("Factor", () => {
    it("factor-estimate static model (no nfactors)", async () => {
      await commands.factorEstimate({ data: "/d.csv", model_type: "static" });
      expect(mockInvoke).toHaveBeenCalledWith("factor_estimate", {
        params: { data: "/d.csv", model_type: "static" },
      });
    });

    it("factor-estimate static with explicit nfactors", async () => {
      await commands.factorEstimate({ data: "/d.csv", model_type: "static", nfactors: 3 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_estimate", {
        params: { data: "/d.csv", model_type: "static", nfactors: 3 },
      });
    });

    it("factor-estimate dynamic with method", async () => {
      await commands.factorEstimate({ data: "/d.csv", model_type: "dynamic", method: "twostep" });
      expect(mockInvoke).toHaveBeenCalledWith("factor_estimate", {
        params: { data: "/d.csv", model_type: "dynamic", method: "twostep" },
      });
    });

    it("factor-estimate dynamic with em method + nfactors", async () => {
      await commands.factorEstimate({ data: "/d.csv", model_type: "dynamic", method: "em", nfactors: 2 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_estimate", {
        params: { data: "/d.csv", model_type: "dynamic", method: "em", nfactors: 2 },
      });
    });

    it("factor-estimate gdfm with nfactors + dynamic_rank", async () => {
      await commands.factorEstimate({ data: "/d.csv", model_type: "gdfm", nfactors: 3, dynamic_rank: 2 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_estimate", {
        params: { data: "/d.csv", model_type: "gdfm", nfactors: 3, dynamic_rank: 2 },
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

    it("factor-forecast with model=dynamic + factor_lags", async () => {
      await commands.factorForecast({ data: "/d.csv", model: "dynamic", factor_lags: 2 });
      expect(mockInvoke).toHaveBeenCalledWith("factor_forecast", {
        params: { data: "/d.csv", model: "dynamic", factor_lags: 2 },
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

    it("nongaussian-fastica with sobi method", async () => {
      await commands.nongaussianFastica({ data: "/d.csv", method: "sobi" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_fastica", {
        params: { data: "/d.csv", method: "sobi" },
      });
    });

    it("nongaussian-fastica with dcov method", async () => {
      await commands.nongaussianFastica({ data: "/d.csv", method: "dcov" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_fastica", {
        params: { data: "/d.csv", method: "dcov" },
      });
    });

    it("nongaussian-fastica with hsic method", async () => {
      await commands.nongaussianFastica({ data: "/d.csv", method: "hsic" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_fastica", {
        params: { data: "/d.csv", method: "hsic" },
      });
    });

    it("nongaussian-ml with student_t distribution", async () => {
      await commands.nongaussianMl({ data: "/d.csv", distribution: "student_t" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_ml", {
        params: { data: "/d.csv", distribution: "student_t" },
      });
    });

    it("nongaussian-ml with mixture_normal distribution", async () => {
      await commands.nongaussianMl({ data: "/d.csv", distribution: "mixture_normal" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_ml", {
        params: { data: "/d.csv", distribution: "mixture_normal" },
      });
    });

    it("nongaussian-ml with pml distribution", async () => {
      await commands.nongaussianMl({ data: "/d.csv", distribution: "pml" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_ml", {
        params: { data: "/d.csv", distribution: "pml" },
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

    it("nongaussian-identifiability with overidentification test", async () => {
      await commands.nongaussianIdentifiability({ data: "/d.csv", test: "overidentification" });
      expect(mockInvoke).toHaveBeenCalledWith("nongaussian_identifiability", {
        params: { data: "/d.csv", test: "overidentification" },
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

    it("arima-estimate auto mode (no p)", async () => {
      await commands.arimaEstimate({ data: "/d.csv", criterion: "bic" });
      expect(mockInvoke).toHaveBeenCalledWith("arima_estimate", {
        params: { data: "/d.csv", criterion: "bic" },
      });
    });

    it("arima-estimate auto mode with max_p/max_d/max_q", async () => {
      await commands.arimaEstimate({
        data: "/d.csv", max_p: 5, max_d: 2, max_q: 5, criterion: "aic",
      });
      expect(mockInvoke).toHaveBeenCalledWith("arima_estimate", {
        params: { data: "/d.csv", max_p: 5, max_d: 2, max_q: 5, criterion: "aic" },
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
