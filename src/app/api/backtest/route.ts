import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { unstable_cache } from "next/cache";

const HISTORY_PATH = resolve(process.cwd(), "src/data/signal-history.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Allow this route up to 60 seconds — fetching historical chart data
// for ~100 unique tickers takes ~10s with concurrency.
export const maxDuration = 60;

const HORIZON_TRADING_DAYS = {
  oneDay: 1,
  oneWeek: 5,
  oneMonth: 20,
} as const;

type Horizon = keyof typeof HORIZON_TRADING_DAYS;
const HORIZONS: Horizon[] = ["oneDay", "oneWeek", "oneMonth"];

type HistoryEntry = {
  date: string;
  ticker: string;
  name: string;
  rvol: number;
  priceAtDetection: number;
  priceChangePctAtDetection: number;
  mcap: number;
  capturedAt: string;
};

type HistoryFile = {
  lastUpdated: string;
  signals: HistoryEntry[];
};

type Returns = Partial<Record<Horizon, number | null>> & {
  current: number | null;
};

type StatRow = HistoryEntry & {
  currentPrice: number | null;
  returns: Returns;
  rvolBucket: RvolBucket;
  sessionBucket: SessionBucket;
};

type RvolBucket = "3-5x" | "5-10x" | "10x+";
type SessionBucket = "early" | "mid" | "late";

type AggStats = {
  n: number;
  avg: number;
  median: number;
  positivePct: number;
  best: number;
  worst: number;
};

type ChartResponse = {
  chart: {
    result?: Array<{
      meta: { regularMarketPrice?: number };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{ close?: (number | null)[] }>;
      };
    }>;
    error?: { code?: string; description?: string } | null;
  };
};

