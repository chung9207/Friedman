import type { JournalOption } from "../stores/journalStore";

export interface FlowNode {
  message: string;
  options: JournalOption[];
}

export function getInitialOptions(hasData: boolean): FlowNode {
  if (!hasData) {
    return {
      message: "Welcome to Friedman. Load a dataset first to begin your analysis.",
      options: [
        { label: "Go to Data Page", command: "__navigate_data", description: "Import CSV or Excel data" },
      ],
    };
  }

  return {
    message: "What would you like to do?",
    options: [
      { label: "Unit Root Tests", command: "__menu_unitroot", description: "ADF, KPSS, PP, ZA, NP tests" },
      { label: "VAR Analysis", command: "__menu_var", description: "Vector Autoregression" },
      { label: "BVAR Analysis", command: "__menu_bvar", description: "Bayesian VAR" },
      { label: "Local Projections", command: "__menu_lp", description: "LP estimation methods" },
      { label: "Factor Models", command: "__menu_factor", description: "Static, Dynamic, GDFM" },
      { label: "ARIMA", command: "__menu_arima", description: "Univariate time series" },
      { label: "GMM", command: "__menu_gmm", description: "Generalized Method of Moments" },
      { label: "Non-Gaussian SVAR", command: "__menu_nongaussian", description: "ICA, ML, heteroskedasticity identification" },
    ],
  };
}

const UNIT_ROOT_MENU: FlowNode = {
  message: "Which unit root test would you like to run?",
  options: [
    { label: "ADF Test", command: "test-adf", description: "Augmented Dickey-Fuller" },
    { label: "KPSS Test", command: "test-kpss", description: "Kwiatkowski-Phillips-Schmidt-Shin" },
    { label: "Phillips-Perron", command: "test-pp", description: "Phillips-Perron test" },
    { label: "Zivot-Andrews", command: "test-za", description: "Structural break unit root" },
    { label: "Ng-Perron", command: "test-np", description: "Modified unit root tests" },
  ],
};

const VAR_MENU: FlowNode = {
  message: "VAR Analysis — estimation:",
  options: [
    { label: "Lag Selection", command: "var-lagselect", description: "Select optimal lag order" },
    { label: "VAR Estimate", command: "var-estimate", description: "Estimate the VAR model" },
    { label: "Stability Check", command: "var-stability", description: "Check eigenvalue stability" },
  ],
};

const VAR_MENU_2: FlowNode = {
  message: "VAR Analysis — post-estimation:",
  options: [
    { label: "VAR IRF", command: "var-irf", description: "Impulse response functions" },
    { label: "VAR FEVD", command: "var-fevd", description: "Forecast error variance decomposition" },
    { label: "VAR HD", command: "var-hd", description: "Historical decomposition" },
    { label: "VAR Forecast", command: "var-forecast", description: "Point forecasts" },
  ],
};

const BVAR_MENU: FlowNode = {
  message: "BVAR Analysis — estimation:",
  options: [
    { label: "BVAR Estimate", command: "bvar-estimate", description: "Estimate Bayesian VAR" },
    { label: "BVAR Posterior", command: "bvar-posterior", description: "Posterior analysis" },
  ],
};

const BVAR_MENU_2: FlowNode = {
  message: "BVAR Analysis — post-estimation:",
  options: [
    { label: "BVAR IRF", command: "bvar-irf", description: "Bayesian impulse responses" },
    { label: "BVAR FEVD", command: "bvar-fevd", description: "Bayesian variance decomposition" },
    { label: "BVAR HD", command: "bvar-hd", description: "Bayesian historical decomposition" },
    { label: "BVAR Forecast", command: "bvar-forecast", description: "Bayesian forecasts" },
  ],
};

const LP_MENU: FlowNode = {
  message: "Local Projections — estimation:",
  options: [
    { label: "LP Estimate", command: "lp-estimate", description: "LP estimation (method selected in form)" },
  ],
};

