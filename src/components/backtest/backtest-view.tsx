"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Database, Flame, Clock } from "lucide-react";
import { useChartModalStore } from "@/lib/store/chart-modal-store";
import { cn } from "@/lib/utils";

type Returns = {
  current: number | null;
  oneDay?: number | null;
  oneWeek?: number | null;
  oneMonth?: number | null;
};

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
  returns: Returns;
  rvolBucket: "3-5x" | "5-10x" | "10x+";
  sessionBucket: "early" | "mid" | "late";
};

type Agg = {
  n: number;
  avg: number;
  median: number;
  positivePct: number;
  best: number;
  worst: number;
};

type HorizonStats = {
  n: number;
  oneDay: Agg | null;
  oneWeek: Agg | null;
  oneMonth: Agg | null;
  current: Agg | null;
};

type BacktestData = {
  lastUpdated: string;
  totalSignals: number;
  uniqueDays: number;
  rows: StatRow[];
  overall: HorizonStats;
  rvolBuckets: Record<"3-5x" | "5-10x" | "10x+", HorizonStats>;
  sessionBuckets: Record<"early" | "mid" | "late", HorizonStats>;
};

const TARGET_DAYS = 30;

const SESSION_LABEL: Record<"early" | "mid" | "late", string> = {
  early: "장 초반 (9:30-12:00 ET)",
  mid: "장 중반 (12:00-14:00 ET)",
  late: "장 후반 (14:00-16:00 ET)",
};

function formatPct(v: number | null | undefined, signed = true): string {
  if (v === null || v === undefined) return "—";
  const s = signed && v > 0 ? "+" : "";
  return `${s}${v.toFixed(2)}%`;
}

function formatMcap(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function returnTone(v: number | null | undefined): string {
  if (v === null || v === undefined) return "text-muted-foreground";
  if (v > 0) return "text-emerald-600 dark:text-emerald-400";
  if (v < 0) return "text-rose-600 dark:text-rose-400";
  return "text-muted-foreground";
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
        <p className="text-sm text-muted-foreground">
          백테스트 데이터 불러오는 중... (최대 ~10초)
        </p>
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
            장에서 자동으로 시그널이 누적되며, 누적이 끝나면 1일/1주/1개월 후
            수익률 · RVol 강도별 통계 · 시간대별 통계가 자동으로 표시됩니다.
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

      {data.overall.n > 0 && (
        <>
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold md:text-lg">
                홀딩 기간별 평균 수익률
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {data.overall.n}건
              </span>
            </div>
            <HorizonStatsGrid stats={data.overall} />
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-base font-semibold md:text-lg">
                RVol 강도별 통계
              </h2>
            </div>
            <BucketTable
              rows={[
                { label: "3 ~ 5배", stats: data.rvolBuckets["3-5x"], hint: "약한 시그널" },
                { label: "5 ~ 10배", stats: data.rvolBuckets["5-10x"], hint: "중간 강도" },
                { label: "10배+", stats: data.rvolBuckets["10x+"], hint: "강한 시그널" },
              ]}
            />
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-500" />
              <h2 className="text-base font-semibold md:text-lg">
                감지 시간대별 통계
              </h2>
            </div>
            <BucketTable
              rows={[
                { label: "장 초반", stats: data.sessionBuckets.early, hint: SESSION_LABEL.early },
                { label: "장 중반", stats: data.sessionBuckets.mid, hint: SESSION_LABEL.mid },
                { label: "장 후반", stats: data.sessionBuckets.late, hint: SESSION_LABEL.late },
              ]}
            />
          </section>
        </>
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
          <SignalRows rows={data.rows} onClickRow={openChart} />
        </section>
      )}
    </div>
  );
}

function HorizonStatsGrid({ stats }: { stats: HorizonStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <HorizonCard label="+1일 후" agg={stats.oneDay} />
      <HorizonCard label="+1주 후" agg={stats.oneWeek} />
      <HorizonCard label="+1개월 후" agg={stats.oneMonth} />
      <HorizonCard label="현재 (실시간)" agg={stats.current} />
    </div>
  );
}

