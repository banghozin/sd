"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WatchlistKind =
  | "us-stock" // ticker on US exchanges
  | "us-etf" // sector ETF (SPY, XLK, etc.)
  | "kr-stock" // ticker on KR exchanges (.KS / .KQ)
  | "kr-etf" // KR sector ETF
  | "fund"; // 13F filer (institutional fund name, no ticker)

export type WatchlistItem = {
  id: string; // unique key (kind + ticker)
  kind: WatchlistKind;
  ticker: string; // ticker symbol or fund identifier
  name: string; // display name
  addedAt: string; // ISO timestamp
};

type State = {
  items: WatchlistItem[];
  hasHydrated: boolean;
};

type Actions = {
  add: (item: Omit<WatchlistItem, "id" | "addedAt">) => void;
  remove: (id: string) => void;
  toggle: (item: Omit<WatchlistItem, "id" | "addedAt">) => void;
  has: (kind: WatchlistKind, ticker: string) => boolean;
  clear: () => void;
  setHasHydrated: (v: boolean) => void;
};

function makeId(kind: WatchlistKind, ticker: string): string {
  return `${kind}:${ticker.toUpperCase()}`;
}

export const useWatchlistStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      add: (item) =>
        set((s) => {
          const id = makeId(item.kind, item.ticker);
          if (s.items.some((x) => x.id === id)) return s;
          return {
            items: [
              { ...item, id, addedAt: new Date().toISOString() },
              ...s.items,
            ],
          };
        }),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      toggle: (item) => {
        const id = makeId(item.kind, item.ticker);
        const exists = get().items.some((x) => x.id === id);
        if (exists) {
          set((s) => ({ items: s.items.filter((x) => x.id !== id) }));
        } else {
          set((s) => ({
            items: [
              { ...item, id, addedAt: new Date().toISOString() },
              ...s.items,
            ],
          }));
        }
      },
      has: (kind, ticker) =>
        get().items.some((x) => x.id === makeId(kind, ticker)),
      clear: () => set({ items: [] }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "watchlist-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
