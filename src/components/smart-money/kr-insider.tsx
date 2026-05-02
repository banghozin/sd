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
  KR_INSIDER_TRADES as MOCK_KR,
  type KrInsiderTrade,
} from "@/lib/mock-data/smart-money";
import liveDart from "@/data/kr-insiders.json";
import { formatKRW } from "@/lib/portfolio-analysis";
import { ActionBadge } from "./action-badge";
import { SortableHeader, type SortDir } from "./sortable-header";
import { StarButton } from "@/components/watchlist/star-button";

type LiveTrade = {
  id: string;
  name: string;
  position: string;
  stock: string;
  amountKRW: number;
  shareDelta?: number;
  action: "BUY" | "SELL";
  filedAt: string;
};

const liveTrades = (liveDart.trades ?? []) as LiveTrade[];
const KR_INSIDER_TRADES: (KrInsiderTrade & { shareDelta?: number })[] =
  liveTrades.length > 0 ? liveTrades : MOCK_KR;
const IS_LIVE = liveTrades.length > 0;

function formatShares(n: number): string {
  return `${Math.abs(n).toLocaleString("ko-KR")}주`;
}

type SortKey = keyof Pick<
  KrInsiderTrade,
  "name" | "stock" | "amountKRW" | "filedAt" | "action"
>;

type SortableTrade = KrInsiderTrade & { shareDelta?: number };

function sortTrades(
  data: SortableTrade[],
  key: SortKey,
  dir: SortDir,
): SortableTrade[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...data].sort((a, b) => {
    if (key === "amountKRW") {
      const av = a.amountKRW > 0 ? a.amountKRW : Math.abs(a.shareDelta ?? 0);
      const bv = b.amountKRW > 0 ? b.amountKRW : Math.abs(b.shareDelta ?? 0);
      return (av - bv) * sign;
    }
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
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs md:text-sm">
        {IS_LIVE ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            LIVE · DART
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            📦 데모 데이터
          </span>
        )}
        <span className="text-muted-foreground">
          {IS_LIVE
            ? "1시간마다 자동 갱신 · 거래 단가는 공시 본문에 있어 주식 수로 표시"
            : "실데이터는 다음 자동 갱신 시 채워집니다"}
        </span>
      </div>

      {/* 모바일 카드 리스트 */}
      <ul className="flex flex-col gap-3 md:hidden">
        {sorted.map((t) => (
          <li
            key={t.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <StarButton kind="kr-stock" ticker={t.stock} name={t.stock} />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{t.stock}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {t.name} · {t.position}
                  </p>
                </div>
              </div>
              <ActionBadge action={t.action} />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {t.amountKRW > 0
                  ? `${formatKRW(t.amountKRW)}원`
                  : t.shareDelta != null
                    ? formatShares(t.shareDelta)
                    : "—"}
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
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    <StarButton
                      kind="kr-stock"
                      ticker={t.stock}
                      name={t.stock}
                    />
                    {t.stock}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {t.amountKRW > 0
                    ? `${formatKRW(t.amountKRW)}원`
                    : t.shareDelta != null
                      ? formatShares(t.shareDelta)
                      : "—"}
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
