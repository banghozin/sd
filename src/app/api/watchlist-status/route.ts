import { unstable_cache } from "next/cache";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

type Quote = {
  ticker: string;
  price: number | null;
  changePct: number | null;
  source: "yahoo" | "missing";
};

type ChartResponse = {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
      };
    }>;
    error?: { code?: string; description?: string } | null;
  };
};

async function fetchOne(ticker: string): Promise<Quote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!r.ok) return { ticker, price: null, changePct: null, source: "missing" };
    const data = (await r.json()) as ChartResponse;
    if (data.chart.error || !data.chart.result?.length) {
      return { ticker, price: null, changePct: null, source: "missing" };
    }
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice ?? null;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? null;
    const changePct =
      price !== null && prev !== null && prev !== 0
        ? ((price - prev) / prev) * 100
        : null;
    return { ticker, price, changePct, source: "yahoo" };
  } catch {
    return { ticker, price: null, changePct: null, source: "missing" };
  }
}

const getCachedQuotes = unstable_cache(
  async (tickers: string[]) => {
    const results = await Promise.all(tickers.map(fetchOne));
    const map: Record<string, Quote> = {};
    for (const q of results) map[q.ticker] = q;
    return map;
  },
  ["watchlist-quotes"],
  { revalidate: 60 },
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("tickers") ?? "";
  const tickers = raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 50);
  if (tickers.length === 0) return Response.json({ quotes: {} });
  const quotes = await getCachedQuotes(tickers);
  return Response.json(
    { quotes, fetchedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
