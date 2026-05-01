"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import { SECTOR_COLORS } from "@/lib/mock-data/holdings";
import {
  formatKRW,
  formatPct,
  type SectorBreakdown,
} from "@/lib/portfolio-analysis";
import { ClientOnly } from "@/components/layout/client-only";

type Props = {
  breakdown: SectorBreakdown[];
  totalAmount: number;
};

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const datum = payload[0].payload as SectorBreakdown;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-semibold">{datum.sector}</p>
      <p className="mt-0.5 text-muted-foreground">
        {formatPct(datum.weight)} · {formatKRW(datum.amount)}원
      </p>
    </div>
  );
}

export function SectorDonut({ breakdown, totalAmount }: Props) {
  if (breakdown.length === 0 || totalAmount === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">
          종목을 추가하면 섹터 비중이 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-72 md:h-80">
        <ClientOnly
          fallback={
            <div className="h-full w-full animate-pulse rounded-full bg-muted/30" />
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="amount"
                nameKey="sector"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={1.5}
                isAnimationActive={false}
              >
                {breakdown.map((b) => (
                  <Cell
                    key={b.sector}
                    fill={SECTOR_COLORS[b.sector] ?? "#94a3b8"}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </ClientOnly>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground md:text-sm">총 투자금</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight md:text-3xl">
            {formatKRW(totalAmount)}원
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-1 lg:grid-cols-2">
        {breakdown.map((b) => (
          <li key={b.sector} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{
                backgroundColor: SECTOR_COLORS[b.sector] ?? "#94a3b8",
              }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-sm">{b.sector}</span>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatPct(b.weight)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
