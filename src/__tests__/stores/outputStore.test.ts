import { describe, it, expect, beforeEach } from "vitest";
import { useOutputStore } from "../../stores/outputStore";

describe("outputStore", () => {
  beforeEach(() => {
    useOutputStore.setState({ lines: [] });
  });

  it("initial state: empty lines", () => {
    expect(useOutputStore.getState().lines).toEqual([]);
  });

  it("addLine appends with correct level, message, timestamp, unique id", () => {
    useOutputStore.getState().addLine("info", "hello");
    const lines = useOutputStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0].level).toBe("info");
    expect(lines[0].message).toBe("hello");
    expect(lines[0].timestamp).toBeTypeOf("number");
    expect(lines[0].id).toBeTruthy();
  });

  it("multiple lines are ordered", () => {
    useOutputStore.getState().addLine("info", "first");
    useOutputStore.getState().addLine("warn", "second");
    const lines = useOutputStore.getState().lines;
    expect(lines).toHaveLength(2);
    expect(lines[0].message).toBe("first");
    expect(lines[1].message).toBe("second");
  });

  it("all 4 levels work (info, warn, error, success)", () => {
    for (const level of ["info", "warn", "error", "success"] as const) {
      useOutputStore.getState().addLine(level, `msg-${level}`);
    }
    const lines = useOutputStore.getState().lines;
    expect(lines).toHaveLength(4);
    expect(lines.map((l) => l.level)).toEqual(["info", "warn", "error", "success"]);
  });

  it("ids are unique across lines", () => {
    useOutputStore.getState().addLine("info", "a");
    useOutputStore.getState().addLine("info", "b");
    const lines = useOutputStore.getState().lines;
    expect(lines[0].id).not.toBe(lines[1].id);
  });

  it("clear removes all lines", () => {
    useOutputStore.getState().addLine("info", "a");
    useOutputStore.getState().addLine("warn", "b");
    useOutputStore.getState().clear();
    expect(useOutputStore.getState().lines).toEqual([]);
  });
});
