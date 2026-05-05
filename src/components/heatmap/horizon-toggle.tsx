"use client";

import type { SectorHorizon } from "@/lib/mock-data/sectors";
import { cn } from "@/lib/utils";

const OPTIONS: { value: SectorHorizon; label: string; sub: string }[] = [
  { value: "1d", label: "1일", sub: "오늘" },
  { value: "1w", label: "1주", sub: "5거래일" },
  { value: "1m", label: "1개월", sub: "21거래일" },
];

type Props = {
  value: SectorHorizon;
  onChange: (next: SectorHorizon) => void;
};

export function HorizonToggle({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="기간 선택"
      className="inline-flex w-full max-w-sm rounded-2xl bg-muted p-1 shadow-inner md:w-auto"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-sm font-medium leading-tight transition-colors md:px-4 md:text-sm",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{opt.label}</span>
            <span className="ml-1 text-[10px] text-muted-foreground/80 md:text-[11px]">
              {opt.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
