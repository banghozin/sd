// Universe builder for unusual volume scanner.
// Uses Yahoo Finance's v7 quote endpoint (with cookie+crumb auth) to
// batch-fetch market cap and avg volume for ~7000 US-listed tickers,
// then filters by mcap range and minimum volume.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT_PATH = resolve("src/data/universe.json");

// Filter criteria
const MIN_MARKET_CAP = 5_000_000;
const MAX_MARKET_CAP = 1_300_000_000;
const MIN_AVG_VOLUME = 50_000;

// Batch tuning — v7 quote can take ~250 symbols per request
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 600;
const RETRY = 2;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

type QuoteResult = {
  symbol: string;
  shortName?: string;
  longName?: string;
  marketCap?: number;
  averageDailyVolume10Day?: number;
  averageDailyVolume3Month?: number;
};

type QuoteResponse = {
  quoteResponse?: {
    result?: QuoteResult[];
    error?: { code?: string; description?: string } | null;
  };
};

async function fetchText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) {
      console.warn(`[universe] HTTP ${r.status} fetching ${url}`);
      return null;
    }
    return await r.text();
  } catch (e) {
    console.warn(`[universe] error fetching ${url}:`, e);
    return null;
  }
}

async function fetchTickerList(): Promise<string[]> {
  const tickers = new Set<string>();

  console.log("[universe] downloading nasdaqlisted.txt...");
  const nasdaq = await fetchText(
    "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt",
  );
  if (nasdaq) {
    const lines = nasdaq.split("\n");
    let kept = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("|");
      if (cols.length < 8) continue;
      const [symbol, , , testIssue, , , etf] = cols;
      if (!symbol || symbol === "Symbol") continue;
      if (testIssue === "Y" || etf === "Y") continue;
      if (symbol.includes("$") || symbol.includes(".")) continue;
      if (symbol.length > 5) continue;
      tickers.add(symbol.trim());
      kept++;
    }
    console.log(`[universe]   parsed ${kept} from nasdaqlisted`);
  }

  console.log("[universe] downloading otherlisted.txt...");
  const other = await fetchText(
    "https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt",
  );
  if (other) {
    const lines = other.split("\n");
    let kept = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("|");
      if (cols.length < 8) continue;
      const [symbol, , exchange, , etf, , testIssue] = cols;
      if (!symbol || symbol === "ACT Symbol") continue;
      if (testIssue === "Y" || etf === "Y") continue;
      if (!["N", "A"].includes(exchange)) continue;
      if (symbol.includes("$") || symbol.includes(".")) continue;
      if (symbol.length > 5) continue;
      tickers.add(symbol.trim());
      kept++;
    }
    console.log(`[universe]   parsed ${kept} from otherlisted`);
  }

  return [...tickers].sort();
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// Yahoo's v7 quote endpoint requires a cookie + crumb token since 2023.
// We grab one at startup and reuse for all batch quote requests.
async function getCrumb(): Promise<{ cookie: string; crumb: string }> {
  console.log("[universe] obtaining Yahoo crumb...");
  // Step 1: grab a cookie from Yahoo's consent endpoint
  const consentRes = await fetch("https://fc.yahoo.com/", {
    headers: { "User-Agent": UA },
    redirect: "manual",
  });
  const setCookieHeader =
    consentRes.headers.get("set-cookie") ??
    (consentRes.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.()?.join(", ") ??
    "";
  // Extract just the cookie name=value portions (drop domain, path, expiry, etc.)
  const cookies = setCookieHeader
    .split(/,(?=\s*[A-Za-z0-9_-]+=)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");

  if (!cookies) {
    throw new Error("could not obtain Yahoo session cookie");
  }

  // Step 2: exchange cookie for a crumb
  const crumbRes = await fetch(
    "https://query1.finance.yahoo.com/v1/test/getcrumb",
    {
      headers: { "User-Agent": UA, Cookie: cookies, Accept: "text/plain" },
    },
  );
  if (!crumbRes.ok) {
    throw new Error(`crumb fetch HTTP ${crumbRes.status}`);
  }
  const crumb = (await crumbRes.text()).trim();
  if (!crumb || crumb.length > 64) {
    throw new Error(`invalid crumb response: ${crumb.slice(0, 80)}`);
  }
  console.log(`[universe] got crumb (length=${crumb.length})`);
  return { cookie: cookies, crumb };
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
      console.warn(`[universe] batch HTTP ${r.status} (attempt ${attempt})`);
      return null;
    }
    const data = (await r.json()) as QuoteResponse;
    if (data.quoteResponse?.error) {
      console.warn(
        `[universe] batch error: ${data.quoteResponse.error.description}`,
      );
      return null;
    }
    return data.quoteResponse?.result ?? [];
  } catch (e) {
    console.warn(`[universe] batch fetch error:`, e);
    return null;
  }
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

  const auth = await getCrumb();

  console.log(
    `[universe] fetching quote data in batches of ${BATCH_SIZE} (delay ${BATCH_DELAY_MS}ms)...`,
  );
  const results: QuoteResult[] = [];
  let consecutiveEmpty = 0;
  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const slice = tickers.slice(i, i + BATCH_SIZE);
    const batchResult = await fetchQuoteBatch(slice, auth);
    if (!batchResult || batchResult.length === 0) {
      consecutiveEmpty++;
      if (consecutiveEmpty >= 5) {
        console.error(
          `[universe] aborting: 5 consecutive empty batches — likely auth/rate-limit failure`,
        );
        process.exit(1);
      }
    } else {
      consecutiveEmpty = 0;
      results.push(...batchResult);
    }
    if (i % 1000 === 0 && i > 0) {
      console.log(
        `[universe] progress: ${i}/${tickers.length} (received ${results.length})`,
      );
    }
    await sleep(BATCH_DELAY_MS);
  }
  console.log(
    `[universe] received quote data for ${results.length}/${tickers.length} tickers`,
  );

  if (results.length === 0) {
    console.error("[universe] no quote data received — aborting");
    process.exit(1);
  }

  const filtered = results
    .map((q) => {
      const mcap = q.marketCap ?? 0;
      const avgVol =
        q.averageDailyVolume10Day ?? q.averageDailyVolume3Month ?? 0;
      const name = q.shortName ?? q.longName ?? q.symbol;
      return { ticker: q.symbol, name, marketCap: mcap, avg5dVolume: avgVol };
    })
    .filter(
      (d) =>
        d.marketCap >= MIN_MARKET_CAP &&
        d.marketCap <= MAX_MARKET_CAP &&
        d.avg5dVolume >= MIN_AVG_VOLUME,
    );

  console.log(
    `[universe] filtered to ${filtered.length} tickers ($${MIN_MARKET_CAP / 1_000_000}M ≤ mcap ≤ $${MAX_MARKET_CAP / 1_000_000}M, avg vol ≥ ${MIN_AVG_VOLUME})`,
  );

  if (filtered.length === 0) {
    console.error("[universe] no tickers passed the filter — aborting");
    process.exit(1);
  }

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
