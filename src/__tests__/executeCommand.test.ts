import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeCommand } from "../lib/executeCommand";
import * as commands from "../api/commands";

vi.mock("../api/commands", () => ({
  varEstimate: vi.fn().mockResolvedValue({ mock: "varEstimate" }),
  varLagSelect: vi.fn().mockResolvedValue({ mock: "varLagSelect" }),
  varStability: vi.fn().mockResolvedValue({ mock: "varStability" }),
  varIrf: vi.fn().mockResolvedValue({ mock: "varIrf" }),
  varFevd: vi.fn().mockResolvedValue({ mock: "varFevd" }),
  varHd: vi.fn().mockResolvedValue({ mock: "varHd" }),
  varForecast: vi.fn().mockResolvedValue({ mock: "varForecast" }),
  bvarEstimate: vi.fn().mockResolvedValue({ mock: "bvarEstimate" }),
  bvarPosterior: vi.fn().mockResolvedValue({ mock: "bvarPosterior" }),
  bvarIrf: vi.fn().mockResolvedValue({ mock: "bvarIrf" }),
  bvarFevd: vi.fn().mockResolvedValue({ mock: "bvarFevd" }),
  bvarHd: vi.fn().mockResolvedValue({ mock: "bvarHd" }),
  bvarForecast: vi.fn().mockResolvedValue({ mock: "bvarForecast" }),
  lpEstimate: vi.fn().mockResolvedValue({ mock: "lpEstimate" }),
  lpIrf: vi.fn().mockResolvedValue({ mock: "lpIrf" }),
  lpFevd: vi.fn().mockResolvedValue({ mock: "lpFevd" }),
  lpHd: vi.fn().mockResolvedValue({ mock: "lpHd" }),
  lpForecast: vi.fn().mockResolvedValue({ mock: "lpForecast" }),
  factorEstimate: vi.fn().mockResolvedValue({ mock: "factorEstimate" }),
  factorForecast: vi.fn().mockResolvedValue({ mock: "factorForecast" }),
  nongaussianFastica: vi.fn().mockResolvedValue({ mock: "nongaussianFastica" }),
  nongaussianMl: vi.fn().mockResolvedValue({ mock: "nongaussianMl" }),
  nongaussianHeteroskedasticity: vi.fn().mockResolvedValue({ mock: "nongaussianHeteroskedasticity" }),
  nongaussianNormality: vi.fn().mockResolvedValue({ mock: "nongaussianNormality" }),
  nongaussianIdentifiability: vi.fn().mockResolvedValue({ mock: "nongaussianIdentifiability" }),
  testAdf: vi.fn().mockResolvedValue({ mock: "testAdf" }),
  testKpss: vi.fn().mockResolvedValue({ mock: "testKpss" }),
  testPp: vi.fn().mockResolvedValue({ mock: "testPp" }),
  testZa: vi.fn().mockResolvedValue({ mock: "testZa" }),
  testNp: vi.fn().mockResolvedValue({ mock: "testNp" }),
  testJohansen: vi.fn().mockResolvedValue({ mock: "testJohansen" }),
  gmmEstimate: vi.fn().mockResolvedValue({ mock: "gmmEstimate" }),
  arimaEstimate: vi.fn().mockResolvedValue({ mock: "arimaEstimate" }),
  arimaForecast: vi.fn().mockResolvedValue({ mock: "arimaForecast" }),
  loadCsv: vi.fn(),
  loadExcel: vi.fn(),
  previewData: vi.fn(),
}));

const commandMap: [string, keyof typeof commands][] = [
  ["var-estimate", "varEstimate"],
  ["var-lagselect", "varLagSelect"],
  ["var-stability", "varStability"],
  ["var-irf", "varIrf"],
  ["var-fevd", "varFevd"],
  ["var-hd", "varHd"],
  ["var-forecast", "varForecast"],
  ["bvar-estimate", "bvarEstimate"],
  ["bvar-posterior", "bvarPosterior"],
  ["bvar-irf", "bvarIrf"],
  ["bvar-fevd", "bvarFevd"],
  ["bvar-hd", "bvarHd"],
  ["bvar-forecast", "bvarForecast"],
  ["lp-estimate", "lpEstimate"],
  ["lp-irf", "lpIrf"],
  ["lp-fevd", "lpFevd"],
  ["lp-hd", "lpHd"],
  ["lp-forecast", "lpForecast"],
  ["factor-estimate", "factorEstimate"],
  ["factor-forecast", "factorForecast"],
  ["nongaussian-fastica", "nongaussianFastica"],
  ["nongaussian-ml", "nongaussianMl"],
  ["nongaussian-heteroskedasticity", "nongaussianHeteroskedasticity"],
  ["nongaussian-normality", "nongaussianNormality"],
  ["nongaussian-identifiability", "nongaussianIdentifiability"],
  ["test-adf", "testAdf"],
  ["test-kpss", "testKpss"],
  ["test-pp", "testPp"],
  ["test-za", "testZa"],
  ["test-np", "testNp"],
  ["test-johansen", "testJohansen"],
  ["gmm-estimate", "gmmEstimate"],
  ["arima-estimate", "arimaEstimate"],
  ["arima-forecast", "arimaForecast"],
];

describe("executeCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  for (const [cmdString, fnName] of commandMap) {
    it(`"${cmdString}" dispatches to commands.${fnName}`, async () => {
      const params = { data: "/test.csv" };
      await executeCommand(cmdString, params);
      expect(commands[fnName]).toHaveBeenCalledWith(params);
    });
  }

  it("params are passed through", async () => {
    const params = { data: "/test.csv", lags: 4, trend: "constant" };
    await executeCommand("var-estimate", params);
    expect(commands.varEstimate).toHaveBeenCalledWith(params);
  });

  it("returns the result from the command function", async () => {
    const result = await executeCommand("var-estimate", { data: "/test.csv" });
    expect(result).toEqual({ mock: "varEstimate" });
  });

  it("unknown command throws Error with descriptive message", async () => {
    await expect(executeCommand("unknown-cmd", {})).rejects.toThrow(
      "Unknown command: unknown-cmd"
    );
  });
});
