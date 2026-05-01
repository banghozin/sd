import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import type { Sector } from "@/lib/mock-data/sectors";
import {
  formatChange,
  getHeatmapClasses,
  getMarketLabel,
} from "@/lib/heatmap-color";
import { cn } from "@/lib/utils";

type Props = {
  sector: Sector;
};

export function SectorCard({ sector }: Props) {
  const heatmap = getHeatmapClasses(sector.changePct, sector.market);
  const isUp = sector.changePct > 0.05;
  const isDown = sector.changePct < -0.05;
  const TrendIcon = isUp ? ArrowUp : isDown ? ArrowDown : ArrowRight;

  return (
    <article
      className={cn(
        "relative flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-sm transition-all",
        "min-h-[160px] md:min-h-[170px]",
        "hover:shadow-md hover:-translate-y-0.5",
        heatmap,
      )}
      aria-label={`${getMarketLabel(sector.market)} ${sector.name} 섹터 ${formatChange(sector.changePct)}`}
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
          {formatChange(sector.changePct)}
        </p>
        <p className="mt-1.5 truncate text-xs opacity-80 md:text-xs">
          {sector.topTickers.join(" · ")}
        </p>
      </div>
    </article>
  );
}
