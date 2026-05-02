// Unusual volume scanner.
// Reads universe.json, batch-fetches today's running volume and price
// change for each ticker via Yahoo's v7 quote endpoint, and flags
// stealth-accumulation signals (rate-projected daily volume ≥ 3x of
// 5-day avg AND |price change| < 2%).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const UNIVERSE_PATH = resolve("src/data/universe.json");
const OUT_PATH = resolve("src/data/unusual-volume.json");

// Signal criteria
const RVOL_THRESHOLD = 3;
const PRICE_CHANGE_LIMIT = 0.02; // ±2%
const MIN_ELAPSED_MINUTES = 30;
const REGULAR_SESSION_MINUTES = 390;

// Batching
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 600;
const RETRY = 2;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

type UniverseFile = {
  generatedAt: string;
  count: number;
  tickers: Array<{ t: string; n: string; m: number; v: number }>;
};

type QuoteResult = {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  regularMarketTime?: number;
  marketState?: string; // "REGULAR" | "CLOSED" | "PRE" | "POST"
};

type QuoteResponse = {
  quoteResponse?: {
    result?: QuoteResult[];
    error?: { code?: string; description?: string } | null;
  };
};

type ChartMeta = {
  regularMarketTime?: number;
  currentTradingPeriod?: {
    regular?: { start?: number; end?: number };
  };
};

type ChartResponse = {
  chart: {
    result?: Array<{ meta: ChartMeta }>;
    error?: { code?: string; description?: string } | null;
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function getCrumb(): Promise<{ cookie: string; crumb: string }> {
  console.log("[unusual-volume] obtaining Yahoo crumb...");
  const consentRes = await fetch("https://fc.yahoo.com/", {
    headers: { "User-Agent": UA },
    redirect: "manual",
  });
  const setCookieHeader =
    consentRes.headers.get("set-cookie") ??
    (consentRes.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.()?.join(", ") ??
    "";
  const cookies = setCookieHeader
    .split(/,(?=\s*[A-Za-z0-9_-]+=)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
  if (!cookies) throw new Error("could not obtain Yahoo session cookie");

  const crumbRes = await fetch(
    "https://query1.finance.yahoo.com/v1/test/getcrumb",
    {
      headers: { "User-Agent": UA, Cookie: cookies, Accept: "text/plain" },
    },
  );
  if (!crumbRes.ok) throw new Error(`crumb fetch HTTP ${crumbRes.status}`);
  const crumb = (await crumbRes.text()).trim();
  if (!crumb || crumb.length > 64) {
    throw new Error(`invalid crumb response: ${crumb.slice(0, 80)}`);
  }
  console.log(`[unusual-volume] got crumb (length=${crumb.length})`);
  return { cookie: cookies, crumb };
}

// Single chart call to discover current session boundaries (a stable, popular
// ticker is used as the reference clock).
async function getSessionBounds(): Promise<{
  start: number;
  end: number;
  marketTime: number;
} | null> {
  const url =
    "https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=2d";
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!r.ok) return null;
    const data = (await r.json()) as ChartResponse;
    if (data.chart.error || !data.chart.result?.length) return null;
    const meta = data.chart.result[0].meta;
    const start = meta.currentTradingPeriod?.regular?.start;
    const end = meta.currentTradingPeriod?.regular?.end;
    const marketTime = meta.regularMarketTime;
    if (!start || !end || !marketTime) return null;
    return { start, end, marketTime };
  } catch {
    return null;
  }
}

async function fetchQuoteBatch(
  symbols: string[],
  auth: { cookie: string; crumb: string },
  attempt = 0,
): Promise<QuoteResult[] | null> {
  const url =
    `https://query1.finance.yahoo.com/v7/finance/quote` +
    `?symbols=${encodeURIComponent(symbols.join(","))}` +
    `&crumb=${encodeURIComponent(auth.crumb)}`;
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Cookie: auth.cookie,
        Accept: "application/json",
      },
    });
    if ((r.status === 429 || r.status === 503) && attempt < RETRY) {
      await sleep(1500 * (attempt + 1));
      return fetchQuoteBatch(symbols, auth, attempt + 1);
    }
    if (!r.ok) {
      console.warn(`[unusual-volume] batch HTTP ${r.status}`);
      return null;
    }
    const data = (await r.json()) as QuoteResponse;
    if (data.quoteResponse?.error) {
      console.warn(
        `[unusual-volume] batch error: ${data.quoteResponse.error.description}`,
      );
      return null;
    }
    return data.quoteResponse?.result ?? [];
  } catch (e) {
    console.warn(`[unusual-volume] batch fetch error:`, e);
    return null;
  }
}

