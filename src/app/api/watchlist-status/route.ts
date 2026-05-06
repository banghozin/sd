import { unstable_cache } from "next/cache";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

type Quote = {
  ticker: string;
  price: number | null;
  changePct: number | null;
  source: "yahoo" | "missing";
};

type V7QuoteResult = {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
};

type V7QuoteResponse = {
  quoteResponse?: {
    result?: V7QuoteResult[];
    error?: { code?: string; description?: string } | null;
  };
};

async function getCrumb(): Promise<{ cookie: string; crumb: string } | null> {
  try {
    const consentRes = await fetch("https://fc.yahoo.com/", {
      headers: { "User-Agent": UA },
      redirect: "manual",
    });
    const setCookieHeader = consentRes.headers.get("set-cookie") ?? "";
    const cookies = setCookieHeader
      .split(/,(?=\s*[A-Za-z0-9_-]+=)/)
      .map((c) => c.split(";")[0].trim())
      .filter(Boolean)
      .join("; ");
    if (!cookies) return null;
    const crumbRes = await fetch(
      "https://query1.finance.yahoo.com/v1/test/getcrumb",
      {
        headers: { "User-Agent": UA, Cookie: cookies, Accept: "text/plain" },
      },
    );
    if (!crumbRes.ok) return null;
    const crumb = (await crumbRes.text()).trim();
    if (!crumb || crumb.length > 64) return null;
    return { cookie: cookies, crumb };
  } catch {
    return null;
  }
}

async function fetchBatch(tickers: string[]): Promise<Record<string, Quote>> {
  // Pre-seed every ticker as missing so the response shape is stable
  // even if Yahoo refuses or partially answers.
  const map: Record<string, Quote> = {};
  for (const t of tickers) {
    map[t] = { ticker: t, price: null, changePct: null, source: "missing" };
  }

  const auth = await getCrumb();
  if (!auth) return map;

  const url =
    `https://query1.finance.yahoo.com/v7/finance/quote` +
    `?symbols=${encodeURIComponent(tickers.join(","))}` +
    `&crumb=${encodeURIComponent(auth.crumb)}`;
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Cookie: auth.cookie,
        Accept: "application/json",
      },
    });
    if (!r.ok) return map;
    const data = (await r.json()) as V7QuoteResponse;
    if (data.quoteResponse?.error) return map;
    for (const q of data.quoteResponse?.result ?? []) {
      const price = q.regularMarketPrice ?? null;
      const changePct = q.regularMarketChangePercent ?? null;
      map[q.symbol] = {
        ticker: q.symbol,
        price,
        changePct,
        source: "yahoo",
      };
    }
    return map;
  } catch {
    return map;
  }
}

const getCachedQuotes = unstable_cache(
  async (tickers: string[]) => fetchBatch(tickers),
  ["watchlist-quotes-v2"],
  { revalidate: 60 },
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("tickers") ?? "";
  // Sort and dedupe so different request orders share a cache entry.
  const tickers = Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean),
    ),
  )
    .sort()
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
