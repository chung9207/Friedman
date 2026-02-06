import * as commands from "../api/commands";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeCommand(command: string, params: Record<string, any>): Promise<unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = params as any;
  switch (command) {
    case "var-estimate": return commands.varEstimate(p);
    case "var-lagselect": return commands.varLagSelect(p);
    case "var-stability": return commands.varStability(p);
    case "bvar-estimate": return commands.bvarEstimate(p);
    case "bvar-posterior": return commands.bvarPosterior(p);
    case "irf-compute": return commands.irfCompute(p);
    case "fevd-compute": return commands.fevdCompute(p);
    case "hd-compute": return commands.hdCompute(p);
    case "lp-estimate": return commands.lpEstimate(p);
    case "lp-iv": return commands.lpIv(p);
    case "lp-smooth": return commands.lpSmooth(p);
    case "lp-state": return commands.lpState(p);
    case "lp-propensity": return commands.lpPropensity(p);
    case "lp-multi": return commands.lpMulti(p);
    case "lp-robust": return commands.lpRobust(p);
    case "factor-static": return commands.factorStatic(p);
    case "factor-dynamic": return commands.factorDynamic(p);
    case "factor-gdfm": return commands.factorGdfm(p);
    case "factor-forecast": return commands.factorForecast(p);
    case "nongaussian-fastica": return commands.nongaussianFastica(p);
    case "nongaussian-ml": return commands.nongaussianMl(p);
    case "nongaussian-heteroskedasticity": return commands.nongaussianHeteroskedasticity(p);
    case "nongaussian-normality": return commands.nongaussianNormality(p);
    case "nongaussian-identifiability": return commands.nongaussianIdentifiability(p);
    case "test-adf": return commands.testAdf(p);
    case "test-kpss": return commands.testKpss(p);
    case "test-pp": return commands.testPp(p);
    case "test-za": return commands.testZa(p);
    case "test-np": return commands.testNp(p);
    case "test-johansen": return commands.testJohansen(p);
    case "gmm-estimate": return commands.gmmEstimate(p);
    case "arima-estimate": return commands.arimaEstimate(p);
    case "arima-auto": return commands.arimaAuto(p);
    case "arima-forecast": return commands.arimaForecast(p);
    default: throw new Error(`Unknown command: ${command}`);
  }
}
