"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import type { FireYearPoint } from "@/lib/fire-calculation";
import { formatKRWLong, formatKRWShort } from "@/lib/fire-calculation";

type Props = {
  series: FireYearPoint[];
};

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload as FireYearPoint;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2.5 text-sm shadow-md">
      <p className="font-semibold">{label}세</p>
      <div className="mt-1 space-y-0.5">
        <p className="flex items-center justify-between gap-3 text-cyan-600">
          <span>내가 넣은 원금</span>
          <span className="tabular-nums">
            {formatKRWLong(point.invested)}
          </span>
        </p>
        <p className="flex items-center justify-between gap-3 text-rose-600">
          <span>누적 세후 배당금</span>
          <span className="tabular-nums">
            {formatKRWLong(point.dividends)}
          </span>
        </p>
        <p className="mt-1 flex items-center justify-between gap-3 border-t border-border pt-1 font-semibold">
          <span>총 자산</span>
          <span className="tabular-nums">{formatKRWLong(point.total)}</span>
        </p>
      </div>
    </div>
  );
}

export function FireChart({ series }: Props) {
  return (
    <div className="h-72 w-full md:h-80 lg:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 10, right: 8, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="grad-invested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="grad-dividends" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.75} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="age"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v) => `${v}세`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v) => formatKRWShort(v)}
            width={60}
          />
          <Tooltip content={ChartTooltip} />
          <Area
            type="monotone"
            dataKey="invested"
            stackId="1"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#grad-invested)"
            name="원금"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="dividends"
            stackId="1"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#grad-dividends)"
            name="누적 배당금"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
