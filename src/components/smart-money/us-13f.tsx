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
  US_13F_HOLDINGS,
  type Us13FHolding,
} from "@/lib/mock-data/smart-money";
import { cn } from "@/lib/utils";
import { ActionBadge } from "./action-badge";
import { SortableHeader, type SortDir } from "./sortable-header";

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
                  <p className="text-base font-semibold">{h.ticker}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {h.stockName}
                  </p>
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
                    h.changePct > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {formatChange(h.changePct)}
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
                  <div className="font-semibold">{h.ticker}</div>
                  <div className="text-xs text-muted-foreground">
                    {h.stockName}
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    h.changePct > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {formatChange(h.changePct)}
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
