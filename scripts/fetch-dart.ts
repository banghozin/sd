import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { KR_CORP_CODES } from "./kr-corp-codes";

const OUT_PATH = resolve("src/data/kr-insiders.json");
const API_BASE = "https://opendart.fss.or.kr/api/elestock.json";
const KEY = process.env.DART_API_KEY;

const TOP_N = 15;

if (!KEY) {
  console.error("[dart] DART_API_KEY env var is required");
  process.exit(1);
}

type ElestockRow = {
  rcept_no?: string;
  rcept_dt?: string; // YYYYMMDD
  corp_code?: string;
  corp_name?: string;
  repror?: string; // 보고자 (filer)
  isu_exctv_rgist_at?: string; // 등기여부
  isu_exctv_ofcps?: string; // 직위
  isu_main_shrholdr?: string; // 주요주주여부
  // The transaction-detail fields differ between filings; we map several
  // candidate keys defensively below.
  sp_stock_lmp_cnt?: string; // 특정증권 보유 수량
  sp_stock_lmp_irds_cnt?: string; // 변동 수량 (+ buy / - sell)
  sp_stock_lmp_irds_rate?: string; // 변동 비율
  [key: string]: string | undefined;
};

type DartResponse = {
  status: string; // "000" = success
  message: string;
  list?: ElestockRow[];
};

function toDate(value: string | undefined): string {
  if (!value) return "";
  // DART may return either "YYYYMMDD" or "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  return value;
}

function parseNumber(s: string | undefined): number {
  if (!s) return 0;
  const n = Number(String(s).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

async function fetchCompany(code: string): Promise<ElestockRow[]> {
  const url = `${API_BASE}?crtfc_key=${KEY}&corp_code=${code}`;
  const r = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!r.ok) {
    throw new Error(`DART ${code} → HTTP ${r.status}`);
  }
  const data = (await r.json()) as DartResponse;
  if (data.status !== "000") {
    // 013 = "조회된 데이타가 없습니다" — common, skip silently
    if (data.status === "013") return [];
    throw new Error(`DART ${code} → ${data.status}: ${data.message}`);
  }
  return data.list ?? [];
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

type InsiderTrade = {
  id: string;
  name: string;
  position: string;
  stock: string;
  amountKRW: number; // approximate; some filings only report share counts
  shareDelta: number;
  action: "BUY" | "SELL";
  filedAt: string; // ISO date
  rceptNo: string;
};

function rowToTrade(row: ElestockRow): InsiderTrade | null {
  const filedAt = toDate(row.rcept_dt);
  if (!filedAt) return null;

  const delta = parseNumber(row.sp_stock_lmp_irds_cnt);

  // Some DART filings include 거래단가 / 취득단가 — try several plausible keys.
  // If unavailable, leave amount at 0 and we'll display share count instead.
  const unitPrice =
    parseNumber(row["unit_pr"]) ||
    parseNumber(row["trd_unit_pr"]) ||
    parseNumber(row["acqs_unit_pr"]) ||
    0;
  const amount = Math.abs(delta) * unitPrice;

  return {
    id: `dart-${row.rcept_no ?? Math.random().toString(36).slice(2)}`,
    name: row.repror?.trim() || row.isu_main_shrholdr?.trim() || "(공시자)",
    position: row.isu_exctv_ofcps?.trim() || row.isu_exctv_rgist_at?.trim() || "임원",
    stock: row.corp_name?.trim() || "",
    amountKRW: amount,
    shareDelta: delta,
    action: delta >= 0 ? "BUY" : "SELL",
    filedAt,
    rceptNo: row.rcept_no ?? "",
  };
}

async function main() {
  const all: InsiderTrade[] = [];
  let inspected = 0;
  let firstRowLogged = false;

  for (const company of KR_CORP_CODES) {
    try {
      const rows = await fetchCompany(company.code);
      inspected += rows.length;
      if (!firstRowLogged && rows.length > 0) {
        console.log(
          `[dart] sample row keys for ${company.name}:`,
          Object.keys(rows[0]).join(", "),
        );
        firstRowLogged = true;
      }
      for (const row of rows) {
        const trade = rowToTrade(row);
        if (!trade) continue;
        if (trade.shareDelta === 0) continue;
        all.push(trade);
      }
      await sleep(50);
    } catch (e) {
      console.warn(`[dart] ${company.name} (${company.code}) failed:`, e);
    }
  }

  // De-dupe by rceptNo (multiple filings can include the same form)
  const seen = new Set<string>();
  const deduped = all.filter((t) => {
    if (!t.rceptNo) return true;
    if (seen.has(t.rceptNo)) return false;
    seen.add(t.rceptNo);
    return true;
  });

  // Sort: most recent first, then by amount magnitude
  deduped.sort((a, b) => {
    if (a.filedAt !== b.filedAt) return b.filedAt.localeCompare(a.filedAt);
    return Math.abs(b.shareDelta) - Math.abs(a.shareDelta);
  });

  const top = deduped.slice(0, TOP_N);
  const out = {
    trades: top,
    fetchedAt: new Date().toISOString(),
    inspected,
    matched: deduped.length,
    source: "DART OpenAPI elestock.json",
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(
    `[dart] wrote ${OUT_PATH} · inspected ${inspected} rows, matched ${deduped.length}, kept top ${top.length}`,
  );
}

main().catch((err) => {
  console.error("[dart] failed:", err);
  process.exit(1);
});
