import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { NewsFeed } from "@/components/news/news-feed";

export const metadata: Metadata = {
  title: "실시간 뉴스 채집기 | StocksNet",
  description:
    "미국 정치·경제·암호화폐 헤드라인을 60초마다 자동으로 수집해 보여드립니다. CNN · Politico · Fox · Guardian · MarketWatch · CNBC · CoinDesk · Cointelegraph · Decrypt 외.",
};

export default function NewsPage() {
  return (
    <article className="flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <Radio className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            실시간 뉴스 채집기
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            미국 정치·경제·암호화폐 헤드라인 — 60초마다 자동 갱신
          </p>
        </div>
      </header>

      <NewsFeed />

      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground md:p-6 md:text-sm">
        <p>
          <strong className="text-foreground/80">출처</strong> · CNN · Politico ·
          Fox News · The Guardian · MarketWatch · CNBC · CoinDesk · Cointelegraph
          · Decrypt
        </p>
        <p>
          <strong className="text-foreground/80">표시 기준</strong> · 미국 동부
          시간(ET) 기준 오늘의 기사만 표시. 자정이 지나면 자동으로 새 날짜로
          전환됩니다. 새 기사가 아직 없는 시간대에는 어제(ET) 기사를 표시합니다.
        </p>
        <p>
          헤드라인을 클릭하면 원문 사이트가 새 탭으로 열립니다. 본 페이지는 외부
          미디어의 콘텐츠를 인덱싱·전재하지 않습니다.
        </p>
      </section>
    </article>
  );
}
