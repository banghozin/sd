import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { XMLParser } from "fast-xml-parser";
import { lookupTicker } from "./cusip-map";

const OUT_PATH = resolve("src/data/us-13f.json");

// SEC requires a User-Agent in the form "<Company Name> <contact email>".
// Parentheses, slashes, or browser strings cause 403.
// Override with SEC_USER_AGENT env var when running in CI.
const USER_AGENT =
  process.env.SEC_USER_AGENT ??
  "StockDashboard banghozin@users.noreply.github.com";

const FUNDS: { cik: string; name: string; manager: string }[] = [
  { cik: "0001067983", name: "Berkshire Hathaway", manager: "Warren Buffett" },
  { cik: "0001649339", name: "Scion Asset Management", manager: "Michael Burry" },
  { cik: "0001336528", name: "Pershing Square", manager: "Bill Ackman" },
  { cik: "0001167483", name: "Bridgewater Associates", manager: "Ray Dalio" },
  { cik: "0001167483_alt", name: "Tiger Global", manager: "Chase Coleman" },
];

// Tiger Global's CIK
FUNDS[4] = {
  cik: "0001167483",
  name: "Tiger Global Management",
  manager: "Chase Coleman",
};

// Use Bridgewater + Tiger correctly (different CIKs)
FUNDS[3] = {
  cik: "0001350694",
  name: "Bridgewater Associates",
  manager: "Ray Dalio",
};
FUNDS[4] = {
  cik: "0001167483",
  name: "Tiger Global Management",
  manager: "Chase Coleman",
};

const TOP_N_PER_FUND = 8;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
});

