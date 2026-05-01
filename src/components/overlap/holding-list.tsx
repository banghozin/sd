"use client";

import { Trash2, Wallet } from "lucide-react";
import { findTicker } from "@/lib/mock-data/holdings";
import { usePortfolioStore, type Holding } from "@/lib/store/portfolio-store";
import { formatKRW } from "@/lib/portfolio-analysis";

type Props = {
  holdings: Holding[];
};

export function HoldingList({ holdings }: Props) {
  const remove = usePortfolioStore((s) => s.remove);
  const clear = usePortfolioStore((s) => s.clear);
  const seedSample = usePortfolioStore((s) => s.seedSample);

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
        <Wallet className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          아직 보유 종목이 없어요.
          <br />
          위에서 추가하거나 샘플로 시작해보세요.
        </p>
        <button
          type="button"
          onClick={seedSample}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          샘플 포트폴리오 불러오기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          보유 종목 ({holdings.length})
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          모두 삭제
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {holdings.map((h) => {
          const info = findTicker(h.ticker);
          return (
            <li
              key={h.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold md:text-sm">
                  {h.ticker}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {info ? info.name : "등록되지 않은 종목"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold tabular-nums md:text-sm">
                  {formatKRW(h.amount)}원
                </span>
                <button
                  type="button"
                  onClick={() => remove(h.id)}
                  aria-label={`${h.ticker} 삭제`}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
