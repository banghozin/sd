"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { simulateFire, type FireParams } from "@/lib/fire-calculation";
import { FireForm } from "./fire-form";
import { FireChart } from "./fire-chart";
import { FireHeadline } from "./fire-headline";

const DEFAULT_PARAMS: FireParams = {
  currentAge: 30,
  retirementAge: 55,
  seedKRW: 10_000_000,
  monthlyKRW: 500_000,
  dividendRate: 0.04,
  market: "US",
};

export function FireSimulator() {
  const [params, setParams] = useState<FireParams>(DEFAULT_PARAMS);

  const handleChange = (next: FireParams) => {
    if (next.retirementAge < next.currentAge) {
      next = { ...next, retirementAge: next.currentAge };
    }
    setParams(next);
  };

  const result = useMemo(() => simulateFire(params), [params]);

  return (
    <div className="grid gap-6 md:gap-8 md:grid-cols-2">
      {/* 좌측: 입력 폼 */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg md:text-base">시뮬레이션 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <FireForm params={params} onChange={handleChange} />
        </CardContent>
      </Card>

      {/* 우측: 결과 헤드라인 + 차트 */}
      <div className="flex flex-col gap-6 md:gap-8">
        <FireHeadline result={result} />

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-base">
              스노우볼 그래프
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FireChart series={result.series} />
            <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground md:text-sm">
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" />
                내가 넣은 원금
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                누적 세후 배당금 (재투자)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
