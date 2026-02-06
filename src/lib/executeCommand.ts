import * as commands from "../api/commands";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeCommand(command: string, params: Record<string, any>): Promise<unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = params as any;
  switch (command) {
    case "var-estimate": return commands.varEstimate(p);
    case "var-lagselect": return commands.varLagSelect(p);
    case "var-stability": return commands.varStability(p);
    case "var-irf": return commands.varIrf(p);
    case "var-fevd": return commands.varFevd(p);
    case "var-hd": return commands.varHd(p);
    case "var-forecast": return commands.varForecast(p);
    case "bvar-estimate": return commands.bvarEstimate(p);
    case "bvar-posterior": return commands.bvarPosterior(p);
    case "bvar-irf": return commands.bvarIrf(p);
    case "bvar-fevd": return commands.bvarFevd(p);
    case "bvar-hd": return commands.bvarHd(p);
    case "bvar-forecast": return commands.bvarForecast(p);
    case "lp-estimate": return commands.lpEstimate(p);
    case "lp-irf": return commands.lpIrf(p);
    case "lp-fevd": return commands.lpFevd(p);
    case "lp-hd": return commands.lpHd(p);
    case "lp-forecast": return commands.lpForecast(p);
    case "factor-estimate": return commands.factorEstimate(p);
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
    case "arima-forecast": return commands.arimaForecast(p);
    default: throw new Error(`Unknown command: ${command}`);
  }
}
