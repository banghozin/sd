import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { unstable_cache } from "next/cache";

const HISTORY_PATH = resolve(process.cwd(), "src/data/signal-history.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

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

type StatRow = HistoryEntry & {
  currentPrice: number | null;
  forwardReturnPct: number | null;
};

type ChartResponse = {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
      };
    }>;
    error?: { code?: string; description?: string } | null;
  };
};

async function fetchPrice(ticker: string): Promise<number | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!r.ok) return null;
    const data = (await r.json()) as ChartResponse;
    if (data.chart.error || !data.chart.result?.length) return null;
    return data.chart.result[0].meta.regularMarketPrice ?? null;
  } catch {
    return null;
  }
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
        stats: null,
      };
    }

    // Unique tickers (latest entry per ticker for forward-return computation)
    const latestByTicker = new Map<string, HistoryEntry>();
    for (const s of history.signals) {
      const existing = latestByTicker.get(s.ticker);
      if (!existing || s.date > existing.date) latestByTicker.set(s.ticker, s);
    }
    const tickers = [...latestByTicker.keys()].slice(0, 100); // cap to limit Yahoo load

    // Fetch current prices in parallel batches
    const priceMap = new Map<string, number | null>();
    const batchSize = 8;
    for (let i = 0; i < tickers.length; i += batchSize) {
      const slice = tickers.slice(i, i + batchSize);
      const results = await Promise.all(slice.map(fetchPrice));
      slice.forEach((t, idx) => priceMap.set(t, results[idx]));
    }

    const rows: StatRow[] = history.signals.map((s) => {
      const cur = priceMap.get(s.ticker) ?? null;
      const ret =
        cur != null && s.priceAtDetection > 0
          ? ((cur - s.priceAtDetection) / s.priceAtDetection) * 100
          : null;
      return { ...s, currentPrice: cur, forwardReturnPct: ret };
    });

    // Sort: most recent first
    rows.sort((a, b) =>
      a.date === b.date
        ? b.rvol - a.rvol
        : a.date < b.date
          ? 1
          : -1,
    );

    const withReturn = rows.filter(
      (r): r is StatRow & { forwardReturnPct: number } =>
        r.forwardReturnPct !== null,
    );
    const stats =
      withReturn.length === 0
        ? null
        : {
            n: withReturn.length,
            avg:
              withReturn.reduce((s, r) => s + r.forwardReturnPct, 0) /
              withReturn.length,
            median: (() => {
              const sorted = [...withReturn].sort(
                (a, b) => a.forwardReturnPct - b.forwardReturnPct,
              );
              const m = Math.floor(sorted.length / 2);
              return sorted.length % 2
                ? sorted[m].forwardReturnPct
                : (sorted[m - 1].forwardReturnPct +
                    sorted[m].forwardReturnPct) /
                    2;
            })(),
            positivePct:
              (withReturn.filter((r) => r.forwardReturnPct > 0).length /
                withReturn.length) *
              100,
            best: Math.max(...withReturn.map((r) => r.forwardReturnPct)),
            worst: Math.min(...withReturn.map((r) => r.forwardReturnPct)),
          };

    const uniqueDays = new Set(history.signals.map((s) => s.date)).size;

    return {
      lastUpdated: history.lastUpdated,
      totalSignals: history.signals.length,
      uniqueDays,
      rows,
      stats,
    };
  },
  ["backtest-data"],
  { revalidate: 600 }, // 10 min
);

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
