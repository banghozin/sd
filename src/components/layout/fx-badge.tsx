import { TrendingUp } from "lucide-react";
import fxData from "@/data/fx.json";

export function FxBadge() {
  const rate = fxData.rate;
  const asOf = fxData.asOf;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs shadow-sm md:text-sm">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="h-3 w-3" />
      </span>
      <span className="font-medium text-muted-foreground">USD/KRW</span>
      <span className="font-bold tabular-nums">
        {rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원
      </span>
      <span className="text-[10px] text-muted-foreground tabular-nums md:text-xs">
        {asOf} · ECB
      </span>
    </div>
  );
}
