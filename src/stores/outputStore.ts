import { create } from "zustand";
import type { OutputLine } from "../api/types";

interface OutputState {
  lines: OutputLine[];
  addLine: (level: OutputLine["level"], message: string) => void;
  clear: () => void;
}

let lineId = 0;

export const useOutputStore = create<OutputState>((set) => ({
  lines: [],
  addLine: (level, message) =>
    set((s) => ({
      lines: [
        ...s.lines,
        { id: `line-${lineId++}`, timestamp: Date.now(), level, message },
      ],
    })),
  clear: () => set({ lines: [] }),
}));