async function main() {
  const startedAt = Date.now();

  const universeRaw = await readFile(UNIVERSE_PATH, "utf8").catch(() => null);
  if (!universeRaw) {
    console.warn(
      `[unusual-volume] ${UNIVERSE_PATH} not found — run fetch:universe first.`,
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
    `[unusual-volume] universe: ${universe.count} tickers (built ${universe.generatedAt})`,
  );

  if (universe.count === 0) {
    console.warn("[unusual-volume] universe is empty — nothing to scan");
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

  const lookup = new Map<string, { name: string; mcap: number; avgVol: number }>();
  for (const u of universe.tickers) {
    lookup.set(u.t, { name: u.n, mcap: u.m, avgVol: u.v });
  }

  // Determine session timing once via SPY
  const session = await getSessionBounds();
  if (!session) {
    console.error("[unusual-volume] could not determine session bounds — aborting");
    process.exit(1);
  }
  const isOpen =
    session.marketTime >= session.start && session.marketTime <= session.end;
  const elapsedMin = isOpen
    ? Math.max(0, (session.marketTime - session.start) / 60)
    : 0;
  console.log(
    `[unusual-volume] market ${isOpen ? "OPEN" : "CLOSED"} · elapsed ${Math.round(elapsedMin)}m / ${REGULAR_SESSION_MINUTES}m`,
  );

  // If market is closed or too early, write empty result and exit cleanly
  if (!isOpen) {
    const out = {
      generatedAt: new Date().toISOString(),
      elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
      marketStatus: "closed",
      universeGeneratedAt: universe.generatedAt,
      universeCount: universe.count,
      scannedCount: 0,
      criteria: {
        rvolThreshold: RVOL_THRESHOLD,
        priceChangeLimit: PRICE_CHANGE_LIMIT,
        avgVolumeWindow: "5d",
        minElapsedMin: MIN_ELAPSED_MINUTES,
      },
      count: 0,
      signals: [],
    };
    await mkdir(dirname(OUT_PATH), { recursive: true });
    await writeFile(OUT_PATH, JSON.stringify(out) + "\n", "utf8");
    console.log("[unusual-volume] market closed — wrote empty signal set");
    return;
  }
  if (elapsedMin < MIN_ELAPSED_MINUTES) {
    const out = {
      generatedAt: new Date().toISOString(),
      elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
      marketStatus: "open",
      universeGeneratedAt: universe.generatedAt,
      universeCount: universe.count,
      scannedCount: 0,
      criteria: {
        rvolThreshold: RVOL_THRESHOLD,
        priceChangeLimit: PRICE_CHANGE_LIMIT,
        avgVolumeWindow: "5d",
        minElapsedMin: MIN_ELAPSED_MINUTES,
      },
      count: 0,
      signals: [],
    };
    await mkdir(dirname(OUT_PATH), { recursive: true });
    await writeFile(OUT_PATH, JSON.stringify(out) + "\n", "utf8");
    console.log(
      `[unusual-volume] only ${Math.round(elapsedMin)}m elapsed since open — too early to scan`,
    );
    return;
  }

  const auth = await getCrumb();
  const tickers = universe.tickers.map((u) => u.t);

  console.log(
    `[unusual-volume] scanning ${tickers.length} tickers in batches of ${BATCH_SIZE}...`,
  );
  const quotes: QuoteResult[] = [];
  let consecutiveEmpty = 0;
  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const slice = tickers.slice(i, i + BATCH_SIZE);
    const batch = await fetchQuoteBatch(slice, auth);
    if (!batch || batch.length === 0) {
      consecutiveEmpty++;
      if (consecutiveEmpty >= 5) {
        console.error(
          "[unusual-volume] aborting: 5 consecutive empty batches — likely auth/rate-limit",
        );
        process.exit(1);
      }
    } else {
      consecutiveEmpty = 0;
      quotes.push(...batch);
    }
    await sleep(BATCH_DELAY_MS);
  }
  console.log(`[unusual-volume] received quotes for ${quotes.length} tickers`);

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

  for (const q of quotes) {
    const lk = lookup.get(q.symbol);
    if (!lk) continue;
    const price = q.regularMarketPrice ?? 0;
    const todayVol = q.regularMarketVolume ?? 0;
    const changePct = q.regularMarketChangePercent ?? 0;
    if (!price || !todayVol || !lk.avgVol) continue;
    if (Math.abs(changePct) > PRICE_CHANGE_LIMIT * 100) continue;
    const projected = (todayVol * REGULAR_SESSION_MINUTES) / elapsedMin;
    const rvol = projected / lk.avgVol;
    if (rvol < RVOL_THRESHOLD) continue;
    signals.push({
      ticker: q.symbol,
      name: lk.name,
      price: Number(price.toFixed(2)),
      priceChangePct: Number(changePct.toFixed(2)),
      todayVolume: todayVol,
      avg5dVolume: lk.avgVol,
      rvol: Number(rvol.toFixed(2)),
      elapsedMin: Math.round(elapsedMin),
      mcap: lk.mcap,
    });
  }

  signals.sort((a, b) => b.rvol - a.rvol);
  const top = signals.slice(0, 100);

  const out = {
    generatedAt: new Date().toISOString(),
    elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
    marketStatus: "open",
    universeGeneratedAt: universe.generatedAt,
    universeCount: universe.count,
    scannedCount: quotes.length,
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
    `[unusual-volume] wrote ${OUT_PATH} · ${top.length} signals · ${out.elapsedSeconds}s`,
  );
}

main().catch((err) => {
  console.error("[unusual-volume] failed:", err);
  process.exit(1);
});
