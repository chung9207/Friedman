import { create } from "zustand";
import type { DatasetInfo } from "../api/types";

interface ProjectState {
  datasets: DatasetInfo[];
  activeDatasetId: string | null;
  addDataset: (ds: DatasetInfo) => void;
  removeDataset: (id: string) => void;
  setActiveDataset: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  datasets: [],
  activeDatasetId: null,
  addDataset: (ds) =>
    set((s) => ({ datasets: [...s.datasets, ds] })),
  removeDataset: (id) =>
    set((s) => ({ datasets: s.datasets.filter((d) => d.id !== id) })),
  setActiveDataset: (id) =>
    set({ activeDatasetId: id }),
}));
