import type { Metadata } from "next";
import { LineChart } from "lucide-react";
import { BacktestView } from "@/components/backtest/backtest-view";

export const metadata: Metadata = {
  title: "시그널 백테스트 — 조용한 매집 수익률 검증",
  description:
    "감지된 시그널의 +1일 / +1주 / +1개월 후 수익률을 자동 계산. RVol 강도별 · 감지 시간대별 통계로 시그널의 통계적 신뢰도를 자동 검증합니다.",
  alternates: { canonical: "/backtest" },
};

export default function BacktestPage() {
  return (
    <article className="flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <LineChart className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            시그널 백테스트
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            과거에 잡힌 시그널 종목들의 이후 수익률 통계
          </p>
        </div>
      </header>

      <BacktestView />

      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground md:p-6 md:text-sm">
        <p>
          <strong className="text-foreground/80">방법론</strong> · 조용한 매집
          시그널이 잡힌 시점의 가격을 기록하고, 현재 가격과 비교하여 수익률을
          계산합니다. 한 종목이 여러 번 잡혔다면 가장 최근 시점을 기준으로
          합니다.
        </p>
        <p>
          <strong className="text-foreground/80">한계</strong> · 시그널 발생
          후 매수했다고 가정한 단순 보유 수익률입니다. 실제 매매 시 슬리피지,
          거래 수수료, 매도 타이밍은 반영되지 않습니다.
        </p>
        <p>
          <strong className="text-foreground/80">데이터 누적</strong> · 매일
          자동으로 시그널이 기록되며 90일까지 보관됩니다. 30일 이상 누적되면
          의미 있는 통계가 됩니다.
        </p>
      </section>
    </article>
  );
}
