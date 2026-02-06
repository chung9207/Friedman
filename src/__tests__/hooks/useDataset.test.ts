import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActiveDataset } from "../../hooks/useDataset";
import { useProjectStore } from "../../stores/projectStore";

describe("useActiveDataset", () => {
  beforeEach(() => {
    useProjectStore.setState({ datasets: [], activeDatasetId: null });
  });

  it("returns null when no datasets", () => {
    const { result } = renderHook(() => useActiveDataset());
    expect(result.current).toBeNull();
  });

  it("returns null when activeDatasetId doesn't match", () => {
    useProjectStore.setState({
      datasets: [{ id: "a", name: "A", path: "/a.csv", columns: ["x"], row_count: 10 }],
      activeDatasetId: "nonexistent",
    });
    const { result } = renderHook(() => useActiveDataset());
    expect(result.current).toBeNull();
  });

  it("returns matching dataset when found", () => {
    const ds = { id: "a", name: "A", path: "/a.csv", columns: ["x", "y"], row_count: 50 };
    useProjectStore.setState({
      datasets: [ds],
      activeDatasetId: "a",
    });
    const { result } = renderHook(() => useActiveDataset());
    expect(result.current).toEqual(ds);
  });
});
