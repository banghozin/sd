import type { Sector } from "@/lib/mock-data/sectors";
import type { Us13FHolding } from "@/lib/mock-data/smart-money";

import fxBundled from "@/data/fx.json";
import sectorsBundled from "@/data/sectors.json";
import us13fBundled from "@/data/us-13f.json";
import krInsidersBundled from "@/data/kr-insiders.json";
import unusualVolumeBundled from "@/data/unusual-volume.json";

/**
 * The JSON files under `src/data/` are rewritten by GitHub Actions dozens of
 * times a day. If pages read them via `import`, every data commit needs a full
 * Vercel build to reach users — ~60 deployments/day, which blows through the
 * Hobby quota.
 *
 * Instead we read them over HTTP from the repo's raw endpoint at request time
 * and let ISR handle freshness. That lets `vercel.json`'s `ignoreCommand` skip
 * builds for data-only commits entirely. The bundled copy is kept purely as an
 * offline fallback for when raw.githubusercontent.com is unreachable.
 */
const RAW_BASE =
  process.env.NEXT_PUBLIC_DATA_RAW_BASE ??
  "https://raw.githubusercontent.com/banghozin/sd/main/src/data";

async function loadData<T>(
  file: string,
  fallback: T,
  revalidate: number,
): Promise<T> {
  try {
    const res = await fetch(`${RAW_BASE}/${file}`, {
      next: { revalidate },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export type FxData = {
  pair: string;
  rate: number;
  asOf: string;
  fetchedAt: string;
  source: string;
};

export type SectorsData = {
  sectors: Sector[];
  fetchedAt: string | null;
  source?: string;
};

export type Us13FData = {
  holdings: Us13FHolding[];
  fetchedAt?: string;
  source?: string;
};

export type KrInsiderTradeLive = {
  id: string;
  name: string;
  position: string;
  stock: string;
  amountKRW: number;
  shareDelta?: number;
  action: "BUY" | "SELL";
  filedAt: string;
};

export type KrInsidersData = {
  trades: KrInsiderTradeLive[];
  fetchedAt?: string;
  source?: string;
};

export type UnusualVolumeSignal = {
  ticker: string;
  name: string;
  price: number;
  priceChangePct: number;
  todayVolume: number;
  avg5dVolume: number;
  rvol: number;
  elapsedMin: number;
  mcap: number;
};

export type UnusualVolumeData = {
  generatedAt: string;
  marketStatus: string;
  universeCount?: number;
  scannedCount?: number;
  count: number;
  signals: UnusualVolumeSignal[];
};

export type SignalHistoryEntry = {
  date: string;
  ticker: string;
  name: string;
  rvol: number;
  priceAtDetection: number;
  priceChangePctAtDetection: number;
  mcap: number;
  capturedAt: string;
};

export type SignalHistoryData = {
  lastUpdated: string;
  signals: SignalHistoryEntry[];
};

// FX comes from the ECB daily reference rate — hourly is plenty.
export function getFx(): Promise<FxData> {
  return loadData("fx.json", fxBundled as FxData, 3600);
}

// Sector ETFs refresh hourly upstream; revalidate a bit faster so the
// "마지막 갱신" stamp doesn't lag a full cycle behind.
export function getSectors(): Promise<SectorsData> {
  return loadData("sectors.json", sectorsBundled as unknown as SectorsData, 900);
}

// 13F is a quarterly filing — no need to poll hard.
export function getUs13F(): Promise<Us13FData> {
  return loadData("us-13f.json", us13fBundled as unknown as Us13FData, 21600);
}

export function getKrInsiders(): Promise<KrInsidersData> {
  return loadData(
    "kr-insiders.json",
    krInsidersBundled as unknown as KrInsidersData,
    3600,
  );
}

// Scanned every 30 min during US market hours.
export function getUnusualVolume(): Promise<UnusualVolumeData> {
  return loadData(
    "unusual-volume.json",
    unusualVolumeBundled as UnusualVolumeData,
    300,
  );
}

// Only the backtest route reads this and it is large, so there is no
// bundled fallback — an empty history renders the "no data" state.
export function getSignalHistory(): Promise<SignalHistoryData> {
  return loadData<SignalHistoryData>(
    "signal-history.json",
    { lastUpdated: "", signals: [] },
    600,
  );
}
