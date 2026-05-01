"use client";

import { cn } from "@/lib/utils";
import type { Market } from "@/lib/fire-calculation";

const OPTIONS: { value: Market; label: string; sub: string }[] = [
  { value: "KR", label: "🇰🇷 한국 주식", sub: "배당소득세 15.4%" },
  { value: "US", label: "🇺🇸 미국 주식", sub: "원천징수 15%" },
];

type Props = {
  value: Market;
  onChange: (next: Market) => void;
};

export function MarketTab({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="투자 시장"
      className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5"
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
              "flex flex-col items-start gap-0.5 rounded-xl px-4 py-3 text-left transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="text-base font-semibold md:text-sm">
              {opt.label}
            </span>
            <span className="text-xs">{opt.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
