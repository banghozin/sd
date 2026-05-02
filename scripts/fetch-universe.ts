// Universe builder for unusual volume scanner.
// Fetches all US-listed tickers from NASDAQ Trader, then filters by
// market cap range and minimum average volume via Yahoo Finance.
// Runs once per day (after US market close) to refresh the universe.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT_PATH = resolve("src/data/universe.json");

// Filter criteria
const MIN_MARKET_CAP = 5_000_000; // $5M
const MAX_MARKET_CAP = 1_300_000_000; // $1.3B
const MIN_AVG_VOLUME = 50_000; // 50k shares/day (filters out pump-and-dump candidates)

// Concurrency tuning
const CONCURRENCY = 12;
const RETRY = 1;

type ChartResponse = {
  chart: {
    result?: Array<{
      meta: {
        symbol?: string;
        shortName?: string;
        longName?: string;
        marketCap?: number;
        regularMarketPrice?: number;
      };
      indicators?: {
        quote?: Array<{ volume?: (number | null)[] }>;
      };
      timestamp?: number[];
    }>;
    error?: { code?: string; description?: string } | null;
  };
};

async function fetchText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; StockDashboard/1.0; +https://github.com/banghozin/sd)",
      },
    });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

async function fetchTickerList(): Promise<string[]> {
  const tickers = new Set<string>();

  const nasdaq = await fetchText(
    "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt",
  );
  if (nasdaq) {
    const lines = nasdaq.split("\n");
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("|");
      if (cols.length < 8) continue;
      const [symbol, , , testIssue, , , etf] = cols;
      if (!symbol || symbol === "Symbol") continue;
      if (testIssue === "Y" || etf === "Y") continue;
      if (symbol.includes("$") || symbol.includes(".")) continue;
      if (symbol.length > 5) continue; // skip warrants/units typically suffixed
      tickers.add(symbol.trim());
    }
  }

  const other = await fetchText(
    "https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt",
  );
  if (other) {
    const lines = other.split("\n");
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("|");
      if (cols.length < 8) continue;
      const [symbol, , exchange, , etf, , testIssue] = cols;
      if (!symbol || symbol === "ACT Symbol") continue;
      if (testIssue === "Y" || etf === "Y") continue;
      if (!["N", "A"].includes(exchange)) continue; // NYSE, AMEX
      if (symbol.includes("$") || symbol.includes(".")) continue;
      if (symbol.length > 5) continue;
      tickers.add(symbol.trim());
    }
  }

  return [...tickers].sort();
}

async function fetchTickerData(
  ticker: string,
  attempt = 0,
): Promise<{
  ticker: string;
  name: string;
  marketCap: number;
  avg5dVolume: number;
} | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=10d`;
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StockDashboard/1.0)",
        Accept: "application/json",
      },
    });
    if (r.status === 429 && attempt < RETRY) {
      await sleep(1500);
      return fetchTickerData(ticker, attempt + 1);
    }
    if (!r.ok) return null;
    const data = (await r.json()) as ChartResponse;
    if (data.chart.error || !data.chart.result?.length) return null;
    const result = data.chart.result[0];
    const mcap = result.meta.marketCap ?? 0;
    if (!mcap) return null;
    const volumes = (result.indicators?.quote?.[0]?.volume ?? []).filter(
      (v): v is number => typeof v === "number" && v > 0,
    );
    if (volumes.length < 3) return null;
    // Use most recent 5 trading days
    const last5 = volumes.slice(-5);
    const avg5dVolume =
      last5.reduce((sum, v) => sum + v, 0) / last5.length;
    const name =
      result.meta.shortName ?? result.meta.longName ?? ticker;
    return {
      ticker,
      name,
      marketCap: mcap,
      avg5dVolume,
    };
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function processBatch(
  tickers: string[],
  concurrency: number,
): Promise<NonNullable<Awaited<ReturnType<typeof fetchTickerData>>>[]> {
  const results: NonNullable<Awaited<ReturnType<typeof fetchTickerData>>>[] = [];
  for (let i = 0; i < tickers.length; i += concurrency) {
    const slice = tickers.slice(i, i + concurrency);
    const batch = await Promise.all(slice.map((t) => fetchTickerData(t)));
    for (const r of batch) {
      if (r) results.push(r);
    }
    if (i > 0 && i % 500 === 0) {
      console.log(
        `[universe] progress: ${i}/${tickers.length} (kept ${results.length})`,
      );
    }
  }
  return results;
}

async function main() {
  const startedAt = Date.now();

  console.log("[universe] fetching ticker list from NASDAQ Trader...");
  const tickers = await fetchTickerList();
  console.log(`[universe] got ${tickers.length} candidate tickers`);

  if (tickers.length === 0) {
    console.error("[universe] empty ticker list — aborting");
    process.exit(1);
  }

  console.log(
    `[universe] fetching data for all tickers (concurrency=${CONCURRENCY})...`,
  );
  const data = await processBatch(tickers, CONCURRENCY);
  console.log(`[universe] received data for ${data.length} tickers`);

  const filtered = data.filter(
    (d) =>
      d.marketCap >= MIN_MARKET_CAP &&
      d.marketCap <= MAX_MARKET_CAP &&
      d.avg5dVolume >= MIN_AVG_VOLUME,
  );

  console.log(
    `[universe] filtered to ${filtered.length} tickers ($${MIN_MARKET_CAP / 1_000_000}M ≤ mcap ≤ $${MAX_MARKET_CAP / 1_000_000}M, avg vol ≥ ${MIN_AVG_VOLUME})`,
  );

  const out = {
    generatedAt: new Date().toISOString(),
    elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
    criteria: {
      marketCapMin: MIN_MARKET_CAP,
      marketCapMax: MAX_MARKET_CAP,
      minAvg5dVolume: MIN_AVG_VOLUME,
    },
    count: filtered.length,
    tickers: filtered.map((d) => ({
      t: d.ticker,
      n: d.name,
      m: d.marketCap,
      v: Math.round(d.avg5dVolume),
    })),
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out) + "\n", "utf8");
  console.log(
    `[universe] wrote ${OUT_PATH} · ${filtered.length} tickers · ${out.elapsedSeconds}s`,
  );
}

main().catch((err) => {
  console.error("[universe] failed:", err);
  process.exit(1);
});
