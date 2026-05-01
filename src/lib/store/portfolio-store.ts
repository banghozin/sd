"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Holding = {
  id: string;
  ticker: string;
  amount: number;
};

type State = {
  holdings: Holding[];
  hasHydrated: boolean;
};

type Actions = {
  add: (ticker: string, amount: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  seedSample: () => void;
  setHasHydrated: (v: boolean) => void;
};

const SAMPLE: Holding[] = [
  { id: "sample-1", ticker: "QQQ", amount: 5000000 },
  { id: "sample-2", ticker: "TIGER 미국S&P500", amount: 3000000 },
  { id: "sample-3", ticker: "삼성전자", amount: 2000000 },
];

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const usePortfolioStore = create<State & Actions>()(
  persist(
    (set) => ({
      holdings: [],
      hasHydrated: false,
      add: (ticker, amount) =>
        set((s) => ({
          holdings: [
            ...s.holdings,
            { id: uid(), ticker: ticker.trim(), amount },
          ],
        })),
      remove: (id) =>
        set((s) => ({ holdings: s.holdings.filter((h) => h.id !== id) })),
      clear: () => set({ holdings: [] }),
      seedSample: () => set({ holdings: SAMPLE }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "portfolio-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ holdings: s.holdings }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
