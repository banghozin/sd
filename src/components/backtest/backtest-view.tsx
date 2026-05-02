"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Database } from "lucide-react";
import { useChartModalStore } from "@/lib/store/chart-modal-store";
import { cn } from "@/lib/utils";

type StatRow = {
  date: string;
  ticker: string;
  name: string;
  rvol: number;
  priceAtDetection: number;
  priceChangePctAtDetection: number;
  mcap: number;
  capturedAt: string;
  currentPrice: number | null;
  forwardReturnPct: number | null;
};

type Stats = {
  n: number;
  avg: number;
  median: number;
  positivePct: number;
  best: number;
  worst: number;
};

type BacktestData = {
  lastUpdated: string;
  totalSignals: number;
  uniqueDays: number;
  rows: StatRow[];
  stats: Stats | null;
};

const TARGET_DAYS = 30;

function formatPct(v: number | null, signed = true): string {
  if (v === null) return "—";
  const s = signed && v > 0 ? "+" : "";
  return `${s}${v.toFixed(2)}%`;
}

function formatMcap(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export function BacktestView() {
  const [data, setData] = useState<BacktestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const openChart = useChartModalStore((s) => s.open);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/backtest", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as BacktestData;
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">백테스트 데이터 불러오는 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          데이터를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const accumulating = data.uniqueDays < TARGET_DAYS;

  return (
    <div className="flex flex-col gap-6">
      {accumulating && (
        <section className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold md:text-lg">
              데이터 수집 중 ({data.uniqueDays}/{TARGET_DAYS}일)
            </h2>
          </div>
          <p className="text-sm text-foreground/85 md:text-base">
            의미 있는 백테스트를 위해 최소 30일치 데이터가 필요합니다. 매일 미국
            장에서 자동으로 시그널이 누적되며, 누적이 끝나면 평균 수익률 ·
            중앙값 · 양수 비율 등 통계가 자동으로 표시됩니다.
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, (data.uniqueDays / TARGET_DAYS) * 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground md:text-sm">
            지금까지 {data.totalSignals.toLocaleString()}개 시그널이 누적되었어요.
          </p>
        </section>
      )}

      {data.stats && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="평균 수익률"
            value={formatPct(data.stats.avg)}
            tone={data.stats.avg >= 0 ? "up" : "down"}
          />
          <StatCard
            label="중앙값"
            value={formatPct(data.stats.median)}
            tone={data.stats.median >= 0 ? "up" : "down"}
          />
          <StatCard
            label="양수 비율"
            value={`${data.stats.positivePct.toFixed(1)}%`}
            sub={`${data.stats.n}개 종목 중`}
          />
          <StatCard
            label="최고 / 최저"
            value={`${formatPct(data.stats.best)} / ${formatPct(data.stats.worst)}`}
          />
        </section>
      )}

      {data.rows.length === 0 ? (
        <section className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            아직 누적된 시그널이 없습니다. 미국 장이 열린 후 30분 이상 지나면
            자동으로 첫 시그널이 기록됩니다.
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold md:text-lg">시그널 이력</h3>

          {/* 모바일 카드 */}
          <ul className="flex flex-col gap-2 md:hidden">
            {data.rows.slice(0, 50).map((r) => (
              <li key={`${r.date}-${r.ticker}`}>
                <button
                  type="button"
                  onClick={() => openChart(r.ticker, r.name)}
                  className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-mono text-base font-bold">
                        {r.ticker}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                      <p className="text-xs text-muted-foreground">
                        RVol {r.rvol.toFixed(1)}x
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-2 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">진입가</p>
                      <p className="font-mono">
                        ${r.priceAtDetection.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">현재가</p>
                      <p className="font-mono">
                        {r.currentPrice != null
                          ? `$${r.currentPrice.toFixed(2)}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">수익률</p>
                      <p
                        className={cn(
                          "font-mono font-semibold",
                          r.forwardReturnPct !== null && r.forwardReturnPct > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : r.forwardReturnPct !== null &&
                                r.forwardReturnPct < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-muted-foreground",
                        )}
                      >
                        {formatPct(r.forwardReturnPct)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* 데스크톱 테이블 */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">감지일</th>
                  <th className="px-4 py-3 text-left">티커</th>
                  <th className="px-4 py-3 text-left">종목명</th>
                  <th className="px-4 py-3 text-right">RVol</th>
                  <th className="px-4 py-3 text-right">진입가</th>
                  <th className="px-4 py-3 text-right">현재가</th>
                  <th className="px-4 py-3 text-right">수익률</th>
                  <th className="px-4 py-3 text-right">시총</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(0, 100).map((r) => (
                  <tr
                    key={`${r.date}-${r.ticker}`}
                    onClick={() => openChart(r.ticker, r.name)}
                    className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {r.date}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">{r.ticker}</td>
                    <td className="max-w-[260px] truncate px-4 py-3 text-muted-foreground">
                      {r.name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      {r.rvol.toFixed(1)}x
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      ${r.priceAtDetection.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {r.currentPrice != null
                        ? `$${r.currentPrice.toFixed(2)}`
                        : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-mono font-semibold tabular-nums",
                        r.forwardReturnPct !== null && r.forwardReturnPct > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : r.forwardReturnPct !== null &&
                              r.forwardReturnPct < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground",
                      )}
                    >
                      {formatPct(r.forwardReturnPct)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                      {formatMcap(r.mcap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down" | "neutral";
}) {
  const toneClass =
    tone === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "down"
        ? "text-rose-600 dark:text-rose-400"
        : "text-foreground";
  const Icon = tone === "up" ? TrendingUp : tone === "down" ? TrendingDown : null;
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 md:p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground md:text-sm">
        {label}
      </p>
      <p
        className={cn(
          "flex items-center gap-1.5 text-xl font-bold tabular-nums md:text-2xl",
          toneClass,
        )}
      >
        {Icon && <Icon className="h-5 w-5" />}
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground md:text-sm">{sub}</p>
      )}
    </div>
  );
}
