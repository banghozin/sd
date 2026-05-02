"use client";

import { Flame } from "lucide-react";
import { StarButton } from "@/components/watchlist/star-button";
import { useChartModalStore } from "@/lib/store/chart-modal-store";

type Signal = {
  ticker: string;
  name: string;
  price: number;
  priceChangePct: number;
  todayVolume: number;
  avg5dVolume: number;
  rvol: number;
  elapsedMin: number;
  mcap: number;
};

function formatVolume(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatMarketCap(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function rvolColor(rvol: number): string {
  if (rvol >= 10) return "text-rose-500 font-bold";
  if (rvol >= 5) return "text-orange-500 font-semibold";
  return "text-amber-600 dark:text-amber-400 font-semibold";
}

function rvolFlames(rvol: number): number {
  if (rvol >= 10) return 3;
  if (rvol >= 5) return 2;
  return 1;
}

export function SignalTable({ signals }: { signals: Signal[] }) {
  const openChart = useChartModalStore((s) => s.open);

  return (
    <>
      {/* Mobile: card list */}
      <div className="flex flex-col gap-2 md:hidden">
        {signals.map((s) => (
          <button
            key={s.ticker}
            type="button"
            onClick={() => openChart(s.ticker, s.name)}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <StarButton kind="us-stock" ticker={s.ticker} name={s.name} />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-base font-bold">{s.ticker}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {s.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-semibold">
                  ${s.price.toFixed(2)}
                </div>
                <div
                  className={`text-xs font-medium ${
                    s.priceChangePct > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : s.priceChangePct < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.priceChangePct > 0 ? "+" : ""}
                  {s.priceChangePct.toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-2 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  RVol
                </div>
                <div className={`flex items-center gap-1 ${rvolColor(s.rvol)}`}>
                  {Array.from({ length: rvolFlames(s.rvol) }).map((_, i) => (
                    <Flame
                      key={i}
                      className="h-3 w-3 fill-current"
                    />
                  ))}
                  {s.rvol.toFixed(1)}x
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  거래량
                </div>
                <div className="font-mono">{formatVolume(s.todayVolume)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  시총
                </div>
                <div className="font-mono">{formatMarketCap(s.mcap)}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-2 py-3" aria-label="워치리스트" />
              <th className="px-4 py-3 text-left">티커</th>
              <th className="px-4 py-3 text-left">종목명</th>
              <th className="px-4 py-3 text-right">가격</th>
              <th className="px-4 py-3 text-right">변동률</th>
              <th className="px-4 py-3 text-right">RVol</th>
              <th className="px-4 py-3 text-right">오늘 거래량</th>
              <th className="px-4 py-3 text-right">5일 평균</th>
              <th className="px-4 py-3 text-right">시총</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s) => (
              <tr
                key={s.ticker}
                onClick={() => openChart(s.ticker, s.name)}
                className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/30"
              >
                <td className="px-2 py-3 text-center">
                  <StarButton kind="us-stock" ticker={s.ticker} name={s.name} />
                </td>
                <td className="px-4 py-3 font-mono font-bold">{s.ticker}</td>
                <td className="max-w-[260px] truncate px-4 py-3 text-muted-foreground">
                  {s.name}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  ${s.price.toFixed(2)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    s.priceChangePct > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : s.priceChangePct < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.priceChangePct > 0 ? "+" : ""}
                  {s.priceChangePct.toFixed(2)}%
                </td>
                <td className={`px-4 py-3 text-right ${rvolColor(s.rvol)}`}>
                  <span className="inline-flex items-center gap-1">
                    {Array.from({ length: rvolFlames(s.rvol) }).map((_, i) => (
                      <Flame key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                    {s.rvol.toFixed(1)}x
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatVolume(s.todayVolume)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {formatVolume(s.avg5dVolume)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {formatMarketCap(s.mcap)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