async function secFetch(url: string, init?: RequestInit): Promise<Response> {
  const r = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json, text/xml, */*",
      ...(init?.headers ?? {}),
    },
  });
  if (!r.ok) {
    throw new Error(`SEC ${url} → ${r.status}`);
  }
  return r;
}

type FilingRef = {
  accession: string;
  filingDate: string;
  reportDate: string;
};

async function getRecent13FFilings(cik: string): Promise<FilingRef[]> {
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const r = await secFetch(url);
  const data = (await r.json()) as {
    filings: {
      recent: {
        accessionNumber: string[];
        form: string[];
        filingDate: string[];
        reportDate: string[];
      };
    };
  };
  const recent = data.filings.recent;
  const out: FilingRef[] = [];
  for (let i = 0; i < recent.form.length; i++) {
    if (recent.form[i] === "13F-HR") {
      out.push({
        accession: recent.accessionNumber[i],
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate[i],
      });
    }
  }
  // Newest first
  return out.sort((a, b) => b.reportDate.localeCompare(a.reportDate));
}

async function findInfoTableUrl(cik: string, accession: string): Promise<string | null> {
  const accNoDash = accession.replace(/-/g, "");
  const cikInt = parseInt(cik, 10);
  const indexUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accNoDash}/index.json`;
  const r = await secFetch(indexUrl);
  const data = (await r.json()) as {
    directory: { item: { name: string }[] };
  };
  const items = data.directory.item;
  // Heuristic: prefer files containing "infotable" or "InfoTable" in the name
  const candidates = items.filter((i) => /\.xml$/i.test(i.name));
  const informationTable =
    candidates.find((i) => /infotable/i.test(i.name)) ??
    candidates.find((i) => /form13f/i.test(i.name)) ??
    candidates.find((i) => !/primary|cover|index/i.test(i.name));
  if (!informationTable) return null;
  return `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accNoDash}/${informationTable.name}`;
}

type RawHolding = {
  cusip: string;
  issuer: string;
  titleOfClass: string;
  valueUsd: number;
  shares: number;
};

async function fetchInfoTable(url: string): Promise<RawHolding[]> {
  const r = await secFetch(url);
  const xml = await r.text();
  const parsed = xmlParser.parse(xml) as {
    informationTable?: {
      infoTable?: unknown;
    };
  };
  const raw = parsed.informationTable?.infoTable;
  if (!raw) return [];
  const rows = Array.isArray(raw) ? raw : [raw];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    const value = Number(r.value ?? 0);
    const shrs = r.shrsOrPrnAmt as Record<string, unknown> | undefined;
    return {
      cusip: String(r.cusip ?? "").trim().toUpperCase(),
      issuer: String(r.nameOfIssuer ?? "").trim(),
      titleOfClass: String(r.titleOfClass ?? "").trim(),
      // EDGAR reports value in thousands (post-2022 amendment) — but historical
      // filings are in dollars. We treat the raw number as the unit the filer used
      // and only use ratios for weight (which is unit-independent).
      valueUsd: value,
      shares: Number(shrs?.sshPrnamt ?? 0),
    };
  });
}

function aggregateByCusip(rows: RawHolding[]): Map<string, RawHolding> {
  // A fund may report the same security on multiple lines (different managers).
  // Aggregate by CUSIP for clean comparison.
  const m = new Map<string, RawHolding>();
  for (const r of rows) {
    if (!r.cusip) continue;
    const existing = m.get(r.cusip);
    if (existing) {
      existing.valueUsd += r.valueUsd;
      existing.shares += r.shares;
    } else {
      m.set(r.cusip, { ...r });
    }
  }
  return m;
}

type FundResult = {
  fund: string;
  manager: string;
  cik: string;
  reportDate: string;
  filingDate: string;
  prevReportDate: string | null;
  holdings: {
    id: string;
    fund: string;
    manager: string;
    ticker: string;
    stockName: string;
    cusip: string;
    currentWeightPct: number;
    changePct: number;
    action: "BUY" | "SELL";
    isNew: boolean;
    quarter: string;
  }[];
};

function quarterLabel(reportDate: string): string {
  // reportDate ISO: YYYY-MM-DD
  const [y, m] = reportDate.split("-");
  const month = parseInt(m, 10);
  const q = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;
  return `Q${q} ${y}`;
}

async function processFund(
  fund: { cik: string; name: string; manager: string },
): Promise<FundResult | null> {
  console.log(`[13f] ${fund.name} (CIK ${fund.cik})`);
  const filings = await getRecent13FFilings(fund.cik);
  if (filings.length === 0) {
    console.warn(`[13f] ${fund.name}: no 13F-HR filings`);
    return null;
  }
  const latest = filings[0];
  const previous = filings[1];

  await sleep(150);
  const latestUrl = await findInfoTableUrl(fund.cik, latest.accession);
  if (!latestUrl) {
    console.warn(`[13f] ${fund.name}: latest info table not found`);
    return null;
  }
  await sleep(150);
  const latestRows = await fetchInfoTable(latestUrl);
  const latestMap = aggregateByCusip(latestRows);
  const latestTotal = [...latestMap.values()].reduce(
    (s, h) => s + h.valueUsd,
    0,
  );

  let prevMap = new Map<string, RawHolding>();
  if (previous) {
    try {
      await sleep(150);
      const prevUrl = await findInfoTableUrl(fund.cik, previous.accession);
      if (prevUrl) {
        await sleep(150);
        const prevRows = await fetchInfoTable(prevUrl);
        prevMap = aggregateByCusip(prevRows);
      }
    } catch (e) {
      console.warn(`[13f] ${fund.name}: prev filing fetch failed`, e);
    }
  }

  const holdings: FundResult["holdings"] = [];
  for (const [cusip, latestRow] of latestMap.entries()) {
    const currentWeight =
      latestTotal > 0 ? latestRow.valueUsd / latestTotal : 0;
    const prev = prevMap.get(cusip);
    const isNew = !prev;
    let changePct: number;
    if (isNew) {
      // brand new position: cap the visual at +999 to keep UI sane
      changePct = 100;
    } else if (prev.valueUsd <= 0) {
      changePct = 100;
    } else {
      changePct = ((latestRow.valueUsd - prev.valueUsd) / prev.valueUsd) * 100;
    }
    const action: "BUY" | "SELL" = changePct >= 0 ? "BUY" : "SELL";
    holdings.push({
      id: `${fund.cik}-${cusip}`,
      fund: fund.name,
      manager: fund.manager,
      ticker: lookupTicker(cusip),
      stockName: latestRow.issuer,
      cusip,
      currentWeightPct: currentWeight * 100,
      changePct,
      action,
      isNew,
      quarter: quarterLabel(latest.reportDate),
    });
  }

  // Sort by absolute changePct, then by current weight as tiebreaker
  holdings.sort((a, b) => {
    const da = Math.abs(a.changePct);
    const db = Math.abs(b.changePct);
    if (db !== da) return db - da;
    return b.currentWeightPct - a.currentWeightPct;
  });

  return {
    fund: fund.name,
    manager: fund.manager,
    cik: fund.cik,
    reportDate: latest.reportDate,
    filingDate: latest.filingDate,
    prevReportDate: previous?.reportDate ?? null,
    holdings: holdings.slice(0, TOP_N_PER_FUND),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function main() {
  const results: FundResult[] = [];
  for (const fund of FUNDS) {
    try {
      const r = await processFund(fund);
      if (r) results.push(r);
      await sleep(300); // SEC rate-limit politeness
    } catch (e) {
      console.error(`[13f] ${fund.name} failed:`, e);
    }
  }

  // Flat list across funds, sorted by absolute change for the table view
  const flat = results.flatMap((r) => r.holdings);
  flat.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));

  const out = {
    funds: results.map((r) => ({
      fund: r.fund,
      manager: r.manager,
      cik: r.cik,
      reportDate: r.reportDate,
      filingDate: r.filingDate,
      prevReportDate: r.prevReportDate,
    })),
    holdings: flat,
    fetchedAt: new Date().toISOString(),
    source: "SEC EDGAR 13F-HR",
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`[13f] wrote ${OUT_PATH} · ${results.length} funds, ${flat.length} holdings`);
}

main().catch((err) => {
  console.error("[13f] failed:", err);
  process.exit(1);
});
