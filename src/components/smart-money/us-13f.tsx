"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  US_13F_HOLDINGS as MOCK_US_13F,
  type Us13FHolding,
} from "@/lib/mock-data/smart-money";
import live13F from "@/data/us-13f.json";
import { cn } from "@/lib/utils";
import { ActionBadge } from "./action-badge";
import { SortableHeader, type SortDir } from "./sortable-header";

// Use real SEC EDGAR data when available; fall back to mock if the GitHub
// Actions workflow hasn't seeded data yet.
const liveHoldings = (live13F.holdings ?? []) as Us13FHolding[];
const US_13F_HOLDINGS: Us13FHolding[] =
  liveHoldings.length > 0 ? liveHoldings : MOCK_US_13F;
const IS_LIVE = liveHoldings.length > 0;

type SortKey = keyof Pick<
  Us13FHolding,
  "fund" | "ticker" | "changePct" | "currentWeightPct" | "action"
>;

function sortHoldings(
  data: Us13FHolding[],
  key: SortKey,
  dir: SortDir,
): Us13FHolding[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...data].sort((a, b) => {
    if (key === "changePct") {
      // For live data, sort by weight delta (more meaningful than capped %)
      const av =
        typeof a.weightChangePp === "number" ? a.weightChangePp : a.changePct;
      const bv =
        typeof b.weightChangePp === "number" ? b.weightChangePp : b.changePct;
      return (av - bv) * sign;
    }
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * sign;
    }
    return String(av).localeCompare(String(bv)) * sign;
  });
}

function formatChange(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function displayChange(h: Us13FHolding): string {
  if (h.isNew) return "NEW";
  // Prefer percentage-point weight delta when available (live data)
  if (typeof h.weightChangePp === "number") {
    const v = h.weightChangePp;
    const sign = v > 0 ? "+" : "";
    return `${sign}${v.toFixed(2)}%p`;
  }
  return formatChange(h.changePct);
}

function changeSign(h: Us13FHolding): number {
  if (typeof h.weightChangePp === "number") return Math.sign(h.weightChangePp);
  return Math.sign(h.changePct);
}

export function Us13F() {
  const [sortKey, setSortKey] = useState<SortKey>("changePct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "changePct" || key === "currentWeightPct" ? "desc" : "asc",
      );
    }
  };

  const sorted = useMemo(
    () => sortHoldings(US_13F_HOLDINGS, sortKey, sortDir),
    [sortKey, sortDir],
  );

  return (
    <>
      <div className="mb-3 flex items-center gap-2 text-xs md:text-sm">
        {IS_LIVE ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            LIVE · SEC EDGAR
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            📦 데모 데이터
          </span>
        )}
        <span className="text-muted-foreground">
          {IS_LIVE
            ? "분기마다 자동 갱신 (45일 지연 공시)"
            : "실데이터는 다음 자동 갱신 시 채워집니다"}
        </span>
      </div>

      {/* 모바일 카드 리스트 */}
      <ul className="flex flex-col gap-3 md:hidden">
        {sorted.map((h) => (
          <li
            key={h.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-base font-semibold">
                    {h.ticker || h.stockName}
                  </p>
                  {h.ticker && (
                    <p className="truncate text-xs text-muted-foreground">
                      {h.stockName}
                    </p>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {h.fund} · {h.manager}
                </p>
              </div>
              <ActionBadge action={h.action} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground">비중 변화</p>
                <p
                  className={cn(
                    "mt-0.5 text-xl font-bold tabular-nums",
                    changeSign(h) > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : changeSign(h) < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground",
                  )}
                >
                  {displayChange(h)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">현재 비중</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums">
                  {h.currentWeightPct.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="mt-3 text-right text-xs text-muted-foreground tabular-nums">
              {h.quarter}
            </p>
          </li>
        ))}
      </ul>

      {/* PC/태블릿 테이블 */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>
                <SortableHeader
                  column="fund"
                  label="펀드 / 매니저"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  column="ticker"
                  label="종목"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">
                  <SortableHeader
                    column="changePct"
                    label="비중 변화"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">
                  <SortableHeader
                    column="currentWeightPct"
                    label="현재 비중"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </div>
              </TableHead>
              <TableHead>
                <SortableHeader
                  column="action"
                  label="유형"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
                분기
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((h) => (
              <TableRow key={h.id}>
                <TableCell>
                  <div className="font-medium">{h.fund}</div>
                  <div className="text-xs text-muted-foreground">
                    {h.manager}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold">
                    {h.ticker || h.stockName}
                  </div>
                  {h.ticker && (
                    <div className="text-xs text-muted-foreground">
                      {h.stockName}
                    </div>
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    changeSign(h) > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : changeSign(h) < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground",
                  )}
                >
                  {displayChange(h)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {h.currentWeightPct.toFixed(1)}%
                </TableCell>
                <TableCell>
                  <ActionBadge action={h.action} />
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {h.quarter}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
