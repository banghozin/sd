"use client";

import { create } from "zustand";

type State = {
  isOpen: boolean;
  ticker: string | null;
  name: string | null;
};

type Actions = {
  open: (ticker: string, name?: string) => void;
  close: () => void;
};

export const useChartModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  ticker: null,
  name: null,
  open: (ticker, name) =>
    set({ isOpen: true, ticker: ticker.toUpperCase(), name: name ?? null }),
  close: () => set({ isOpen: false, ticker: null, name: null }),
}));
