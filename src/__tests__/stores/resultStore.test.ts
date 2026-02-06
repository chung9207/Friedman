import { describe, it, expect, beforeEach } from "vitest";
import { useResultStore } from "../../stores/resultStore";

describe("resultStore", () => {
  beforeEach(() => {
    useResultStore.setState({ results: [] });
  });

  it("initial state: empty results", () => {
    expect(useResultStore.getState().results).toEqual([]);
  });

  it("addResult creates with generated id + timestamp, returns id", () => {
    const id = useResultStore.getState().addResult({
      command: "var-estimate",
      label: "VAR Estimation",
      params: { data: "/path.csv" },
      data: { coefs: [1] },
    });
    expect(id).toBeTruthy();
    const results = useResultStore.getState().results;
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(id);
    expect(results[0].timestamp).toBeTypeOf("number");
    expect(results[0].command).toBe("var-estimate");
  });

  it("new results are prepended (newest first)", () => {
    useResultStore.getState().addResult({
      command: "first",
      label: "First",
      params: {},
      data: null,
    });
    useResultStore.getState().addResult({
      command: "second",
      label: "Second",
      params: {},
      data: null,
    });
    const results = useResultStore.getState().results;
    expect(results[0].command).toBe("second");
    expect(results[1].command).toBe("first");
  });

  it("removeResult removes by id", () => {
    const id = useResultStore.getState().addResult({
      command: "var-estimate",
      label: "VAR",
      params: {},
      data: null,
    });
    useResultStore.getState().removeResult(id);
    expect(useResultStore.getState().results).toEqual([]);
  });

  it("removeResult with bad id is no-op", () => {
    useResultStore.getState().addResult({
      command: "var-estimate",
      label: "VAR",
      params: {},
      data: null,
    });
    useResultStore.getState().removeResult("nonexistent");
    expect(useResultStore.getState().results).toHaveLength(1);
  });

  it("clearAll empties all", () => {
    useResultStore.getState().addResult({
      command: "a",
      label: "A",
      params: {},
      data: null,
    });
    useResultStore.getState().addResult({
      command: "b",
      label: "B",
      params: {},
      data: null,
    });
    useResultStore.getState().clearAll();
    expect(useResultStore.getState().results).toEqual([]);
  });
});
