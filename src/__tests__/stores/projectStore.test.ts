import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "../../stores/projectStore";
import type { DatasetInfo } from "../../api/types";

const makeDataset = (id: string): DatasetInfo => ({
  id,
  name: `dataset-${id}`,
  path: `/data/${id}.csv`,
  columns: ["x", "y"],
  row_count: 100,
});

describe("projectStore", () => {
  beforeEach(() => {
    useProjectStore.setState({ datasets: [], activeDatasetId: null });
  });

  it("initial state: empty datasets, null activeDatasetId", () => {
    const state = useProjectStore.getState();
    expect(state.datasets).toEqual([]);
    expect(state.activeDatasetId).toBeNull();
  });

  it("addDataset appends a DatasetInfo", () => {
    const ds = makeDataset("a");
    useProjectStore.getState().addDataset(ds);
    expect(useProjectStore.getState().datasets).toEqual([ds]);
  });

  it("multiple datasets accumulate", () => {
    const a = makeDataset("a");
    const b = makeDataset("b");
    useProjectStore.getState().addDataset(a);
    useProjectStore.getState().addDataset(b);
    expect(useProjectStore.getState().datasets).toHaveLength(2);
    expect(useProjectStore.getState().datasets[0]).toEqual(a);
    expect(useProjectStore.getState().datasets[1]).toEqual(b);
  });

  it("removeDataset removes by id", () => {
    const a = makeDataset("a");
    const b = makeDataset("b");
    useProjectStore.getState().addDataset(a);
    useProjectStore.getState().addDataset(b);
    useProjectStore.getState().removeDataset("a");
    expect(useProjectStore.getState().datasets).toEqual([b]);
  });

  it("removeDataset with non-existent id is a no-op", () => {
    const a = makeDataset("a");
    useProjectStore.getState().addDataset(a);
    useProjectStore.getState().removeDataset("nonexistent");
    expect(useProjectStore.getState().datasets).toEqual([a]);
  });

  it("setActiveDataset sets id", () => {
    useProjectStore.getState().setActiveDataset("abc");
    expect(useProjectStore.getState().activeDatasetId).toBe("abc");
  });

  it("setActiveDataset(null) clears", () => {
    useProjectStore.getState().setActiveDataset("abc");
    useProjectStore.getState().setActiveDataset(null);
    expect(useProjectStore.getState().activeDatasetId).toBeNull();
  });
});
