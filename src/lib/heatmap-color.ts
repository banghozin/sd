import type { Market } from "./mock-data/sectors";

const RED_BUCKETS = [
  "bg-red-50 text-red-700 border-red-100",
  "bg-red-100 text-red-700 border-red-200",
  "bg-red-300 text-red-900 border-red-400",
  "bg-red-500 text-white border-red-600",
  "bg-red-700 text-white border-red-800",
];

const BLUE_BUCKETS = [
  "bg-blue-50 text-blue-700 border-blue-100",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-blue-300 text-blue-900 border-blue-400",
  "bg-blue-500 text-white border-blue-600",
  "bg-blue-700 text-white border-blue-800",
];

const GREEN_BUCKETS = [
  "bg-emerald-50 text-emerald-700 border-emerald-100",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-emerald-300 text-emerald-900 border-emerald-400",
  "bg-emerald-500 text-white border-emerald-600",
  "bg-emerald-700 text-white border-emerald-800",
];

const NEUTRAL =
  "bg-muted text-muted-foreground border-border";

function bucketIndex(absChange: number): number {
  if (absChange < 0.3) return 0;
  if (absChange < 1) return 1;
  if (absChange < 2.5) return 2;
  if (absChange < 5) return 3;
  return 4;
}

export function getHeatmapClasses(changePct: number, market: Market): string {
  if (Math.abs(changePct) < 0.05) return NEUTRAL;
  const bucket = bucketIndex(Math.abs(changePct));

  if (changePct > 0) {
    return market === "KR" ? RED_BUCKETS[bucket] : GREEN_BUCKETS[bucket];
  }
  return market === "KR" ? BLUE_BUCKETS[bucket] : RED_BUCKETS[bucket];
}

export function getMarketLabel(market: Market): string {
  return market === "KR" ? "🇰🇷 한국" : "🇺🇸 미국";
}

export function formatChange(changePct: number): string {
  const sign = changePct > 0 ? "+" : "";
  return `${sign}${changePct.toFixed(2)}%`;
}
