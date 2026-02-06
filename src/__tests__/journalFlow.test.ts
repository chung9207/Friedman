import { describe, it, expect } from "vitest";
import { getInitialOptions, getSubMenu, getNextSteps, COMMAND_LABELS } from "../lib/journalFlow";

describe("journalFlow", () => {
  // ── getInitialOptions ──────────────────────────────────────────────────

  describe("getInitialOptions", () => {
    it("no data → message mentions 'Load a dataset'", () => {
      const result = getInitialOptions(false);
      expect(result.message).toContain("Load a dataset");
    });

    it("no data → single __navigate_data option", () => {
      const result = getInitialOptions(false);
      expect(result.options).toHaveLength(1);
      expect(result.options[0].command).toBe("__navigate_data");
    });

    it("has data → message 'What would you like to do?'", () => {
      const result = getInitialOptions(true);
      expect(result.message).toBe("What would you like to do?");
    });

    it("has data → 8 options for all analysis types", () => {
      const result = getInitialOptions(true);
      expect(result.options).toHaveLength(8);
    });

    it("all options have label, command, description", () => {
      const result = getInitialOptions(true);
      for (const opt of result.options) {
        expect(opt.label).toBeTruthy();
        expect(opt.command).toBeTruthy();
        expect(opt.description).toBeTruthy();
      }
    });
  });

  // ── getSubMenu ─────────────────────────────────────────────────────────

  describe("getSubMenu", () => {
    it("__menu_unitroot → 5 unit root tests", () => {
      const menu = getSubMenu("__menu_unitroot");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(5);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "test-adf", "test-kpss", "test-pp", "test-za", "test-np",
      ]);
    });

    it("__menu_var → lagselect + estimate", () => {
      const menu = getSubMenu("__menu_var");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(2);
      expect(menu!.options.map((o) => o.command)).toEqual(["var-lagselect", "var-estimate"]);
    });

    it("__menu_bvar → estimate", () => {
      const menu = getSubMenu("__menu_bvar");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(1);
      expect(menu!.options[0].command).toBe("bvar-estimate");
    });

    it("__menu_lp → 4 LP methods", () => {
      const menu = getSubMenu("__menu_lp");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(4);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "lp-estimate", "lp-iv", "lp-smooth", "lp-state",
      ]);
    });

    it("__menu_lp2 → 3 more LP methods", () => {
      const menu = getSubMenu("__menu_lp2");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(3);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "lp-propensity", "lp-multi", "lp-robust",
      ]);
    });

    it("__menu_factor → 4 factor models (incl. forecast)", () => {
      const menu = getSubMenu("__menu_factor");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(4);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "factor-static", "factor-dynamic", "factor-gdfm", "factor-forecast",
      ]);
    });

    it("__menu_nongaussian → 4 non-gaussian methods", () => {
      const menu = getSubMenu("__menu_nongaussian");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(4);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "nongaussian-normality", "nongaussian-fastica", "nongaussian-ml", "nongaussian-heteroskedasticity",
      ]);
    });

    it("__menu_nongaussian2 → identifiability tests", () => {
      const menu = getSubMenu("__menu_nongaussian2");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(1);
      expect(menu!.options[0].command).toBe("nongaussian-identifiability");
    });

    it("__menu_arima → 3 ARIMA options", () => {
      const menu = getSubMenu("__menu_arima");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(3);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "arima-auto", "arima-estimate", "arima-forecast",
      ]);
    });

    it("__menu_gmm → gmm-estimate", () => {
      const menu = getSubMenu("__menu_gmm");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(1);
      expect(menu!.options[0].command).toBe("gmm-estimate");
    });

    it("unknown → null", () => {
      expect(getSubMenu("__menu_unknown")).toBeNull();
    });
  });

  // ── getNextSteps ───────────────────────────────────────────────────────

  describe("getNextSteps", () => {
    // Unit root tests
    for (const cmd of ["test-adf", "test-kpss", "test-pp", "test-za", "test-np"]) {
      it(`after ${cmd} → run another, johansen, proceed`, () => {
        const next = getNextSteps(cmd, {});
        expect(next.options.map((o) => o.command)).toEqual([
          "__menu_unitroot", "test-johansen", "__main_menu",
        ]);
      });
    }

    it("after johansen → VAR or main menu", () => {
      const next = getNextSteps("test-johansen", {});
      expect(next.options.map((o) => o.command)).toEqual(["__menu_var", "__main_menu"]);
    });

    it("after var-lagselect → var-estimate or main menu", () => {
      const next = getNextSteps("var-lagselect", {});
      expect(next.options.map((o) => o.command)).toEqual(["var-estimate", "__main_menu"]);
    });

    it("after var-estimate → stability, irf, fevd, hd", () => {
      const next = getNextSteps("var-estimate", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "var-stability", "irf-compute", "fevd-compute", "hd-compute",
      ]);
    });

    it("after var-stability (stable=true) → irf, fevd, hd", () => {
      const next = getNextSteps("var-stability", { stable: true });
      expect(next.options.map((o) => o.command)).toEqual([
        "irf-compute", "fevd-compute", "hd-compute",
      ]);
    });

    it("after var-stability (unstable) → re-estimate, lagselect, irf anyway", () => {
      const next = getNextSteps("var-stability", { stable: false });
      expect(next.options.map((o) => o.command)).toEqual([
        "var-estimate", "var-lagselect", "irf-compute",
      ]);
    });

    it("after irf-compute → fevd, hd, new analysis", () => {
      const next = getNextSteps("irf-compute", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "fevd-compute", "hd-compute", "__main_menu",
      ]);
    });

    it("after fevd-compute → hd, irf, new analysis", () => {
      const next = getNextSteps("fevd-compute", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "hd-compute", "irf-compute", "__main_menu",
      ]);
    });

    it("after hd-compute → new analysis only", () => {
      const next = getNextSteps("hd-compute", {});
      expect(next.options).toHaveLength(1);
      expect(next.options[0].command).toBe("__main_menu");
    });

    it("after bvar-estimate → posterior, irf, fevd", () => {
      const next = getNextSteps("bvar-estimate", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "bvar-posterior", "irf-compute", "fevd-compute",
      ]);
    });

    it("after bvar-posterior → irf, new analysis", () => {
      const next = getNextSteps("bvar-posterior", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "irf-compute", "__main_menu",
      ]);
    });

    // LP commands
    for (const cmd of [
      "lp-estimate", "lp-iv", "lp-smooth", "lp-state",
      "lp-propensity", "lp-multi", "lp-robust",
    ]) {
      it(`after ${cmd} → try another, more methods, new analysis`, () => {
        const next = getNextSteps(cmd, {});
        expect(next.options.map((o) => o.command)).toEqual([
          "__menu_lp", "__menu_lp2", "__main_menu",
        ]);
      });
    }

    // Factor models
    for (const cmd of ["factor-static", "factor-dynamic", "factor-gdfm"]) {
      it(`after ${cmd} → forecast, try another, new analysis`, () => {
        const next = getNextSteps(cmd, {});
        expect(next.options.map((o) => o.command)).toEqual([
          "factor-forecast", "__menu_factor", "__main_menu",
        ]);
      });
    }

    it("after factor-forecast → try another, new analysis", () => {
      const next = getNextSteps("factor-forecast", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "__menu_factor", "__main_menu",
      ]);
    });

    // Non-Gaussian SVAR
    it("after nongaussian-normality → fastica, ml, identifiability, new analysis", () => {
      const next = getNextSteps("nongaussian-normality", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "nongaussian-fastica", "nongaussian-ml", "nongaussian-identifiability", "__main_menu",
      ]);
    });

    for (const cmd of ["nongaussian-fastica", "nongaussian-ml", "nongaussian-heteroskedasticity"]) {
      it(`after ${cmd} → identifiability, try another, more, new analysis`, () => {
        const next = getNextSteps(cmd, {});
        expect(next.options.map((o) => o.command)).toEqual([
          "nongaussian-identifiability", "__menu_nongaussian", "__menu_nongaussian2", "__main_menu",
        ]);
      });
    }

    it("after nongaussian-identifiability → try another, new analysis", () => {
      const next = getNextSteps("nongaussian-identifiability", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "__menu_nongaussian", "__main_menu",
      ]);
    });

    it("after arima-auto → forecast, manual, new analysis", () => {
      const next = getNextSteps("arima-auto", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "arima-forecast", "arima-estimate", "__main_menu",
      ]);
    });

    it("after arima-estimate → forecast, auto, new analysis", () => {
      const next = getNextSteps("arima-estimate", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "arima-forecast", "arima-auto", "__main_menu",
      ]);
    });

    it("after arima-forecast → new analysis", () => {
      const next = getNextSteps("arima-forecast", {});
      expect(next.options).toHaveLength(1);
      expect(next.options[0].command).toBe("__main_menu");
    });

    it("after gmm-estimate → new analysis", () => {
      const next = getNextSteps("gmm-estimate", {});
      expect(next.options).toHaveLength(1);
      expect(next.options[0].command).toBe("__main_menu");
    });

    it("unknown command → main menu fallback", () => {
      const next = getNextSteps("something-unknown", {});
      expect(next.options).toHaveLength(1);
      expect(next.options[0].command).toBe("__main_menu");
    });
  });

  // ── COMMAND_LABELS ─────────────────────────────────────────────────────

  describe("COMMAND_LABELS", () => {
    it("has entries for all 34 commands", () => {
      const expectedCommands = [
        "var-estimate", "var-lagselect", "var-stability",
        "bvar-estimate", "bvar-posterior",
        "irf-compute", "fevd-compute", "hd-compute",
        "lp-estimate", "lp-iv", "lp-smooth", "lp-state",
        "lp-propensity", "lp-multi", "lp-robust",
        "factor-static", "factor-dynamic", "factor-gdfm", "factor-forecast",
        "nongaussian-fastica", "nongaussian-ml", "nongaussian-heteroskedasticity",
        "nongaussian-normality", "nongaussian-identifiability",
        "test-adf", "test-kpss", "test-pp", "test-za", "test-np", "test-johansen",
        "gmm-estimate",
        "arima-estimate", "arima-auto", "arima-forecast",
      ];
      for (const cmd of expectedCommands) {
        expect(COMMAND_LABELS[cmd]).toBeDefined();
      }
    });

    it("all values are non-empty strings", () => {
      for (const val of Object.values(COMMAND_LABELS)) {
        expect(val).toBeTypeOf("string");
        expect(val.length).toBeGreaterThan(0);
      }
    });

    it("specific label values verified", () => {
      expect(COMMAND_LABELS["var-estimate"]).toBe("VAR Estimation");
      expect(COMMAND_LABELS["irf-compute"]).toBe("IRF Computation");
      expect(COMMAND_LABELS["test-adf"]).toBe("ADF Test");
      expect(COMMAND_LABELS["arima-auto"]).toBe("Auto ARIMA");
    });
  });
});
