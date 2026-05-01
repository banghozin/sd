import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT_PATH = resolve("src/data/sectors.json");

type Market = "KR" | "US";

type SectorSpec = {
  id: string;
  name: string;
  market: Market;
  ticker: string; // Yahoo Finance symbol
  topTickers: string[];
};

// US: SPDR Select Sector ETFs (very stable, definitive sector proxies)
// KR: TIGER / KODEX sector ETFs on Yahoo (suffix .KS for KOSPI, .KQ for KOSDAQ)
const SECTORS: SectorSpec[] = [
  // ─── US ───
  { id: "us-tech", name: "기술·반도체", market: "US", ticker: "XLK", topTickers: ["AAPL", "MSFT", "NVDA"] },
  { id: "us-comm", name: "통신·미디어", market: "US", ticker: "XLC", topTickers: ["GOOGL", "META", "NFLX"] },
  { id: "us-disc", name: "소비재 (임의)", market: "US", ticker: "XLY", topTickers: ["AMZN", "TSLA", "HD"] },
  { id: "us-staples", name: "소비재 (필수)", market: "US", ticker: "XLP", topTickers: ["WMT", "COST", "PG"] },
  { id: "us-health", name: "헬스케어", market: "US", ticker: "XLV", topTickers: ["LLY", "UNH", "JNJ"] },
  { id: "us-finance", name: "금융", market: "US", ticker: "XLF", topTickers: ["JPM", "BAC", "WFC"] },
  { id: "us-energy", name: "에너지", market: "US", ticker: "XLE", topTickers: ["XOM", "CVX"] },
  { id: "us-ind", name: "산업·방산", market: "US", ticker: "XLI", topTickers: ["GE", "RTX", "BA"] },
  { id: "us-materials", name: "소재", market: "US", ticker: "XLB", topTickers: ["LIN", "SHW"] },
  { id: "us-utility", name: "유틸리티", market: "US", ticker: "XLU", topTickers: ["NEE", "SO"] },
  { id: "us-realty", name: "부동산", market: "US", ticker: "XLRE", topTickers: ["AMT", "PLD"] },

  // ─── KR ───
  { id: "kr-semi", name: "반도체", market: "KR", ticker: "091160.KS", topTickers: ["삼성전자", "SK하이닉스"] },
  { id: "kr-it", name: "IT·소프트웨어", market: "KR", ticker: "243880.KS", topTickers: ["네이버", "카카오"] },
  { id: "kr-auto", name: "자동차", market: "KR", ticker: "091180.KS", topTickers: ["현대차", "기아"] },
  { id: "kr-bank", name: "금융·은행", market: "KR", ticker: "091170.KS", topTickers: ["KB금융", "신한지주"] },
  { id: "kr-bio", name: "바이오·제약", market: "KR", ticker: "244580.KS", topTickers: ["삼성바이오로직스", "셀트리온"] },
  { id: "kr-battery", name: "2차전지", market: "KR", ticker: "305540.KS", topTickers: ["LG에너지솔루션", "에코프로비엠"] },
  { id: "kr-steel", name: "철강·금속", market: "KR", ticker: "117680.KS", topTickers: ["POSCO홀딩스"] },
  { id: "kr-game", name: "게임·엔터", market: "KR", ticker: "300610.KS", topTickers: ["크래프톤", "엔씨소프트"] },
  { id: "kr-chem", name: "화학·소재", market: "KR", ticker: "139250.KS", topTickers: ["LG화학"] },
  { id: "kr-shipbuild", name: "조선·기계", market: "KR", ticker: "139220.KS", topTickers: ["HD현대중공업"] },
  { id: "kr-cosmetic", name: "음식료·화장품", market: "KR", ticker: "228820.KS", topTickers: ["아모레퍼시픽"] },
];

type YahooChartResponse = {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        marketCap?: number;
        regularMarketTime?: number;
      };
    }>;
    error: { code?: string; description?: string } | null;
  };
};

async function fetchYahoo(
  ticker: string,
): Promise<{ changePct: number; marketCapBillion: number; asOf: number } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
  const r = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; StockDashboard/1.0; +https://github.com/banghozin/sd)",
      Accept: "application/json",
    },
  });
  if (!r.ok) {
    console.warn(`[sectors] ${ticker} → HTTP ${r.status}`);
    return null;
  }
  const data = (await r.json()) as YahooChartResponse;
  if (data.chart.error || !data.chart.result?.length) {
    console.warn(
      `[sectors] ${ticker} → ${data.chart.error?.description ?? "no result"}`,
    );
    return null;
  }
  const meta = data.chart.result[0].meta;
  const price = meta.regularMarketPrice ?? 0;
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? 0;
  if (!price || !prev) {
    console.warn(`[sectors] ${ticker} → missing price/prev`);
    return null;
  }
  return {
    changePct: ((price - prev) / prev) * 100,
    marketCapBillion: (meta.marketCap ?? 0) / 1_000_000_000,
    asOf: meta.regularMarketTime ?? 0,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function main() {
  const sectors: {
    id: string;
    name: string;
    market: Market;
    changePct: number;
    marketCapBillion: number;
    topTickers: string[];
    ticker: string;
  }[] = [];

  for (const spec of SECTORS) {
    try {
      const result = await fetchYahoo(spec.ticker);
      if (!result) continue;
      sectors.push({
        id: spec.id,
        name: spec.name,
        market: spec.market,
        changePct: Number(result.changePct.toFixed(2)),
        marketCapBillion: Math.round(result.marketCapBillion),
        topTickers: spec.topTickers,
        ticker: spec.ticker,
      });
      await sleep(120); // rate-limit politeness
    } catch (e) {
      console.warn(`[sectors] ${spec.id} (${spec.ticker}) failed:`, e);
    }
  }

  const out = {
    sectors,
    fetchedAt: new Date().toISOString(),
    source: "Yahoo Finance (sector ETF proxies)",
    count: { total: SECTORS.length, success: sectors.length },
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(
    `[sectors] wrote ${OUT_PATH} · ${sectors.length}/${SECTORS.length} sectors`,
  );
}

main().catch((err) => {
  console.error("[sectors] failed:", err);
  process.exit(1);
});
