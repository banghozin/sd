// Unusual volume scanner.
// Reads universe.json, fetches today's intraday volume for each ticker,
// and flags those with rate-projected daily volume ≥ 3x of 5-day average
// while price change is within ±2% (stealth accumulation signal).
// Runs every 30 minutes during US market hours.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const UNIVERSE_PATH = resolve("src/data/universe.json");
const OUT_PATH = resolve("src/data/unusual-volume.json");

// Signal criteria
const RVOL_THRESHOLD = 3; // 3x average
const PRICE_CHANGE_LIMIT = 0.02; // ±2%
const MIN_ELAPSED_MINUTES = 30; // Skip first 30 min after open (too noisy)
const REGULAR_SESSION_MINUTES = 390; // 6.5h × 60

// Concurrency
const CONCURRENCY = 12;

type UniverseFile = {
  generatedAt: string;
  count: number;
  tickers: Array<{ t: string; n: string; m: number; v: number }>;
};

type ChartResponse = {
  chart: {
    result?: Array<{
      meta: {
        symbol?: string;
        shortName?: string;
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
        regularMarketVolume?: number;
        gmtoffset?: number;
        currentTradingPeriod?: {
          regular?: { start?: number; end?: number };
        };
      };
    }>;
    error?: { code?: string; description?: string } | null;
  };
};

type Snapshot = {
  ticker: string;
  name: string;
  price: number;
  priceChangePct: number; // -100..100
  todayVolume: number;
  marketTime: number; // unix seconds
  sessionStart: number; // unix seconds
  sessionEnd: number; // unix seconds
};

async function fetchSnapshot(ticker: string): Promise<Snapshot | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StockDashboard/1.0)",
        Accept: "application/json",
      },
    });
    if (!r.ok) return null;
    const data = (await r.json()) as ChartResponse;
    if (data.chart.error || !data.chart.result?.length) return null;
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice ?? 0;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? 0;
    const vol = meta.regularMarketVolume ?? 0;
    const marketTime = meta.regularMarketTime ?? 0;
    const sessionStart = meta.currentTradingPeriod?.regular?.start ?? 0;
    const sessionEnd = meta.currentTradingPeriod?.regular?.end ?? 0;
    if (!price || !prev || !vol || !marketTime || !sessionStart) {
      return null;
    }
    return {
      ticker,
      name: meta.shortName ?? ticker,
      price,
      priceChangePct: ((price - prev) / prev) * 100,
      todayVolume: vol,
      marketTime,
      sessionStart,
      sessionEnd,
    };
  } catch {
    return null;
  }
}

function isMarketOpen(snap: Snapshot): boolean {
  // marketTime falls within current trading session start/end
  return (
    snap.marketTime >= snap.sessionStart && snap.marketTime <= snap.sessionEnd
  );
}

function elapsedSessionMinutes(snap: Snapshot): number {
  return Math.max(0, (snap.marketTime - snap.sessionStart) / 60);
}

async function processBatch<T>(
  items: T[],
  worker: (item: T) => Promise<Snapshot | null>,
  concurrency: number,
): Promise<Snapshot[]> {
  const out: Snapshot[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency);
    const batch = await Promise.all(slice.map(worker));
    for (const r of batch) {
      if (r) out.push(r);
    }
    if (i > 0 && i % 500 === 0) {
      console.log(`[unusual-volume] scan progress: ${i}/${items.length}`);
    }
  }
  return out;
}