const LP_MENU_2: FlowNode = {
  message: "Local Projections — post-estimation:",
  options: [
    { label: "LP IRF", command: "lp-irf", description: "Structural LP impulse responses" },
    { label: "LP FEVD", command: "lp-fevd", description: "LP variance decomposition" },
    { label: "LP HD", command: "lp-hd", description: "LP historical decomposition" },
    { label: "LP Forecast", command: "lp-forecast", description: "Direct LP forecasts" },
  ],
};

const FACTOR_MENU: FlowNode = {
  message: "Which factor model operation?",
  options: [
    { label: "Factor Estimate", command: "factor-estimate", description: "Estimate factor model (static/dynamic/gdfm)" },
    { label: "Factor Forecast", command: "factor-forecast", description: "Forecast using factor model" },
  ],
};

const NONGAUSSIAN_MENU: FlowNode = {
  message: "Non-Gaussian SVAR — which method?",
  options: [
    { label: "Normality Tests", command: "nongaussian-normality", description: "Test VAR residual normality" },
    { label: "FastICA", command: "nongaussian-fastica", description: "ICA-based identification" },
    { label: "ML Estimation", command: "nongaussian-ml", description: "Maximum likelihood non-Gaussian" },
    { label: "Heteroskedasticity", command: "nongaussian-heteroskedasticity", description: "Volatility-based identification" },
    { label: "Identifiability Tests", command: "nongaussian-identifiability", description: "Test identification conditions" },
  ],
};

const ARIMA_MENU: FlowNode = {
  message: "ARIMA — what would you like to do?",
  options: [
    { label: "ARIMA Estimate", command: "arima-estimate", description: "ARIMA(p,d,q) or auto (omit p)" },
    { label: "ARIMA Forecast", command: "arima-forecast", description: "Generate forecasts" },
  ],
};

export function getSubMenu(menuCommand: string): FlowNode | null {
  switch (menuCommand) {
    case "__menu_unitroot": return UNIT_ROOT_MENU;
    case "__menu_var": return VAR_MENU;
    case "__menu_var2": return VAR_MENU_2;
    case "__menu_bvar": return BVAR_MENU;
    case "__menu_bvar2": return BVAR_MENU_2;
    case "__menu_lp": return LP_MENU;
    case "__menu_lp2": return LP_MENU_2;
    case "__menu_factor": return FACTOR_MENU;
    case "__menu_arima": return ARIMA_MENU;
    case "__menu_gmm": return {
      message: "GMM Estimation",
      options: [
        { label: "GMM Estimate", command: "gmm-estimate", description: "Generalized Method of Moments" },
      ],
    };
    case "__menu_nongaussian": return NONGAUSSIAN_MENU;
    default: return null;
  }
}

