import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { SectorBreakdown } from "@/lib/portfolio-analysis";
import { formatPct } from "@/lib/portfolio-analysis";
import { cn } from "@/lib/utils";

type Props = {
  topSector: SectorBreakdown | null;
  totalAmount: number;
};

export function RiskBanner({ topSector, totalAmount }: Props) {
  if (totalAmount === 0 || !topSector) {
    return null;
  }

  const weight = topSector.weight;

  if (weight > 0.5) {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 md:p-5",
          "dark:border-rose-800/60 dark:bg-rose-950/30",
        )}
      >
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600 dark:text-rose-400" />
        <div className="min-w-0">
          <p className="text-base font-bold text-rose-900 dark:text-rose-200 md:text-lg">
            ⚠️ 주의: 특정 산업에 위험이 과도하게 쏠려 있습니다!
          </p>
          <p className="mt-1 text-sm text-rose-800 dark:text-rose-300">
            <span className="font-semibold">{topSector.sector}</span> 비중이{" "}
            <span className="font-semibold tabular-nums">
              {formatPct(weight)}
            </span>
            로 50%를 넘어요. 다른 섹터 ETF나 종목으로 분산을 검토해보세요.
          </p>
        </div>
      </div>
    );
  }

  if (weight > 0.35) {
    return (
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 md:p-5",
          "dark:border-amber-800/60 dark:bg-amber-950/30",
        )}
      >
        <Info className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0">
          <p className="text-base font-bold text-amber-900 dark:text-amber-200 md:text-lg">
            살짝 쏠림 주의
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
            {topSector.sector} 비중이 {formatPct(weight)}로 다소 높아요. 50%를
            넘으면 위험 구간입니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 md:p-5",
        "dark:border-emerald-900/60 dark:bg-emerald-950/30",
      )}
    >
      <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div className="min-w-0">
        <p className="text-base font-bold text-emerald-900 dark:text-emerald-200 md:text-lg">
          분산이 잘 돼 있어요
        </p>
        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
          가장 큰 섹터({topSector.sector}) 비중이 {formatPct(weight)}예요.
          균형 잡힌 포트폴리오입니다.
        </p>
      </div>
    </div>
  );
}
