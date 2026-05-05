import { TrendingDown, TrendingUp } from "lucide-react";
import {
  getSectorChange,
  type Sector,
  type SectorHorizon,
} from "@/lib/mock-data/sectors";
import { formatChange, getMarketLabel } from "@/lib/heatmap-color";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  sectors: Sector[];
  horizon: SectorHorizon;
};

const HORIZON_HEADING: Record<SectorHorizon, { up: string; down: string }> = {
  "1d": { up: "오늘의 강세 TOP 3", down: "오늘의 약세 TOP 3" },
  "1w": { up: "1주 강세 TOP 3", down: "1주 약세 TOP 3" },
  "1m": { up: "1개월 강세 TOP 3", down: "1개월 약세 TOP 3" },
};

function pickTop(
  sectors: Sector[],
  direction: "up" | "down",
  horizon: SectorHorizon,
): Sector[] {
  const sorted = [...sectors].sort((a, b) => {
    const av = getSectorChange(a, horizon);
    const bv = getSectorChange(b, horizon);
    return direction === "up" ? bv - av : av - bv;
  });
  return sorted.slice(0, 3);
}

function MoverCard({
  title,
  icon: Icon,
  sectors,
  accent,
  horizon,
}: {
  title: string;
  icon: typeof TrendingUp;
  sectors: Sector[];
  accent: "up" | "down";
  horizon: SectorHorizon;
}) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground md:text-sm">
          <Icon
            className={cn(
              "h-5 w-5 md:h-4 md:w-4",
              accent === "up" ? "text-rose-500" : "text-blue-500",
            )}
          />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sectors.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-3 md:py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground tabular-nums md:text-xs">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold md:text-sm">
                  {s.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground md:text-[11px]">
                  {getMarketLabel(s.market)}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 text-base font-bold tabular-nums md:text-sm",
                accent === "up" ? "text-rose-600" : "text-blue-600",
              )}
            >
              {formatChange(getSectorChange(s, horizon))}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function HighlightStrip({ sectors, horizon }: Props) {
  const gainers = pickTop(sectors, "up", horizon);
  const losers = pickTop(sectors, "down", horizon);
  const headings = HORIZON_HEADING[horizon];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MoverCard
        title={headings.up}
        icon={TrendingUp}
        sectors={gainers}
        accent="up"
        horizon={horizon}
      />
      <MoverCard
        title={headings.down}
        icon={TrendingDown}
        sectors={losers}
        accent="down"
        horizon={horizon}
      />
    </div>
  );
}
