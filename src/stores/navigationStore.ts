import { create } from "zustand";

export type Page = "data" | "journal" | "result" | "backlog";

interface NavigationState {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activePage: "data",
  setActivePage: (page) => set({ activePage: page }),
}));
