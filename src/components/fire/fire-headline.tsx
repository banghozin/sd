import { Sparkles } from "lucide-react";
import type { FireResult } from "@/lib/fire-calculation";
import { formatKRWLong } from "@/lib/fire-calculation";

type Props = {
  result: FireResult;
};

export function FireHeadline({ result }: Props) {
  if (result.yearsUntilRetirement === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-5 text-center md:p-6">
        <p className="text-base font-medium text-muted-foreground md:text-lg">
          은퇴 나이를 현재 나이보다 크게 설정해보세요 🐢
        </p>
      </div>
    );
  }

  const monthly = formatKRWLong(result.monthlyAfterTaxDividend);
  const total = formatKRWLong(result.finalTotal);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50 to-cyan-50 p-5 dark:from-rose-950/30 dark:via-amber-950/30 dark:to-cyan-950/30 md:p-7">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300 md:text-base">
        <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
        <span>
          {result.yearsUntilRetirement}년 뒤, 매월 세후
        </span>
      </div>

      <p className="mt-3 break-keep text-3xl font-extrabold leading-tight tracking-tight text-rose-600 dark:text-rose-400 md:text-4xl lg:text-5xl">
        {monthly}씩
      </p>
      <p className="mt-1 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl lg:text-4xl">
        통장에 꽂힙니다 💸
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/50 pt-4 md:gap-5">
        <div>
          <p className="text-xs text-muted-foreground md:text-sm">최종 총 자산</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight md:text-xl">
            {total}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground md:text-sm">
            그중 누적 배당금
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-rose-600 dark:text-rose-400 md:text-xl">
            {formatKRWLong(result.totalAfterTaxDividends)}
          </p>
        </div>
      </div>
    </div>
  );
}
