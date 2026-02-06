import { describe, it, expect, beforeEach } from "vitest";
import { useNavigationStore } from "../../stores/navigationStore";

describe("navigationStore", () => {
  beforeEach(() => {
    useNavigationStore.setState({ activePage: "data" });
  });

  it("defaults to 'data' page", () => {
    expect(useNavigationStore.getState().activePage).toBe("data");
  });

  it("setActivePage changes to journal", () => {
    useNavigationStore.getState().setActivePage("journal");
    expect(useNavigationStore.getState().activePage).toBe("journal");
  });

  it("setActivePage changes to each of the 4 pages", () => {
    for (const page of ["data", "journal", "result", "backlog"] as const) {
      useNavigationStore.getState().setActivePage(page);
      expect(useNavigationStore.getState().activePage).toBe(page);
    }
  });

  it("setting same page twice is idempotent", () => {
    useNavigationStore.getState().setActivePage("result");
    useNavigationStore.getState().setActivePage("result");
    expect(useNavigationStore.getState().activePage).toBe("result");
  });
});
