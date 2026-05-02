import type { Metadata } from "next";
import { Star } from "lucide-react";
import { WatchlistView } from "@/components/watchlist/watchlist-view";

export const metadata: Metadata = {
  title: "워치리스트 | StocksNet",
  description:
    "관심 종목을 별표로 모아 한눈에 봅니다. 미국 종목은 60초마다 자동 갱신되는 실시간 가격이 표시됩니다.",
};

export default function WatchlistPage() {
  return (
    <article className="flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 md:h-12 md:w-12">
          <Star className="h-5 w-5 fill-current md:h-6 md:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            워치리스트
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            관심 종목 모음 — 별표한 종목이 여기 모입니다
          </p>
        </div>
      </header>

      <WatchlistView />
    </article>
  );
}
