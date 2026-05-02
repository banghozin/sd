import { unstable_cache } from "next/cache";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

type ChartResponse = {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        currency?: string;
        exchangeName?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
    error?: { code?: string; description?: string } | null;
  };
};

type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Result = {
  ticker: string;
  candles: Candle[];
  meta: {
    previousClose: number | null;
    currency: string | null;
    exchangeName: string | null;
  };
};

async function fetchChart(
  ticker: string,
  interval: string,
  range: string,
): Promise<Result | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!r.ok) return null;
    const data = (await r.json()) as ChartResponse;
    if (data.chart.error || !data.chart.result?.length) return null;
    const result = data.chart.result[0];
    const ts = result.timestamp ?? [];
    const q = result.indicators?.quote?.[0];
    if (!q) return null;
    const candles: Candle[] = [];
    for (let i = 0; i < ts.length; i++) {
      const open = q.open?.[i];
      const high = q.high?.[i];
      const low = q.low?.[i];
      const close = q.close?.[i];
      const volume = q.volume?.[i] ?? 0;
      if (
        typeof open !== "number" ||
        typeof high !== "number" ||
        typeof low !== "number" ||
        typeof close !== "number"
      )
        continue;
      candles.push({
        time: ts[i],
        open,
        high,
        low,
        close,
        volume: typeof volume === "number" ? volume : 0,
      });
    }
    return {
      ticker,
      candles,
      meta: {
        previousClose:
          result.meta.chartPreviousClose ?? result.meta.previousClose ?? null,
        currency: result.meta.currency ?? null,
        exchangeName: result.meta.exchangeName ?? null,
      },
    };
  } catch {
    return null;
  }
}

const getCachedChart = unstable_cache(
  async (ticker: string, interval: string, range: string) =>
    fetchChart(ticker, interval, range),
  ["chart-data"],
  { revalidate: 90 },
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ticker = (url.searchParams.get("ticker") ?? "").trim().toUpperCase();
  const interval = url.searchParams.get("interval") ?? "5m";
  const range = url.searchParams.get("range") ?? "1d";
  if (!ticker) {
    return Response.json({ error: "ticker required" }, { status: 400 });
  }
  // Whitelist of safe values to avoid arbitrary param injection
  const okIntervals = new Set(["5m", "15m", "30m", "1h", "1d"]);
  const okRanges = new Set(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y"]);
  if (!okIntervals.has(interval) || !okRanges.has(range)) {
    return Response.json({ error: "invalid interval/range" }, { status: 400 });
  }
  const data = await getCachedChart(ticker, interval, range);
  if (!data) {
    return Response.json({ error: "fetch failed" }, { status: 502 });
  }
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=90, stale-while-revalidate=300",
    },
  });
}
