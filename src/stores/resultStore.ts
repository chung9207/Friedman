import { create } from "zustand";

export interface SavedResult {
  id: string;
  timestamp: number;
  command: string;
  label: string;
  params: Record<string, unknown>;
  data: unknown;
}

interface ResultState {
  results: SavedResult[];
  addResult: (result: Omit<SavedResult, "id" | "timestamp">) => string;
  removeResult: (id: string) => void;
  clearAll: () => void;
}

let resultCounter = 0;

export const useResultStore = create<ResultState>((set) => ({
  results: [],
  addResult: (result) => {
    const id = `result-${Date.now()}-${resultCounter++}`;
    set((s) => ({
      results: [
        { ...result, id, timestamp: Date.now() },
        ...s.results,
      ],
    }));
    return id;
  },
  removeResult: (id) =>
    set((s) => ({ results: s.results.filter((r) => r.id !== id) })),
  clearAll: () => set({ results: [] }),
}));
