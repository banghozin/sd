"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State = {
  enabled: boolean; // user wants notifications
  rvolThreshold: number; // RVol cutoff above which we fire a notification
  notifiedKeys: Record<string, string[]>; // date (US ET) -> ticker[]
  hasHydrated: boolean;
};

type Actions = {
  setEnabled: (v: boolean) => void;
  setRvolThreshold: (v: number) => void;
  recordNotified: (dateKey: string, ticker: string) => void;
  pruneOlderThan: (dateKey: string) => void;
  hasNotified: (dateKey: string, ticker: string) => boolean;
  setHasHydrated: (v: boolean) => void;
};

export const useNotificationStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      enabled: false,
      rvolThreshold: 5,
      notifiedKeys: {},
      hasHydrated: false,
      setEnabled: (v) => set({ enabled: v }),
      setRvolThreshold: (v) => set({ rvolThreshold: v }),
      recordNotified: (dateKey, ticker) =>
        set((s) => {
          const existing = s.notifiedKeys[dateKey] ?? [];
          if (existing.includes(ticker)) return s;
          return {
            notifiedKeys: {
              ...s.notifiedKeys,
              [dateKey]: [...existing, ticker],
            },
          };
        }),
      pruneOlderThan: (cutoffDateKey) =>
        set((s) => {
          const next: Record<string, string[]> = {};
          for (const [k, v] of Object.entries(s.notifiedKeys)) {
            if (k >= cutoffDateKey) next[k] = v;
          }
          return { notifiedKeys: next };
        }),
      hasNotified: (dateKey, ticker) =>
        (get().notifiedKeys[dateKey] ?? []).includes(ticker),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        enabled: s.enabled,
        rvolThreshold: s.rvolThreshold,
        notifiedKeys: s.notifiedKeys,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
