"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdBanner } from "@/components/ads/ad-banner";
import { usePortfolioStore } from "@/lib/store/portfolio-store";
import { analyzePortfolio } from "@/lib/portfolio-analysis";
import { HoldingForm } from "./holding-form";
import { HoldingList } from "./holding-list";
import { SectorDonut } from "./sector-donut";
import { RiskBanner } from "./risk-banner";

export function OverlapAnalyzer() {
  const hasHydrated = usePortfolioStore((s) => s.hasHydrated);
  const holdings = usePortfolioStore((s) => s.holdings);

  const analysis = useMemo(() => analyzePortfolio(holdings), [holdings]);

  if (!hasHydrated) {
    return (
      <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <RiskBanner
        topSector={analysis.topSector}
        totalAmount={analysis.totalAmount}
      />

      <AdBanner variant="inline" slot="overlap-infeed" />

      <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-base">
              내 포트폴리오 입력
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <HoldingForm />
            <HoldingList holdings={holdings} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-base">
              섹터별 비중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SectorDonut
              breakdown={analysis.breakdown}
              totalAmount={analysis.totalAmount}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
