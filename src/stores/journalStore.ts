import { create } from "zustand";

export interface JournalOption {
  label: string;
  command: string;
  description?: string;
}

export type JournalEntry =
  | { type: "system"; id: string; text: string; options?: JournalOption[] }
  | { type: "user-choice"; id: string; label: string }
  | { type: "form"; id: string; command: string; status: "filling" | "running" | "done"; params: Record<string, unknown> }
  | { type: "result"; id: string; command: string; data: unknown; resultId: string }
  | { type: "error"; id: string; message: string };

interface JournalState {
  entries: JournalEntry[];
  addSystemMessage: (text: string, options?: JournalOption[]) => void;
  addUserChoice: (label: string) => void;
  addForm: (command: string) => string;
  updateFormStatus: (id: string, status: "filling" | "running" | "done", params?: Record<string, unknown>) => void;
  addResult: (command: string, data: unknown, resultId: string) => void;
  addError: (message: string) => void;
  clearAll: () => void;
}

let entryCounter = 0;
function nextId() {
  return `entry-${Date.now()}-${entryCounter++}`;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  addSystemMessage: (text, options) =>
    set((s) => ({
      entries: [...s.entries, { type: "system", id: nextId(), text, options }],
    })),
  addUserChoice: (label) =>
    set((s) => ({
      entries: [...s.entries, { type: "user-choice", id: nextId(), label }],
    })),
  addForm: (command) => {
    const id = nextId();
    set((s) => ({
      entries: [...s.entries, { type: "form", id, command, status: "filling", params: {} }],
    }));
    return id;
  },
  updateFormStatus: (id, status, params) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id && e.type === "form"
          ? { ...e, status, ...(params ? { params } : {}) }
          : e
      ),
    })),
  addResult: (command, data, resultId) =>
    set((s) => ({
      entries: [...s.entries, { type: "result", id: nextId(), command, data, resultId }],
    })),
  addError: (message) =>
    set((s) => ({
      entries: [...s.entries, { type: "error", id: nextId(), message }],
    })),
  clearAll: () => set({ entries: [] }),
}));
