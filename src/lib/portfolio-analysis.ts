import type { Holding } from "@/lib/store/portfolio-store";
import { findTicker } from "@/lib/mock-data/holdings";

export type SectorBreakdown = {
  sector: string;
  amount: number;
  weight: number;
};

export type PortfolioAnalysis = {
  totalAmount: number;
  breakdown: SectorBreakdown[];
  topSector: SectorBreakdown | null;
  unknownAmount: number;
};

export function analyzePortfolio(holdings: Holding[]): PortfolioAnalysis {
  const sectorAmounts = new Map<string, number>();
  let total = 0;
  let unknown = 0;

  for (const h of holdings) {
    if (h.amount <= 0) continue;
    total += h.amount;
    const info = findTicker(h.ticker);
    if (!info) {
      unknown += h.amount;
      sectorAmounts.set("기타", (sectorAmounts.get("기타") ?? 0) + h.amount);
      continue;
    }
    for (const w of info.weights) {
      const portion = h.amount * w.weight;
      sectorAmounts.set(
        w.sector,
        (sectorAmounts.get(w.sector) ?? 0) + portion,
      );
    }
  }

  const breakdown: SectorBreakdown[] = Array.from(sectorAmounts.entries())
    .map(([sector, amount]) => ({
      sector,
      amount,
      weight: total > 0 ? amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalAmount: total,
    breakdown,
    topSector: breakdown[0] ?? null,
    unknownAmount: unknown,
  };
}

export function formatKRW(amount: number): string {
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(2)}억`;
  }
  if (amount >= 10_000) {
    return `${(amount / 10_000).toFixed(0)}만`;
  }
  return amount.toLocaleString("ko-KR");
}

export function formatPct(weight: number): string {
  return `${(weight * 100).toFixed(1)}%`;
}
