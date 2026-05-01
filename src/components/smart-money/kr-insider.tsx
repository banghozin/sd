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
  KR_INSIDER_TRADES,
  type KrInsiderTrade,
} from "@/lib/mock-data/smart-money";
import { formatKRW } from "@/lib/portfolio-analysis";
import { ActionBadge } from "./action-badge";
import { SortableHeader, type SortDir } from "./sortable-header";

type SortKey = keyof Pick<
  KrInsiderTrade,
  "name" | "stock" | "amountKRW" | "filedAt" | "action"
>;

function sortTrades(
  data: KrInsiderTrade[],
  key: SortKey,
  dir: SortDir,
): KrInsiderTrade[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * sign;
    }
    return String(av).localeCompare(String(bv), "ko") * sign;
  });
}

export function KrInsider() {
  const [sortKey, setSortKey] = useState<SortKey>("filedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amountKRW" || key === "filedAt" ? "desc" : "asc");
    }
  };

  const sorted = useMemo(
    () => sortTrades(KR_INSIDER_TRADES, sortKey, sortDir),
    [sortKey, sortDir],
  );

  return (
    <>
      {/* 모바일 카드 리스트 */}
      <ul className="flex flex-col gap-3 md:hidden">
        {sorted.map((t) => (
          <li
            key={t.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{t.stock}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {t.name} · {t.position}
                </p>
              </div>
              <ActionBadge action={t.action} />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {formatKRW(t.amountKRW)}원
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {t.filedAt}
              </p>
            </div>
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
                  column="name"
                  label="임원"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  column="stock"
                  label="종목"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">
                  <SortableHeader
                    column="amountKRW"
                    label="매수 금액"
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
              <TableHead className="text-right">
                <div className="flex justify-end">
                  <SortableHeader
                    column="filedAt"
                    label="공시일"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.position}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{t.stock}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatKRW(t.amountKRW)}원
                </TableCell>
                <TableCell>
                  <ActionBadge action={t.action} />
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {t.filedAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
