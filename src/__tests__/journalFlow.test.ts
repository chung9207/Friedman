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

    it("__menu_var → 3 estimation items (lagselect, estimate, stability)", () => {
      const menu = getSubMenu("__menu_var");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(3);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "var-lagselect", "var-estimate", "var-stability",
      ]);
    });

    it("__menu_var2 → 4 post-estimation items (irf, fevd, hd, forecast)", () => {
      const menu = getSubMenu("__menu_var2");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(4);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "var-irf", "var-fevd", "var-hd", "var-forecast",
      ]);
    });

    it("__menu_bvar → 2 estimation items (estimate, posterior)", () => {
      const menu = getSubMenu("__menu_bvar");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(2);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "bvar-estimate", "bvar-posterior",
      ]);
    });

    it("__menu_bvar2 → 4 post-estimation items (irf, fevd, hd, forecast)", () => {
      const menu = getSubMenu("__menu_bvar2");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(4);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "bvar-irf", "bvar-fevd", "bvar-hd", "bvar-forecast",
      ]);
    });

    it("__menu_lp → 1 LP estimation item", () => {
      const menu = getSubMenu("__menu_lp");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(1);
      expect(menu!.options[0].command).toBe("lp-estimate");
    });

    it("__menu_lp2 → 4 LP post-estimation items", () => {
      const menu = getSubMenu("__menu_lp2");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(4);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "lp-irf", "lp-fevd", "lp-hd", "lp-forecast",
      ]);
    });

    it("__menu_factor → 2 factor items (estimate, forecast)", () => {
      const menu = getSubMenu("__menu_factor");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(2);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "factor-estimate", "factor-forecast",
      ]);
    });

    it("__menu_nongaussian → 5 non-gaussian methods (incl. identifiability)", () => {
      const menu = getSubMenu("__menu_nongaussian");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(5);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "nongaussian-normality", "nongaussian-fastica", "nongaussian-ml",
        "nongaussian-heteroskedasticity", "nongaussian-identifiability",
      ]);
    });

    it("__menu_arima → 2 ARIMA options (estimate, forecast)", () => {
      const menu = getSubMenu("__menu_arima");
      expect(menu).not.toBeNull();
      expect(menu!.options).toHaveLength(2);
      expect(menu!.options.map((o) => o.command)).toEqual([
        "arima-estimate", "arima-forecast",
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

    it("after var-estimate → stability, var-irf, var-fevd, var-hd, var-forecast", () => {
      const next = getNextSteps("var-estimate", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "var-stability", "var-irf", "var-fevd", "var-hd", "var-forecast",
      ]);
    });

    it("after var-stability (stable=true) → var-irf, var-fevd, var-hd, var-forecast", () => {
      const next = getNextSteps("var-stability", { stable: true });
      expect(next.options.map((o) => o.command)).toEqual([
        "var-irf", "var-fevd", "var-hd", "var-forecast",
      ]);
    });

    it("after var-stability (unstable) → re-estimate, lagselect, var-irf anyway", () => {
      const next = getNextSteps("var-stability", { stable: false });
      expect(next.options.map((o) => o.command)).toEqual([
        "var-estimate", "var-lagselect", "var-irf",
      ]);
    });

    it("after var-irf → var-fevd, var-hd, new analysis", () => {
      const next = getNextSteps("var-irf", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "var-fevd", "var-hd", "__main_menu",
      ]);
    });

    it("after var-fevd → var-hd, var-irf, new analysis", () => {
      const next = getNextSteps("var-fevd", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "var-hd", "var-irf", "__main_menu",
      ]);
    });

    it("after var-hd → new analysis only", () => {
      const next = getNextSteps("var-hd", {});
      expect(next.options).toHaveLength(1);
      expect(next.options[0].command).toBe("__main_menu");
    });

    it("after var-forecast → new analysis only", () => {
      const next = getNextSteps("var-forecast", {});
      expect(next.options).toHaveLength(1);
      expect(next.options[0].command).toBe("__main_menu");
    });

    // BVAR branch
    it("after bvar-estimate → posterior, bvar-irf, bvar-fevd, bvar-hd, bvar-forecast", () => {
      const next = getNextSteps("bvar-estimate", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "bvar-posterior", "bvar-irf", "bvar-fevd", "bvar-hd", "bvar-forecast",
      ]);
    });

    it("after bvar-posterior → bvar-irf, new analysis", () => {
      const next = getNextSteps("bvar-posterior", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "bvar-irf", "__main_menu",
      ]);
    });

    for (const cmd of ["bvar-irf", "bvar-fevd", "bvar-hd", "bvar-forecast"]) {
      it(`after ${cmd} → more BVAR analysis, new analysis`, () => {
        const next = getNextSteps(cmd, {});
        expect(next.options.map((o) => o.command)).toEqual([
          "__menu_bvar2", "__main_menu",
        ]);
      });
    }

    // LP branch
    it("after lp-estimate → lp-irf, lp-fevd, lp-hd, lp-forecast, try another", () => {
      const next = getNextSteps("lp-estimate", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "lp-irf", "lp-fevd", "lp-hd", "lp-forecast", "lp-estimate",
      ]);
    });

    for (const cmd of ["lp-irf", "lp-fevd", "lp-hd", "lp-forecast"]) {
      it(`after ${cmd} → more LP analysis, new analysis`, () => {
        const next = getNextSteps(cmd, {});
        expect(next.options.map((o) => o.command)).toEqual([
          "__menu_lp2", "__main_menu",
        ]);
      });
    }

    // Factor branch
    it("after factor-estimate → factor-forecast, new analysis", () => {
      const next = getNextSteps("factor-estimate", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "factor-forecast", "__main_menu",
      ]);
    });

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
      it(`after ${cmd} → identifiability, try another, new analysis`, () => {
        const next = getNextSteps(cmd, {});
        expect(next.options.map((o) => o.command)).toEqual([
          "nongaussian-identifiability", "__menu_nongaussian", "__main_menu",
        ]);
      });
    }

    it("after nongaussian-identifiability → try another, new analysis", () => {
      const next = getNextSteps("nongaussian-identifiability", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "__menu_nongaussian", "__main_menu",
      ]);
    });

    // ARIMA branch
    it("after arima-estimate → forecast, new analysis", () => {
      const next = getNextSteps("arima-estimate", {});
      expect(next.options.map((o) => o.command)).toEqual([
        "arima-forecast", "__main_menu",
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
        "var-irf", "var-fevd", "var-hd", "var-forecast",
        "bvar-estimate", "bvar-posterior",
        "bvar-irf", "bvar-fevd", "bvar-hd", "bvar-forecast",
        "lp-estimate", "lp-irf", "lp-fevd", "lp-hd", "lp-forecast",
        "factor-estimate", "factor-forecast",
        "nongaussian-fastica", "nongaussian-ml", "nongaussian-heteroskedasticity",
        "nongaussian-normality", "nongaussian-identifiability",
        "test-adf", "test-kpss", "test-pp", "test-za", "test-np", "test-johansen",
        "gmm-estimate",
        "arima-estimate", "arima-forecast",
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
      expect(COMMAND_LABELS["var-irf"]).toBe("VAR IRF");
      expect(COMMAND_LABELS["test-adf"]).toBe("ADF Test");
      expect(COMMAND_LABELS["arima-estimate"]).toBe("ARIMA Estimation");
    });
  });
});