async function main() {
  const startedAt = Date.now();

  // Load universe
  const universeRaw = await readFile(UNIVERSE_PATH, "utf8").catch(() => null);
  if (!universeRaw) {
    console.warn(
      `[unusual-volume] ${UNIVERSE_PATH} not found — run fetch:universe first. Writing empty signal set.`,
    );
    const empty = {
      generatedAt: new Date().toISOString(),
      marketStatus: "no-universe",
      criteria: {
        rvolThreshold: RVOL_THRESHOLD,
        priceChangeLimit: PRICE_CHANGE_LIMIT,
      },
      count: 0,
      signals: [] as unknown[],
    };
    await mkdir(dirname(OUT_PATH), { recursive: true });
    await writeFile(OUT_PATH, JSON.stringify(empty) + "\n", "utf8");
    return;
  }

  const universe = JSON.parse(universeRaw) as UniverseFile;
  console.log(
    `[unusual-volume] universe loaded: ${universe.count} tickers (generated ${universe.generatedAt})`,
  );

  // Build a quick lookup for avg volume
  const avgLookup = new Map<string, { name: string; avgVol: number; mcap: number }>();
  for (const u of universe.tickers) {
    avgLookup.set(u.t, { name: u.n, avgVol: u.v, mcap: u.m });
  }

  console.log(`[unusual-volume] fetching today's snapshot...`);
  const tickers = universe.tickers.map((u) => u.t);
  const snapshots = await processBatch(tickers, fetchSnapshot, CONCURRENCY);
  console.log(`[unusual-volume] got snapshots for ${snapshots.length} tickers`);

  // Determine market status from first usable snapshot
  let marketStatus: "open" | "closed" | "unknown" = "unknown";
  for (const s of snapshots) {
    if (isMarketOpen(s)) {
      marketStatus = "open";
      break;
    }
  }
  if (marketStatus === "unknown" && snapshots.length > 0) {
    marketStatus = "closed";
  }

  const signals: Array<{
    ticker: string;
    name: string;
    price: number;
    priceChangePct: number;
    todayVolume: number;
    avg5dVolume: number;
    rvol: number;
    elapsedMin: number;
    mcap: number;
  }> = [];

  for (const snap of snapshots) {
    const lookup = avgLookup.get(snap.ticker);
    if (!lookup) continue;
    if (!isMarketOpen(snap)) continue;
    const elapsed = elapsedSessionMinutes(snap);
    if (elapsed < MIN_ELAPSED_MINUTES) continue;
    if (lookup.avgVol <= 0) continue;
    // Project today's volume to a full session based on rate so far
    const projected = (snap.todayVolume * REGULAR_SESSION_MINUTES) / elapsed;
    const rvol = projected / lookup.avgVol;
    if (rvol < RVOL_THRESHOLD) continue;
    if (Math.abs(snap.priceChangePct) > PRICE_CHANGE_LIMIT * 100) continue;
    signals.push({
      ticker: snap.ticker,
      name: lookup.name || snap.name,
      price: Number(snap.price.toFixed(2)),
      priceChangePct: Number(snap.priceChangePct.toFixed(2)),
      todayVolume: snap.todayVolume,
      avg5dVolume: lookup.avgVol,
      rvol: Number(rvol.toFixed(2)),
      elapsedMin: Math.round(elapsed),
      mcap: lookup.mcap,
    });
  }

  // Sort by RVol descending, cap at top 100
  signals.sort((a, b) => b.rvol - a.rvol);
  const top = signals.slice(0, 100);

  const out = {
    generatedAt: new Date().toISOString(),
    elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
    marketStatus,
    universeGeneratedAt: universe.generatedAt,
    universeCount: universe.count,
    scannedCount: snapshots.length,
    criteria: {
      rvolThreshold: RVOL_THRESHOLD,
      priceChangeLimit: PRICE_CHANGE_LIMIT,
      avgVolumeWindow: "5d",
      minElapsedMin: MIN_ELAPSED_MINUTES,
    },
    count: top.length,
    signals: top,
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out) + "\n", "utf8");
  console.log(
    `[unusual-volume] wrote ${OUT_PATH} · ${top.length} signals · status=${marketStatus} · ${out.elapsedSeconds}s`,
  );
}

main().catch((err) => {
  console.error("[unusual-volume] failed:", err);
  process.exit(1);
});
