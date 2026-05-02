"use client";

import { Star } from "lucide-react";
import {
  useWatchlistStore,
  type WatchlistKind,
} from "@/lib/store/watchlist-store";
import { cn } from "@/lib/utils";

type Props = {
  kind: WatchlistKind;
  ticker: string;
  name: string;
  size?: "sm" | "md";
  className?: string;
};

export function StarButton({
  kind,
  ticker,
  name,
  size = "sm",
  className,
}: Props) {
  const has = useWatchlistStore((s) => s.has(kind, ticker));
  const hydrated = useWatchlistStore((s) => s.hasHydrated);
  const toggle = useWatchlistStore((s) => s.toggle);

  const dim = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      aria-label={has ? "워치리스트에서 제거" : "워치리스트에 추가"}
      aria-pressed={has}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({ kind, ticker, name });
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-amber-500",
        has && "text-amber-500",
        !hydrated && "opacity-50",
        className,
      )}
    >
      <Star
        className={cn(dim, has && "fill-current")}
        strokeWidth={has ? 2 : 1.8}
      />
    </button>
  );
}
