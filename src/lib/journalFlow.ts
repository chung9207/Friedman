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
  message: "VAR Analysis — what would you like to do?",
  options: [
    { label: "Lag Selection", command: "var-lagselect", description: "Select optimal lag order" },
    { label: "VAR Estimate", command: "var-estimate", description: "Estimate the VAR model" },
  ],
};

const BVAR_MENU: FlowNode = {
  message: "BVAR Analysis — what would you like to do?",
  options: [
    { label: "BVAR Estimate", command: "bvar-estimate", description: "Estimate Bayesian VAR" },
  ],
};

const LP_MENU: FlowNode = {
  message: "Which Local Projection method?",
  options: [
    { label: "Standard LP", command: "lp-estimate", description: "Standard local projections" },
    { label: "LP-IV", command: "lp-iv", description: "Instrumental variable LP" },
    { label: "Smooth LP", command: "lp-smooth", description: "Smooth local projections" },
    { label: "State-Dependent LP", command: "lp-state", description: "Regime-switching LP" },
  ],
};

const LP_MENU_2: FlowNode = {
  message: "More Local Projection methods:",
  options: [
    { label: "Propensity Score LP", command: "lp-propensity", description: "Propensity-score weighted" },
    { label: "Multi-Shock LP", command: "lp-multi", description: "Multiple shocks simultaneously" },
    { label: "Doubly Robust LP", command: "lp-robust", description: "Doubly robust estimation" },
  ],
};

const FACTOR_MENU: FlowNode = {
  message: "Which factor model?",
  options: [
    { label: "Static Factor", command: "factor-static", description: "Static factor analysis" },
    { label: "Dynamic Factor", command: "factor-dynamic", description: "Dynamic factor model" },
    { label: "GDFM", command: "factor-gdfm", description: "Generalized dynamic factor model" },
  ],
};

const ARIMA_MENU: FlowNode = {
  message: "ARIMA — what would you like to do?",
  options: [
    { label: "Auto ARIMA", command: "arima-auto", description: "Automatic model selection" },
    { label: "ARIMA Estimate", command: "arima-estimate", description: "Manual ARIMA(p,d,q)" },
    { label: "ARIMA Forecast", command: "arima-forecast", description: "Generate forecasts" },
  ],
};

export function getSubMenu(menuCommand: string): FlowNode | null {
  switch (menuCommand) {
    case "__menu_unitroot": return UNIT_ROOT_MENU;
    case "__menu_var": return VAR_MENU;
    case "__menu_bvar": return BVAR_MENU;
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
          { label: "IRF Compute", command: "irf-compute", description: "Impulse response functions" },
          { label: "FEVD Compute", command: "fevd-compute", description: "Forecast error variance decomposition" },
          { label: "HD Compute", command: "hd-compute", description: "Historical decomposition" },
        ],
      };

    case "var-stability": {
      const stable = data && (data.stable === true || data.is_stable === true);
      if (stable) {
        return {
          message: "VAR is stable. Proceed with analysis:",
          options: [
            { label: "IRF Compute", command: "irf-compute", description: "Impulse response functions" },
            { label: "FEVD Compute", command: "fevd-compute", description: "Forecast error variance decomposition" },
            { label: "HD Compute", command: "hd-compute", description: "Historical decomposition" },
          ],
        };
      }
      return {
        message: "VAR may be unstable. Consider re-estimating with different lags.",
        options: [
          { label: "Re-estimate VAR", command: "var-estimate", description: "Try different specification" },
          { label: "Lag Selection", command: "var-lagselect", description: "Re-select optimal lags" },
          { label: "IRF Compute (anyway)", command: "irf-compute", description: "Proceed despite instability" },
        ],
      };
    }

    case "irf-compute":
      return {
        message: "IRF computed. What next?",
        options: [
          { label: "FEVD Compute", command: "fevd-compute", description: "Variance decomposition" },
          { label: "HD Compute", command: "hd-compute", description: "Historical decomposition" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "fevd-compute":
      return {
        message: "FEVD computed. What next?",
        options: [
          { label: "HD Compute", command: "hd-compute", description: "Historical decomposition" },
          { label: "IRF Compute", command: "irf-compute", description: "Impulse response functions" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "hd-compute":
      return {
        message: "Historical decomposition computed.",
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
          { label: "IRF Compute", command: "irf-compute", description: "Impulse response functions" },
          { label: "FEVD Compute", command: "fevd-compute", description: "Variance decomposition" },
        ],
      };

    case "bvar-posterior":
      return {
        message: "Posterior analysis complete. What next?",
        options: [
          { label: "IRF Compute", command: "irf-compute", description: "Impulse response functions" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    // LP branch
    case "lp-estimate":
    case "lp-iv":
    case "lp-smooth":
    case "lp-state":
    case "lp-propensity":
    case "lp-multi":
    case "lp-robust":
      return {
        message: "Local projection estimated. What next?",
        options: [
          { label: "Try Another LP", command: "__menu_lp", description: "Different LP method" },
          { label: "More LP Methods", command: "__menu_lp2", description: "Propensity, Multi, Robust" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    // Factor branch
    case "factor-static":
    case "factor-dynamic":
    case "factor-gdfm":
      return {
        message: "Factor model estimated. What next?",
        options: [
          { label: "Try Another Model", command: "__menu_factor", description: "Different factor model" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    // ARIMA branch
    case "arima-auto":
      return {
        message: "Auto ARIMA complete. What next?",
        options: [
          { label: "ARIMA Forecast", command: "arima-forecast", description: "Generate forecasts" },
          { label: "ARIMA Estimate", command: "arima-estimate", description: "Manual specification" },
          { label: "New Analysis", command: "__main_menu", description: "Start fresh" },
        ],
      };

    case "arima-estimate":
      return {
        message: "ARIMA estimated. What next?",
        options: [
          { label: "ARIMA Forecast", command: "arima-forecast", description: "Generate forecasts" },
          { label: "Auto ARIMA", command: "arima-auto", description: "Compare with auto" },
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
  "bvar-estimate": "BVAR Estimation",
  "bvar-posterior": "BVAR Posterior",
  "irf-compute": "IRF Computation",
  "fevd-compute": "FEVD Computation",
  "hd-compute": "Historical Decomposition",
  "lp-estimate": "Local Projections",
  "lp-iv": "LP-IV",
  "lp-smooth": "Smooth LP",
  "lp-state": "State-Dependent LP",
  "lp-propensity": "Propensity Score LP",
  "lp-multi": "Multi-Shock LP",
  "lp-robust": "Doubly Robust LP",
  "factor-static": "Static Factor Model",
  "factor-dynamic": "Dynamic Factor Model",
  "factor-gdfm": "GDFM",
  "test-adf": "ADF Test",
  "test-kpss": "KPSS Test",
  "test-pp": "Phillips-Perron Test",
  "test-za": "Zivot-Andrews Test",
  "test-np": "Ng-Perron Test",
  "test-johansen": "Johansen Cointegration Test",
  "gmm-estimate": "GMM Estimation",
  "arima-estimate": "ARIMA Estimation",
  "arima-auto": "Auto ARIMA",
  "arima-forecast": "ARIMA Forecast",
};
