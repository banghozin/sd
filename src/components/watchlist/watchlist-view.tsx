"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star, Trash2, ExternalLink } from "lucide-react";
import {
  useWatchlistStore,
  type WatchlistItem,
} from "@/lib/store/watchlist-store";
import { useChartModalStore } from "@/lib/store/chart-modal-store";
import { cn } from "@/lib/utils";

type Quote = {
  ticker: string;
  price: number | null;
  changePct: number | null;
  source: "yahoo" | "missing";
};

type QuotesResponse = {
  quotes: Record<string, Quote>;
  fetchedAt?: string;
};

const KIND_LABEL: Record<WatchlistItem["kind"], string> = {
  "us-stock": "🇺🇸 종목",
  "us-etf": "🇺🇸 ETF",
  "kr-stock": "🇰🇷 종목",
  "kr-etf": "🇰🇷 ETF",
  fund: "헤지펀드",
};

function isLivePriced(kind: WatchlistItem["kind"]): boolean {
  return kind === "us-stock" || kind === "us-etf";
}

export function WatchlistView() {
  const items = useWatchlistStore((s) => s.items);
  const hydrated = useWatchlistStore((s) => s.hasHydrated);
  const remove = useWatchlistStore((s) => s.remove);
  const openChart = useChartModalStore((s) => s.open);

  const liveTickers = useMemo(
    () =>
      items
        .filter((it) => isLivePriced(it.kind))
        .map((it) => it.ticker.toUpperCase()),
    [items],
  );

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (liveTickers.length === 0) {
      setQuotes({});
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingQuotes(true);
        const r = await fetch(
          `/api/watchlist-status?tickers=${encodeURIComponent(liveTickers.join(","))}`,
          { cache: "no-store" },
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as QuotesResponse;
        if (!cancelled) setQuotes(data.quotes ?? {});
      } catch {
        /* leave previous quotes in place */
      } finally {
        if (!cancelled) setLoadingQuotes(false);
      }
    };
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [liveTickers.join(","), hydrated]);

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <Star className="h-10 w-10 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">아직 별표한 종목이 없어요</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          다른 페이지에서 마음에 드는 종목 옆의 ⭐ 별 아이콘을 누르면 여기 모입니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link
            href="/unusual-volume"
            className="rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            조용한 매집 →
          </Link>
          <Link
            href="/smart-money"
            className="rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            스마트 머니 →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length}개 종목 · 미국 종목 가격은 60초마다 자동 갱신
          {loadingQuotes && " (갱신 중...)"}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((it) => {
          const live = isLivePriced(it.kind)
            ? quotes[it.ticker.toUpperCase()]
            : null;
          const livePriced = isLivePriced(it.kind);
          return (
            <li
              key={it.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between md:p-5"
            >
              <button
                type="button"
                disabled={!livePriced}
                onClick={() => livePriced && openChart(it.ticker, it.name)}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 -m-1 text-left",
                  livePriced && "transition-colors hover:bg-muted/40",
                )}
              >
                <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold">
                      {it.ticker}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {KIND_LABEL[it.kind]}
                    </span>
                  </div>
                  {it.name && it.name !== it.ticker && (
                    <p className="truncate text-xs text-muted-foreground md:text-sm">
                      {it.name}
                    </p>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-4">
                {live && live.price !== null ? (
                  <div className="text-right">
                    <p className="font-mono text-lg font-semibold tabular-nums">
                      ${live.price.toFixed(2)}
                    </p>
                    {live.changePct !== null && (
                      <p
                        className={cn(
                          "text-sm font-medium tabular-nums",
                          live.changePct > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : live.changePct < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-muted-foreground",
                        )}
                      >
                        {live.changePct > 0 ? "+" : ""}
                        {live.changePct.toFixed(2)}%
                      </p>
                    )}
                  </div>
                ) : isLivePriced(it.kind) ? (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                ) : null}

                {isLivePriced(it.kind) && (
                  <a
                    href={`https://finance.yahoo.com/quote/${encodeURIComponent(it.ticker)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`${it.ticker} Yahoo Finance에서 보기`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                  aria-label="워치리스트에서 제거"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
