"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/lib/store/notification-store";

const POLL_MS = 90_000; // 90 seconds — slightly slower than the 60s server cache

type Signal = {
  ticker: string;
  name: string;
  price: number;
  priceChangePct: number;
  rvol: number;
  todayVolume: number;
};

type UnusualVolumeResponse = {
  generatedAt: string;
  marketStatus: string;
  signals: Signal[];
};

const ET_DAY = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getETDayKey(): string {
  return ET_DAY.format(new Date()).replace(/\//g, "-"); // "MM-DD-YYYY"
}

export function NotificationManager() {
  const enabled = useNotificationStore((s) => s.enabled);
  const hydrated = useNotificationStore((s) => s.hasHydrated);
  const threshold = useNotificationStore((s) => s.rvolThreshold);
  const recordNotified = useNotificationStore((s) => s.recordNotified);
  const hasNotified = useNotificationStore((s) => s.hasNotified);
  const pruneOlderThan = useNotificationStore((s) => s.pruneOlderThan);

  useEffect(() => {
    if (!hydrated || !enabled) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      if (cancelled) return;
      if (document.visibilityState !== "visible") return;
      try {
        const r = await fetch("/api/unusual-volume", { cache: "no-store" });
        if (!r.ok) return;
        const data = (await r.json()) as UnusualVolumeResponse;
        if (data.marketStatus !== "open") return;
        const dayKey = getETDayKey();
        // Prune state from previous days to keep storage small
        pruneOlderThan(dayKey);

        const candidates = data.signals.filter(
          (s) => s.rvol >= threshold && !hasNotified(dayKey, s.ticker),
        );
        // Notify the top 3 strongest at most per tick to avoid spam
        for (const s of candidates.slice(0, 3)) {
          try {
            const n = new Notification(`🔥 ${s.ticker} 거래량 ${s.rvol.toFixed(1)}배 폭증`, {
              body: `${s.name}\n현재가 $${s.price.toFixed(2)} (${
                s.priceChangePct > 0 ? "+" : ""
              }${s.priceChangePct.toFixed(2)}%)`,
              tag: `unusual-volume-${s.ticker}-${dayKey}`,
              icon: "/icon.svg",
            });
            n.onclick = () => {
              window.focus();
              window.location.href = "/unusual-volume";
              n.close();
            };
            recordNotified(dayKey, s.ticker);
          } catch {
            /* ignore individual notification failures */
          }
        }
      } catch {
        /* ignore poll errors */
      }
    };

    tick();
    timer = setInterval(tick, POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hydrated, enabled, threshold, recordNotified, hasNotified, pruneOlderThan]);

  return null;
}
