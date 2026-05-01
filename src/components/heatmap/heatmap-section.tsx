"use client";

import { useMemo, useState } from "react";
import {
  ALL_SECTORS as MOCK_ALL,
  KR_SECTORS as MOCK_KR,
  US_SECTORS as MOCK_US,
  type Sector,
} from "@/lib/mock-data/sectors";
import liveSectors from "@/data/sectors.json";
import { AdBanner } from "@/components/ads/ad-banner";
import { MarketToggle, type MarketFilter } from "./market-toggle";
import { SectorCard } from "./sector-card";
import { HighlightStrip } from "./highlight-strip";

const liveList = (liveSectors.sectors ?? []) as Sector[];
const IS_LIVE = liveList.length > 0;
const ALL_SECTORS = IS_LIVE ? liveList : MOCK_ALL;
const KR_SECTORS = IS_LIVE
  ? liveList.filter((s) => s.market === "KR")
  : MOCK_KR;
const US_SECTORS = IS_LIVE
  ? liveList.filter((s) => s.market === "US")
  : MOCK_US;
const FETCHED_AT_ISO = liveSectors.fetchedAt as string | null;

const LEGEND = [
  { label: "한국 상승", className: "bg-red-500" },
  { label: "한국 하락", className: "bg-blue-500" },
  { label: "미국 상승", className: "bg-emerald-500" },
  { label: "미국 하락", className: "bg-red-500" },
];

function formatFetchedAt(iso: string | null): string {
  if (!iso) return "";
  // Manual UTC → KST conversion to avoid relying on Intl locale data,
  // which can differ between Vercel's Node.js runtime and the user's
  // browser (root cause class for hydration mismatches).
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const kst = new Date(ms + 9 * 60 * 60 * 1000);
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hh = String(kst.getUTCHours()).padStart(2, "0");
  const mm = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${month}월 ${day}일 ${hh}:${mm}`;
}

export function HeatmapSection() {
  const [filter, setFilter] = useState<MarketFilter>("ALL");

  const sectors = useMemo(() => {
    const list =
      filter === "KR" ? KR_SECTORS : filter === "US" ? US_SECTORS : ALL_SECTORS;
    return [...list].sort((a, b) => b.changePct - a.changePct);
  }, [filter]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
        {IS_LIVE ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            LIVE · Yahoo Finance
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            📦 데모 데이터
          </span>
        )}
        <span className="text-muted-foreground">
          {IS_LIVE
            ? `1시간마다 자동 갱신${FETCHED_AT_ISO ? ` · 마지막 ${formatFetchedAt(FETCHED_AT_ISO)}` : ""}`
            : "실데이터는 다음 자동 갱신 시 채워집니다"}
        </span>
      </div>

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
