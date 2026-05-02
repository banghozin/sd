"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { useChartModalStore } from "@/lib/store/chart-modal-store";
import { CandleChart } from "./candle-chart";
import { cn } from "@/lib/utils";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type ChartData = {
  ticker: string;
  candles: Candle[];
  meta: {
    previousClose: number | null;
    currency: string | null;
    exchangeName: string | null;
  };
};

type Range = "1d" | "5d" | "1mo" | "3mo";

const RANGES: { value: Range; label: string; interval: string }[] = [
  { value: "1d", label: "1일", interval: "5m" },
  { value: "5d", label: "5일", interval: "30m" },
  { value: "1mo", label: "1개월", interval: "1d" },
  { value: "3mo", label: "3개월", interval: "1d" },
];

export function ChartModal() {
  const isOpen = useChartModalStore((s) => s.isOpen);
  const ticker = useChartModalStore((s) => s.ticker);
  const name = useChartModalStore((s) => s.name);
  const close = useChartModalStore((s) => s.close);

  const [range, setRange] = useState<Range>("1d");
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setRange("1d");
      setData(null);
      setError(null);
    }
  }, [isOpen, ticker]);

  // Fetch chart whenever range or ticker changes
  useEffect(() => {
    if (!isOpen || !ticker) return;
    let cancelled = false;
    const rangeSpec = RANGES.find((r) => r.value === range)!;
    setLoading(true);
    setError(null);
    fetch(
      `/api/chart?ticker=${encodeURIComponent(ticker)}&range=${rangeSpec.value}&interval=${rangeSpec.interval}`,
      { cache: "no-store" },
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as ChartData;
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
  }, [isOpen, ticker, range]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !ticker) return null;

  const lastCandle = data?.candles[data.candles.length - 1];
  const prevClose = data?.meta.previousClose;
  const currentPrice = lastCandle?.close;
  const changePct =
    currentPrice != null && prevClose != null && prevClose !== 0
      ? ((currentPrice - prevClose) / prevClose) * 100
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${ticker} 가격 차트`}
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={close}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center p-0 md:inset-0 md:items-center md:p-4">
        <div
          className={cn(
            "relative flex w-full flex-col rounded-t-3xl border border-border bg-background shadow-2xl",
            "md:max-w-3xl md:rounded-2xl",
            "max-h-[88vh] md:max-h-[80vh]",
            "animate-in slide-in-from-bottom duration-200 md:fade-in md:zoom-in-95",
          )}
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <h2 className="font-mono text-lg font-bold md:text-xl">
                  {ticker}
                </h2>
                {currentPrice != null && (
                  <span className="font-mono text-base font-semibold tabular-nums md:text-lg">
                    ${currentPrice.toFixed(2)}
                  </span>
                )}
                {changePct != null && (
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      changePct > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : changePct < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground",
                    )}
                  >
                    {changePct > 0 ? "+" : ""}
                    {changePct.toFixed(2)}%
                  </span>
                )}
              </div>
              {name && (
                <p className="truncate text-xs text-muted-foreground md:text-sm">
                  {name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <a
                href={`https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
                aria-label="Yahoo Finance에서 보기"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="flex items-center gap-1.5 border-b border-border px-5 py-3">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors md:text-sm",
                  range === r.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground/70 hover:bg-muted/80",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 overflow-hidden p-3 md:p-4">
            {loading && !data && (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">차트 불러오는 중...</p>
              </div>
            )}
            {error && (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <p className="text-sm">차트를 불러올 수 없습니다</p>
                <p className="text-xs">잠시 후 다시 시도해주세요</p>
              </div>
            )}
            {data && data.candles.length > 0 && (
              <CandleChart candles={data.candles} height={360} />
            )}
            {data && data.candles.length === 0 && (
              <div className="flex h-full min-h-[280px] items-center justify-center text-muted-foreground">
                <p className="text-sm">표시할 가격 데이터가 없습니다</p>
              </div>
            )}
          </div>

          <footer className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground md:text-xs">
            데이터 출처: Yahoo Finance · 무료 데이터 약 15분 지연 ·
            {data?.meta.exchangeName ? ` ${data.meta.exchangeName}` : ""}
          </footer>
        </div>
      </div>
    </div>
  );
}
