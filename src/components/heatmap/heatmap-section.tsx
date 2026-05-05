"use client";

import { useMemo, useState } from "react";
import {
  ALL_SECTORS as MOCK_ALL,
  KR_SECTORS as MOCK_KR,
  US_SECTORS as MOCK_US,
  getSectorChange,
  type Sector,
  type SectorHorizon,
} from "@/lib/mock-data/sectors";
import liveSectors from "@/data/sectors.json";
import { AdBanner } from "@/components/ads/ad-banner";
import { MarketToggle, type MarketFilter } from "./market-toggle";
import { HorizonToggle } from "./horizon-toggle";
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
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const kst = new Date(ms + 9 * 60 * 60 * 1000);
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hh = String(kst.getUTCHours()).padStart(2, "0");
  const mm = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${month}월 ${day}일 ${hh}:${mm}`;
}

// Detect whether the live data has multi-horizon fields. Old sectors.json
// (pre-multi-horizon migration) only has changePct, so we surface a hint
// until the next cron rebuild populates 1w/1m.
const HAS_HORIZON_DATA = liveList.some(
  (s) => typeof s.changePct1w === "number" || typeof s.changePct1m === "number",
);

export function HeatmapSection() {
  const [market, setMarket] = useState<MarketFilter>("ALL");
  const [horizon, setHorizon] = useState<SectorHorizon>("1d");

  const sectors = useMemo(() => {
    const list =
      market === "KR" ? KR_SECTORS : market === "US" ? US_SECTORS : ALL_SECTORS;
    return [...list].sort(
      (a, b) => getSectorChange(b, horizon) - getSectorChange(a, horizon),
    );
  }, [market, horizon]);

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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <MarketToggle value={market} onChange={setMarket} />
          <HorizonToggle value={horizon} onChange={setHorizon} />
        </div>
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
        {IS_LIVE && !HAS_HORIZON_DATA && horizon !== "1d" && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 md:text-sm">
            1주·1개월 데이터는 다음 cron 실행 후 채워져요. 지금은 1일 등락률을
            그대로 보여드리고 있어요.
          </p>
        )}
      </div>

      <HighlightStrip sectors={sectors} horizon={horizon} />

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
            <SectorCard key={s.id} sector={s} horizon={horizon} />
          ))}
        </div>
      </section>
    </div>
  );
}
