"use client";

import { useMemo, useState } from "react";
import { ALL_SECTORS, KR_SECTORS, US_SECTORS } from "@/lib/mock-data/sectors";
import { AdBanner } from "@/components/ads/ad-banner";
import { MarketToggle, type MarketFilter } from "./market-toggle";
import { SectorCard } from "./sector-card";
import { HighlightStrip } from "./highlight-strip";

const LEGEND = [
  { label: "한국 상승", className: "bg-red-500" },
  { label: "한국 하락", className: "bg-blue-500" },
  { label: "미국 상승", className: "bg-emerald-500" },
  { label: "미국 하락", className: "bg-red-500" },
];

export function HeatmapSection() {
  const [filter, setFilter] = useState<MarketFilter>("ALL");

  const sectors = useMemo(() => {
    const list =
      filter === "KR" ? KR_SECTORS : filter === "US" ? US_SECTORS : ALL_SECTORS;
    return [...list].sort((a, b) => b.changePct - a.changePct);
  }, [filter]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <MarketToggle value={filter} onChange={setFilter} />
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground md:text-xs">
          {LEGEND.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${l.className}`}
              />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <HighlightStrip sectors={sectors} />

      <AdBanner variant="inline" slot="sector-map-infeed" />

      <section aria-label="섹터 히트맵">
        <header className="mb-3 flex items-baseline justify-between md:mb-4">
          <h3 className="text-base font-semibold text-muted-foreground md:text-base">
            전체 섹터 ({sectors.length})
          </h3>
          <p className="text-xs text-muted-foreground md:text-xs">
            등락률 높은 순
          </p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {sectors.map((s) => (
            <SectorCard key={s.id} sector={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