export function getNextSteps(completedCommand: string, result: unknown): FlowNode {
  const data = result as Record<string, unknown> | null;

  switch (completedCommand) {
    // Unit root tests
    case "test-adf":
    case "test-kpss":
    case "test-pp":
    case "test-za":
    case "test-np":
      return {
        message: "Unit root test complete. What next?",
        options: [
          { label: "Run Another Test", command: "__menu_unitroot", description: "Compare with another test" },
          { label: "Johansen Cointegration", command: "test-johansen", description: "Multivariate cointegration" },
          { label: "Proceed to Estimation", command: "__main_menu", description: "Back to main menu" },
        ],
      };

    case "test-johansen":
      return {
        message: "Cointegration test complete. What next?",
        options: [
          { label: "VAR Analysis", command: "__menu_var", description: "Estimate a VAR model" },
          { label: "Main Menu", command: "__main_menu", description: "Back to main menu" },
        ],
      };

    // VAR branch
    case "var-lagselect":
      return {
        message: "Lag selection complete. Proceed with VAR estimation?",
        options: [
          { label: "VAR Estimate", command: "var-estimate", description: "Estimate the VAR model" },
          { label: "Main Menu", command: "__main_menu", description: "Back to main menu" },
        ],
      };

    case "var-estimate":
      return {
        message: "VAR estimated. What next?",
        options: [
          { label: "Stability Check", command: "var-stability", description: "Check eigenvalue stability" },
          { label: "VAR IRF", command: "var-irf", description: "Impulse response functions" },
          { label: "VAR FEVD", command: "var-fevd", description: "Variance decomposition" },
          { label: "VAR HD", command: "var-hd", description: "Historical decomposition" },
          { label: "VAR Forecast", command: "var-forecast", description: "Point forecasts" },
        ],
      };

    case "var-stability": {
      const stable = data && (data.stable === true || data.is_stable === true);
      if (stable) {
        return {
          message: "VAR is stable. Proceed with analysis:",
          options: [
            { label: "VAR IRF", command: "var-irf", description: "Impulse response functions" },
            { label: "VAR FEVD", command: "var-fevd", description: "Variance decomposition" },
            { label: "VAR HD", command: "var-hd", description: "Historical decomposition" },
            { label: "VAR Forecast", command: "var-forecast", description: "Point forecasts" },
          ],
        };
      }
      return {
        message: "VAR may be unstable. Consider re-estimating with different lags.",
        options: [
          { label: "Re-estimate VAR", command: "var-estimate", description: "Try different specification" },
          { label: "Lag Selection", command: "var-lagselect", description: "Re-select optimal lags" },
          { label: "VAR IRF (anyway)", command: "var-irf", description: "Proceed despite instability" },
        ],
      };
    }

    case "var-irf":
      return {
        message: "VAR IRF computed. What next?",
        options: [
          { label: "VAR FEVD", command: "var-fevd", description: "Variance decomposition" },
          { label: "VAR HD", command: "var-hd", description: "Historical decomposition" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "var-fevd":
      return {
        message: "VAR FEVD computed. What next?",
        options: [
          { label: "VAR HD", command: "var-hd", description: "Historical decomposition" },
          { label: "VAR IRF", command: "var-irf", description: "Impulse response functions" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "var-hd":
    case "var-forecast":
      return {
        message: "Computation complete.",
        options: [
          { label: "New Analysis", command: "__main_menu", description: "Start a new analysis" },
        ],
      };

    // BVAR branch
    case "bvar-estimate":
      return {
        message: "BVAR estimated. What next?",
        options: [
          { label: "BVAR Posterior", command: "bvar-posterior", description: "Posterior analysis" },
          { label: "BVAR IRF", command: "bvar-irf", description: "Bayesian impulse responses" },
          { label: "BVAR FEVD", command: "bvar-fevd", description: "Bayesian variance decomposition" },
          { label: "BVAR HD", command: "bvar-hd", description: "Bayesian historical decomposition" },
          { label: "BVAR Forecast", command: "bvar-forecast", description: "Bayesian forecasts" },
        ],
      };

    case "bvar-posterior":
      return {
        message: "Posterior analysis complete. What next?",
        options: [
          { label: "BVAR IRF", command: "bvar-irf", description: "Bayesian impulse responses" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "bvar-irf":
    case "bvar-fevd":
    case "bvar-hd":
    case "bvar-forecast":
      return {
        message: "BVAR analysis complete. What next?",
        options: [
          { label: "More BVAR Analysis", command: "__menu_bvar2", description: "Other BVAR post-estimation" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    // LP branch
    case "lp-estimate":
      return {
        message: "Local projection estimated. What next?",
        options: [
          { label: "LP IRF", command: "lp-irf", description: "Structural LP impulse responses" },
          { label: "LP FEVD", command: "lp-fevd", description: "LP variance decomposition" },
          { label: "LP HD", command: "lp-hd", description: "LP historical decomposition" },
          { label: "LP Forecast", command: "lp-forecast", description: "Direct LP forecasts" },
          { label: "Try Another Method", command: "lp-estimate", description: "Estimate with different method" },
        ],
      };

    case "lp-irf":
    case "lp-fevd":
    case "lp-hd":
    case "lp-forecast":
      return {
        message: "LP analysis complete. What next?",
        options: [
          { label: "More LP Analysis", command: "__menu_lp2", description: "Other LP post-estimation" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    // Factor branch
    case "factor-estimate":
      return {
        message: "Factor model estimated. What next?",
        options: [
          { label: "Factor Forecast", command: "factor-forecast", description: "Forecast using factor model" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "factor-forecast":
      return {
        message: "Factor forecast generated. What next?",
        options: [
          { label: "Try Another Model", command: "__menu_factor", description: "Different factor model" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    // ARIMA branch
    case "arima-estimate":
      return {
        message: "ARIMA estimated. What next?",
        options: [
          { label: "ARIMA Forecast", command: "arima-forecast", description: "Generate forecasts" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "arima-forecast":
      return {
        message: "Forecast generated.",
        options: [
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    // Non-Gaussian SVAR branch
    case "nongaussian-normality":
      return {
        message: "Normality tests complete. What next?",
        options: [
          { label: "FastICA Identification", command: "nongaussian-fastica", description: "ICA-based non-Gaussian SVAR" },
          { label: "ML Identification", command: "nongaussian-ml", description: "Maximum likelihood approach" },
          { label: "Identifiability Tests", command: "nongaussian-identifiability", description: "Test identification conditions" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "nongaussian-fastica":
    case "nongaussian-ml":
    case "nongaussian-heteroskedasticity":
      return {
        message: "Non-Gaussian SVAR identified. What next?",
        options: [
          { label: "Identifiability Tests", command: "nongaussian-identifiability", description: "Verify identification" },
          { label: "Try Another Method", command: "__menu_nongaussian", description: "Different identification method" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "nongaussian-identifiability":
      return {
        message: "Identifiability tests complete. What next?",
        options: [
          { label: "Try Another Method", command: "__menu_nongaussian", description: "Different identification method" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    // GMM
    case "gmm-estimate":
      return {
        message: "GMM estimated.",
        options: [
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    default:
      return {
        message: "What would you like to do next?",
        options: [
          { label: "Main Menu", command: "__main_menu", description: "Back to main menu" },
        ],
      };
  }
}

// Maps command strings to human-readable labels
export const COMMAND_LABELS: Record<string, string> = {
  "var-estimate": "VAR Estimation",
  "var-lagselect": "VAR Lag Selection",
  "var-stability": "VAR Stability Check",
  "var-irf": "VAR IRF",
  "var-fevd": "VAR FEVD",
  "var-hd": "VAR Historical Decomposition",
  "var-forecast": "VAR Forecast",
  "bvar-estimate": "BVAR Estimation",
  "bvar-posterior": "BVAR Posterior",
  "bvar-irf": "BVAR IRF",
  "bvar-fevd": "BVAR FEVD",
  "bvar-hd": "BVAR Historical Decomposition",
  "bvar-forecast": "BVAR Forecast",
  "lp-estimate": "Local Projections",
  "lp-irf": "LP IRF",
  "lp-fevd": "LP FEVD",
  "lp-hd": "LP Historical Decomposition",
  "lp-forecast": "LP Forecast",
  "factor-estimate": "Factor Model Estimation",
  "factor-forecast": "Factor Forecast",
  "nongaussian-fastica": "Non-Gaussian SVAR (FastICA)",
  "nongaussian-ml": "Non-Gaussian SVAR (ML)",
  "nongaussian-heteroskedasticity": "Heteroskedasticity SVAR",
  "nongaussian-normality": "Normality Tests",
  "nongaussian-identifiability": "Identifiability Tests",
  "test-adf": "ADF Test",
  "test-kpss": "KPSS Test",
  "test-pp": "Phillips-Perron Test",
  "test-za": "Zivot-Andrews Test",
  "test-np": "Ng-Perron Test",
  "test-johansen": "Johansen Cointegration Test",
  "gmm-estimate": "GMM Estimation",
  "arima-estimate": "ARIMA Estimation",
  "arima-forecast": "ARIMA Forecast",
};
