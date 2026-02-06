import { useProjectStore } from "../stores/projectStore";

export function useActiveDataset() {
  const datasets = useProjectStore((s) => s.datasets);
  const activeDatasetId = useProjectStore((s) => s.activeDatasetId);
  return datasets.find((d) => d.id === activeDatasetId) ?? null;
}