async function fetchHistorical(
  ticker: string,
): Promise<Array<{ date: string; close: number }>> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=3mo`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!r.ok) return [];
    const data = (await r.json()) as ChartResponse;
    if (data.chart.error || !data.chart.result?.length) return [];
    const result = data.chart.result[0];
    const ts = result.timestamp ?? [];
    const closes = result.indicators?.quote?.[0]?.close ?? [];
    const out: Array<{ date: string; close: number }> = [];
    for (let i = 0; i < ts.length; i++) {
      const c = closes[i];
      if (typeof c !== "number") continue;
      // Convert UNIX seconds to YYYY-MM-DD in ET (uses NY timezone)
      const d = new Date(ts[i] * 1000);
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      out.push({ date: fmt.format(d), close: c });
    }
    return out;
  } catch {
    return [];
  }
}

const ET_HOUR = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  hour12: false,
});

function sessionBucketFor(capturedAt: string): SessionBucket {
  try {
    const h = parseInt(ET_HOUR.format(new Date(capturedAt)), 10);
    if (h < 12) return "early"; // 9:30–12:00 ET
    if (h < 14) return "mid"; // 12:00–14:00 ET
    return "late"; // 14:00–16:00 ET
  } catch {
    return "mid";
  }
}

function rvolBucketFor(rvol: number): RvolBucket {
  if (rvol < 5) return "3-5x";
  if (rvol < 10) return "5-10x";
  return "10x+";
}

function aggregate(returns: number[]): AggStats | null {
  if (returns.length === 0) return null;
  const sorted = [...returns].sort((a, b) => a - b);
  const sum = returns.reduce((s, v) => s + v, 0);
  const median =
    sorted.length % 2
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  return {
    n: returns.length,
    avg: sum / returns.length,
    median,
    positivePct: (returns.filter((r) => r > 0).length / returns.length) * 100,
    best: sorted[sorted.length - 1],
    worst: sorted[0],
  };
}

function pickReturn(rows: StatRow[], horizon: Horizon | "current"): number[] {
  const out: number[] = [];
  for (const r of rows) {
    const v = horizon === "current" ? r.returns.current : r.returns[horizon];
    if (typeof v === "number" && !Number.isNaN(v)) out.push(v);
  }
  return out;
}

const getCachedBacktest = unstable_cache(
  async () => {
    let history: HistoryFile = { lastUpdated: "", signals: [] };
    try {
      const raw = await readFile(HISTORY_PATH, "utf-8");
      history = JSON.parse(raw) as HistoryFile;
    } catch {
      return null;
    }

    if (history.signals.length === 0) {
      return {
        lastUpdated: history.lastUpdated,
        totalSignals: 0,
        uniqueDays: 0,
        rows: [] as StatRow[],
        overall: emptyHorizonStats(),
        rvolBuckets: emptyBucketStats<RvolBucket>(["3-5x", "5-10x", "10x+"]),
        sessionBuckets: emptyBucketStats<SessionBucket>([
          "early",
          "mid",
          "late",
        ]),
      };
    }

    // Cap to most recent 200 signals to bound API load
    const recent = [...history.signals]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 200);

    // Fetch 3-month historical for each unique ticker (concurrency 8)
    const uniqueTickers = [...new Set(recent.map((s) => s.ticker))];
    const historicalByTicker = new Map<
      string,
      Array<{ date: string; close: number }>
    >();
    const concurrency = 8;
    for (let i = 0; i < uniqueTickers.length; i += concurrency) {
      const slice = uniqueTickers.slice(i, i + concurrency);
      const results = await Promise.all(slice.map(fetchHistorical));
      slice.forEach((t, idx) => historicalByTicker.set(t, results[idx]));
    }

    const rows: StatRow[] = recent.map((s) => {
      const hist = historicalByTicker.get(s.ticker) ?? [];
      const currentPrice = hist.length > 0 ? hist[hist.length - 1].close : null;
      const signalIdx = hist.findIndex((c) => c.date >= s.date);
      const baseClose =
        signalIdx >= 0 ? hist[signalIdx]?.close ?? null : null;
      // Use the close on signal day as the comparison anchor when available;
      // fall back to priceAtDetection if the historical record is missing.
      const anchor = baseClose ?? s.priceAtDetection;

      const returns: Returns = { current: null };
      if (currentPrice !== null && anchor > 0) {
        returns.current =
          ((currentPrice - s.priceAtDetection) / s.priceAtDetection) * 100;
      }
      if (signalIdx >= 0 && anchor > 0) {
        for (const horizon of HORIZONS) {
          const offset = HORIZON_TRADING_DAYS[horizon];
          const target = hist[signalIdx + offset];
          returns[horizon] = target
            ? ((target.close - anchor) / anchor) * 100
            : null;
        }
      }

      return {
        ...s,
        currentPrice,
        returns,
        rvolBucket: rvolBucketFor(s.rvol),
        sessionBucket: sessionBucketFor(s.capturedAt),
      };
    });

    // Sort: most recent first, then by RVol desc within day
    rows.sort((a, b) =>
      a.date === b.date ? b.rvol - a.rvol : a.date < b.date ? 1 : -1,
    );

    const overall = computeHorizonStats(rows);
    const rvolBuckets: Record<RvolBucket, ReturnType<typeof computeHorizonStats>> =
      {
        "3-5x": computeHorizonStats(rows.filter((r) => r.rvolBucket === "3-5x")),
        "5-10x": computeHorizonStats(
          rows.filter((r) => r.rvolBucket === "5-10x"),
        ),
        "10x+": computeHorizonStats(rows.filter((r) => r.rvolBucket === "10x+")),
      };
    const sessionBuckets: Record<
      SessionBucket,
      ReturnType<typeof computeHorizonStats>
    > = {
      early: computeHorizonStats(rows.filter((r) => r.sessionBucket === "early")),
      mid: computeHorizonStats(rows.filter((r) => r.sessionBucket === "mid")),
      late: computeHorizonStats(rows.filter((r) => r.sessionBucket === "late")),
    };

    const uniqueDays = new Set(history.signals.map((s) => s.date)).size;

    return {
      lastUpdated: history.lastUpdated,
      totalSignals: history.signals.length,
      uniqueDays,
      rows,
      overall,
      rvolBuckets,
      sessionBuckets,
    };
  },
  ["backtest-data-v2"],
  { revalidate: 600 },
);

function computeHorizonStats(rows: StatRow[]) {
  return {
    n: rows.length,
    oneDay: aggregate(pickReturn(rows, "oneDay")),
    oneWeek: aggregate(pickReturn(rows, "oneWeek")),
    oneMonth: aggregate(pickReturn(rows, "oneMonth")),
    current: aggregate(pickReturn(rows, "current")),
  };
}

function emptyHorizonStats() {
  return {
    n: 0,
    oneDay: null,
    oneWeek: null,
    oneMonth: null,
    current: null,
  };
}

function emptyBucketStats<K extends string>(keys: K[]) {
  return Object.fromEntries(
    keys.map((k) => [k, emptyHorizonStats()]),
  ) as Record<K, ReturnType<typeof emptyHorizonStats>>;
}

export async function GET() {
  const data = await getCachedBacktest();
  if (!data) {
    return Response.json({ error: "history unavailable" }, { status: 503 });
  }
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
