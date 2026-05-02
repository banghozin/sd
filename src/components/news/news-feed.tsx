"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Newspaper, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type NewsCategory = "politics" | "economy" | "crypto";

type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  category: NewsCategory;
};

type NewsResponse = {
  items: NewsItem[];
  fetchedAt: string;
};

const POLL_INTERVAL_MS = 60_000;

const CATEGORY_LABELS: Record<NewsCategory | "all", string> = {
  all: "ALL",
  politics: "Politics",
  economy: "Economy",
  crypto: "Crypto",
};

const CATEGORY_BADGE_COLORS: Record<NewsCategory, string> = {
  politics: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  economy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  crypto: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

// Format a date as US Eastern day-stamp (e.g. "05/02/2026") to compare days
const ET_DAY = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getETDayString(d: Date): string {
  return ET_DAY.format(d);
}

function getTodayETString(): string {
  return getETDayString(new Date());
}

function getYesterdayETString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getETDayString(d);
}

function filterByETDay(items: NewsItem[], dayStr: string): NewsItem[] {
  return items.filter((it) => {
    try {
      return getETDayString(new Date(it.pubDate)) === dayStr;
    } catch {
      return false;
    }
  });
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [filter, setFilter] = useState<NewsCategory | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showingYesterday, setShowingYesterday] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const newIds = useRef<Set<string>>(new Set());

  const loadNews = useCallback(async () => {
    try {
      const r = await fetch("/api/news", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as NewsResponse;
      setError(false);
      setFetchedAt(data.fetchedAt);
      setItems((prev) => {
        if (prev.length === 0) {
          for (const it of data.items) seenIds.current.add(it.id);
          return data.items;
        }
        const newOnes = data.items.filter(
          (it) => !seenIds.current.has(it.id),
        );
        for (const it of newOnes) {
          seenIds.current.add(it.id);
          newIds.current.add(it.id);
        }
        // Keep order: newest articles (by pubDate) at the top
        const merged = [...newOnes, ...prev];
        merged.sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
        // Cap memory usage
        return merged.slice(0, 400);
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (id !== null) return;
      loadNews();
      id = setInterval(loadNews, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };

    if (document.visibilityState === "visible") start();

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [loadNews]);

  // Re-render every 30s so relative timestamps stay fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Clear "new" highlight after 5 seconds
  useEffect(() => {
    if (newIds.current.size === 0) return;
    const t = setTimeout(() => {
      newIds.current.clear();
      setTick((x) => x + 1);
    }, 5000);
    return () => clearTimeout(t);
  }, [items]);

  const todayET = getTodayETString();
  const yesterdayET = getYesterdayETString();

  const filteredByDay = useMemo(() => {
    const todayItems = filterByETDay(items, todayET);
    if (todayItems.length > 0) {
      return { items: todayItems, isYesterday: false };
    }
    const yesterdayItems = filterByETDay(items, yesterdayET);
    return { items: yesterdayItems, isYesterday: true };
  }, [items, todayET, yesterdayET]);

  // Track yesterday-fallback state for badge
  useEffect(() => {
    setShowingYesterday(filteredByDay.isYesterday);
  }, [filteredByDay.isYesterday]);

  const filteredByCategory = useMemo(() => {
    if (filter === "all") return filteredByDay.items;
    return filteredByDay.items.filter((it) => it.category === filter);
  }, [filteredByDay.items, filter]);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <RefreshCw
              className={cn(
                "h-3 w-3",
                loading && "animate-spin text-primary",
              )}
            />
            {error
              ? "갱신 실패 — 60초 뒤 재시도"
              : fetchedAt
                ? `${formatRelative(fetchedAt)} 갱신`
                : "갱신 중..."}
          </div>
          <p className="text-sm font-medium md:text-base">
            {showingYesterday
              ? "오늘 새 기사가 아직 없어 어제 기사를 표시하고 있어요"
              : `오늘(미국 ET 기준)의 헤드라인 ${filteredByCategory.length}건`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "politics", "economy", "crypto"] as const).map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors md:text-sm",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {CATEGORY_LABELS[c]}
              </button>
            );
          })}
        </div>
      </section>

      {showingYesterday && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-foreground/85">
            오늘 분 뉴스가 아직 수집되지 않았습니다. 어제 (미국 ET 기준) 뉴스를
            보여드립니다.
          </span>
        </div>
      )}

      {filteredByCategory.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <Newspaper className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-base font-medium">
            {loading ? "뉴스를 불러오는 중..." : "표시할 뉴스가 없어요"}
          </p>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              잠시 후 자동으로 새로고침됩니다.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredByCategory.map((it) => {
            const isNew = newIds.current.has(it.id);
            return (
              <a
                key={it.id}
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex flex-col gap-2 rounded-2xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm md:p-5",
                  isNew
                    ? "animate-in fade-in slide-in-from-top-2 duration-500 border-primary/40 ring-1 ring-primary/20"
                    : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold leading-snug text-foreground/95 group-hover:text-primary md:text-lg">
                    {it.title}
                  </h3>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-primary" />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:text-sm">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider md:text-xs",
                      CATEGORY_BADGE_COLORS[it.category],
                    )}
                  >
                    {it.category}
                  </span>
                  <span className="truncate">{it.source}</span>
                  <span aria-hidden>·</span>
                  <span>{formatRelative(it.pubDate)}</span>
                  {isNew && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      NEW
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
