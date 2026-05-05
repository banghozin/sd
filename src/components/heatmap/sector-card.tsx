import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import {
  getSectorChange,
  type Sector,
  type SectorHorizon,
} from "@/lib/mock-data/sectors";
import {
  formatChange,
  getHeatmapClasses,
  getMarketLabel,
} from "@/lib/heatmap-color";
import { cn } from "@/lib/utils";

type Props = {
  sector: Sector;
  horizon: SectorHorizon;
};

const HORIZON_LABEL: Record<SectorHorizon, string> = {
  "1d": "오늘",
  "1w": "1주",
  "1m": "1개월",
};

export function SectorCard({ sector, horizon }: Props) {
  const change = getSectorChange(sector, horizon);
  const heatmap = getHeatmapClasses(change, sector.market);
  const isUp = change > 0.05;
  const isDown = change < -0.05;
  const TrendIcon = isUp ? ArrowUp : isDown ? ArrowDown : ArrowRight;

  return (
    <article
      className={cn(
        "relative flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-sm transition-all",
        "min-h-[160px] md:min-h-[170px]",
        "hover:shadow-md hover:-translate-y-0.5",
        heatmap,
      )}
      aria-label={`${getMarketLabel(sector.market)} ${sector.name} 섹터 ${HORIZON_LABEL[horizon]} ${formatChange(change)}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-80 md:text-xs">
            {getMarketLabel(sector.market)}
          </p>
          <h3 className="mt-1 truncate text-lg font-semibold md:text-lg">
            {sector.name}
          </h3>
        </div>
        <TrendIcon className="h-5 w-5 shrink-0 opacity-90 md:h-5 md:w-5" />
      </header>

      <div>
        <p className="text-3xl font-bold tabular-nums tracking-tight md:text-3xl">
          {formatChange(change)}
        </p>
        <p className="mt-1 text-[11px] opacity-70 md:text-xs">
          {HORIZON_LABEL[horizon]} 기준
        </p>
        <p className="mt-1.5 truncate text-xs opacity-80 md:text-xs">
          {sector.topTickers.join(" · ")}
        </p>
      </div>
    </article>
  );
}
