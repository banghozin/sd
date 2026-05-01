"use client";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FireParams } from "@/lib/fire-calculation";
import { MarketTab } from "./market-tab";

type Props = {
  params: FireParams;
  onChange: (next: FireParams) => void;
};

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function parseNumber(s: string): number {
  const n = Number(s.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function pickValue(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : (v as number);
}

export function FireForm({ params, onChange }: Props) {
  const set = (patch: Partial<FireParams>) => onChange({ ...params, ...patch });

  return (
    <div className="flex flex-col gap-7 md:gap-6">
      <MarketTab
        value={params.market}
        onChange={(market) => set({ market })}
      />

      {/* 현재 나이 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label className="text-base font-medium md:text-sm">현재 나이</Label>
          <span className="text-2xl font-bold tabular-nums tracking-tight md:text-xl">
            {params.currentAge}
            <span className="ml-0.5 text-base font-medium text-muted-foreground">
              세
            </span>
          </span>
        </div>
        <Slider
          value={[params.currentAge]}
          min={18}
          max={70}
          step={1}
          onValueChange={(v) => set({ currentAge: pickValue(v) })}
        />
      </div>

      {/* 목표 은퇴 나이 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label className="text-base font-medium md:text-sm">
            목표 은퇴 나이
          </Label>
          <span className="text-2xl font-bold tabular-nums tracking-tight md:text-xl">
            {params.retirementAge}
            <span className="ml-0.5 text-base font-medium text-muted-foreground">
              세
            </span>
          </span>
        </div>
        <Slider
          value={[params.retirementAge]}
          min={Math.max(params.currentAge, 25)}
          max={85}
          step={1}
          onValueChange={(v) => set({ retirementAge: pickValue(v) })}
        />
      </div>

      {/* 시드머니 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label
            htmlFor="seed"
            className="text-base font-medium md:text-sm"
          >
            현재 시드머니
          </Label>
          <span className="text-sm text-muted-foreground">원</span>
        </div>
        <Input
          id="seed"
          inputMode="numeric"
          value={formatNumber(params.seedKRW)}
          onChange={(e) => set({ seedKRW: parseNumber(e.target.value) })}
          className="h-12 text-base tabular-nums md:h-11 md:text-sm"
        />
        <Slider
          value={[params.seedKRW]}
          min={0}
          max={500_000_000}
          step={1_000_000}
          onValueChange={(v) => set({ seedKRW: pickValue(v) })}
        />
      </div>

      {/* 매월 추가 투자금 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label
            htmlFor="monthly"
            className="text-base font-medium md:text-sm"
          >
            매월 추가 투자금
          </Label>
          <span className="text-sm text-muted-foreground">원</span>
        </div>
        <Input
          id="monthly"
          inputMode="numeric"
          value={formatNumber(params.monthlyKRW)}
          onChange={(e) => set({ monthlyKRW: parseNumber(e.target.value) })}
          className="h-12 text-base tabular-nums md:h-11 md:text-sm"
        />
        <Slider
          value={[params.monthlyKRW]}
          min={0}
          max={5_000_000}
          step={50_000}
          onValueChange={(v) => set({ monthlyKRW: pickValue(v) })}
        />
      </div>

      {/* 배당률 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label className="text-base font-medium md:text-sm">
            예상 연평균 배당률
          </Label>
          <span className="text-2xl font-bold tabular-nums tracking-tight md:text-xl">
            {(params.dividendRate * 100).toFixed(1)}
            <span className="ml-0.5 text-base font-medium text-muted-foreground">
              %
            </span>
          </span>
        </div>
        <Slider
          value={[Math.round(params.dividendRate * 1000)]}
          min={10}
          max={120}
          step={1}
          onValueChange={(v) => set({ dividendRate: pickValue(v) / 1000 })}
        />
        <p className="text-xs text-muted-foreground">
          참고 · SCHD ~3.5%, JEPI ~7%, 배당주 평균 4~5%
        </p>
      </div>
    </div>
  );
}
