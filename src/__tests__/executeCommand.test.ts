import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeCommand } from "../lib/executeCommand";
import * as commands from "../api/commands";

vi.mock("../api/commands", () => ({
  varEstimate: vi.fn().mockResolvedValue({ mock: "varEstimate" }),
  varLagSelect: vi.fn().mockResolvedValue({ mock: "varLagSelect" }),
  varStability: vi.fn().mockResolvedValue({ mock: "varStability" }),
  bvarEstimate: vi.fn().mockResolvedValue({ mock: "bvarEstimate" }),
  bvarPosterior: vi.fn().mockResolvedValue({ mock: "bvarPosterior" }),
  irfCompute: vi.fn().mockResolvedValue({ mock: "irfCompute" }),
  fevdCompute: vi.fn().mockResolvedValue({ mock: "fevdCompute" }),
  hdCompute: vi.fn().mockResolvedValue({ mock: "hdCompute" }),
  lpEstimate: vi.fn().mockResolvedValue({ mock: "lpEstimate" }),
  lpIv: vi.fn().mockResolvedValue({ mock: "lpIv" }),
  lpSmooth: vi.fn().mockResolvedValue({ mock: "lpSmooth" }),
  lpState: vi.fn().mockResolvedValue({ mock: "lpState" }),
  lpPropensity: vi.fn().mockResolvedValue({ mock: "lpPropensity" }),
  lpMulti: vi.fn().mockResolvedValue({ mock: "lpMulti" }),
  lpRobust: vi.fn().mockResolvedValue({ mock: "lpRobust" }),
  factorStatic: vi.fn().mockResolvedValue({ mock: "factorStatic" }),
  factorDynamic: vi.fn().mockResolvedValue({ mock: "factorDynamic" }),
  factorGdfm: vi.fn().mockResolvedValue({ mock: "factorGdfm" }),
  testAdf: vi.fn().mockResolvedValue({ mock: "testAdf" }),
  testKpss: vi.fn().mockResolvedValue({ mock: "testKpss" }),
  testPp: vi.fn().mockResolvedValue({ mock: "testPp" }),
  testZa: vi.fn().mockResolvedValue({ mock: "testZa" }),
  testNp: vi.fn().mockResolvedValue({ mock: "testNp" }),
  testJohansen: vi.fn().mockResolvedValue({ mock: "testJohansen" }),
  gmmEstimate: vi.fn().mockResolvedValue({ mock: "gmmEstimate" }),
  arimaEstimate: vi.fn().mockResolvedValue({ mock: "arimaEstimate" }),
  arimaAuto: vi.fn().mockResolvedValue({ mock: "arimaAuto" }),
  arimaForecast: vi.fn().mockResolvedValue({ mock: "arimaForecast" }),
  loadCsv: vi.fn(),
  loadExcel: vi.fn(),
  previewData: vi.fn(),
}));

const commandMap: [string, keyof typeof commands][] = [
  ["var-estimate", "varEstimate"],
  ["var-lagselect", "varLagSelect"],
  ["var-stability", "varStability"],
  ["bvar-estimate", "bvarEstimate"],
  ["bvar-posterior", "bvarPosterior"],
  ["irf-compute", "irfCompute"],
  ["fevd-compute", "fevdCompute"],
  ["hd-compute", "hdCompute"],
  ["lp-estimate", "lpEstimate"],
  ["lp-iv", "lpIv"],
  ["lp-smooth", "lpSmooth"],
  ["lp-state", "lpState"],
  ["lp-propensity", "lpPropensity"],
  ["lp-multi", "lpMulti"],
  ["lp-robust", "lpRobust"],
  ["factor-static", "factorStatic"],
  ["factor-dynamic", "factorDynamic"],
  ["factor-gdfm", "factorGdfm"],
  ["test-adf", "testAdf"],
  ["test-kpss", "testKpss"],
  ["test-pp", "testPp"],
  ["test-za", "testZa"],
  ["test-np", "testNp"],
  ["test-johansen", "testJohansen"],
  ["gmm-estimate", "gmmEstimate"],
  ["arima-estimate", "arimaEstimate"],
  ["arima-auto", "arimaAuto"],
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