function HorizonCard({ label, agg }: { label: string; agg: Agg | null }) {
  if (!agg || agg.n === 0) {
    return (
      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 md:p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground md:text-sm">
          {label}
        </p>
        <p className="text-base text-muted-foreground">데이터 없음</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 md:p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground md:text-sm">
        {label}
      </p>
      <p
        className={cn(
          "flex items-center gap-1.5 text-xl font-bold tabular-nums md:text-2xl",
          returnTone(agg.avg),
        )}
      >
        {agg.avg > 0 ? (
          <TrendingUp className="h-5 w-5" />
        ) : agg.avg < 0 ? (
          <TrendingDown className="h-5 w-5" />
        ) : null}
        {formatPct(agg.avg)}
      </p>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground md:text-xs">
        <span>중앙값 {formatPct(agg.median)}</span>
        <span>양수 {agg.positivePct.toFixed(0)}%</span>
        <span>최고 {formatPct(agg.best)}</span>
        <span>최저 {formatPct(agg.worst)}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground md:text-xs">
        n = {agg.n}
      </p>
    </div>
  );
}

function BucketTable({
  rows,
}: {
  rows: Array<{ label: string; stats: HorizonStats; hint?: string }>;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">구간</th>
            <th className="px-4 py-3 text-right">건수</th>
            <th className="px-4 py-3 text-right">+1일</th>
            <th className="px-4 py-3 text-right">+1주</th>
            <th className="px-4 py-3 text-right">+1개월</th>
            <th className="px-4 py-3 text-right">현재</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-border/40 last:border-0"
            >
              <td className="px-4 py-3">
                <p className="font-semibold">{row.label}</p>
                {row.hint && (
                  <p className="text-xs text-muted-foreground">{row.hint}</p>
                )}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {row.stats.n}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-semibold tabular-nums",
                  returnTone(row.stats.oneDay?.avg ?? null),
                )}
              >
                {formatPct(row.stats.oneDay?.avg ?? null)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-semibold tabular-nums",
                  returnTone(row.stats.oneWeek?.avg ?? null),
                )}
              >
                {formatPct(row.stats.oneWeek?.avg ?? null)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-semibold tabular-nums",
                  returnTone(row.stats.oneMonth?.avg ?? null),
                )}
              >
                {formatPct(row.stats.oneMonth?.avg ?? null)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-semibold tabular-nums",
                  returnTone(row.stats.current?.avg ?? null),
                )}
              >
                {formatPct(row.stats.current?.avg ?? null)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignalRows({
  rows,
  onClickRow,
}: {
  rows: StatRow[];
  onClickRow: (ticker: string, name?: string) => void;
}) {
  return (
    <>
      {/* 모바일 카드 */}
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.slice(0, 50).map((r) => (
          <li key={`${r.date}-${r.ticker}`}>
            <button
              type="button"
              onClick={() => onClickRow(r.ticker, r.name)}
              className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-base font-bold">{r.ticker}</p>
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
              <div className="grid grid-cols-4 gap-1.5 border-t border-border/50 pt-2 text-xs">
                <ReturnCell label="+1d" value={r.returns.oneDay} />
                <ReturnCell label="+1w" value={r.returns.oneWeek} />
                <ReturnCell label="+1m" value={r.returns.oneMonth} />
                <ReturnCell label="현재" value={r.returns.current} />
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
              <th className="px-4 py-3 text-right">+1일</th>
              <th className="px-4 py-3 text-right">+1주</th>
              <th className="px-4 py-3 text-right">+1개월</th>
              <th className="px-4 py-3 text-right">현재</th>
              <th className="px-4 py-3 text-right">시총</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((r) => (
              <tr
                key={`${r.date}-${r.ticker}`}
                onClick={() => onClickRow(r.ticker, r.name)}
                className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {r.date}
                </td>
                <td className="px-4 py-3 font-mono font-bold">{r.ticker}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                  {r.name}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {r.rvol.toFixed(1)}x
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-mono tabular-nums",
                    returnTone(r.returns.oneDay),
                  )}
                >
                  {formatPct(r.returns.oneDay)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-mono tabular-nums",
                    returnTone(r.returns.oneWeek),
                  )}
                >
                  {formatPct(r.returns.oneWeek)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-mono tabular-nums",
                    returnTone(r.returns.oneMonth),
                  )}
                >
                  {formatPct(r.returns.oneMonth)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-mono font-semibold tabular-nums",
                    returnTone(r.returns.current),
                  )}
                >
                  {formatPct(r.returns.current)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                  {formatMcap(r.mcap)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ReturnCell({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn("font-mono font-semibold", returnTone(value))}>
        {formatPct(value)}
      </div>
    </div>
  );
}
