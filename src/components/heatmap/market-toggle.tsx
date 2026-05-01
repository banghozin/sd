"use client";

import { cn } from "@/lib/utils";

export type MarketFilter = "ALL" | "KR" | "US";

const OPTIONS: { value: MarketFilter; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "KR", label: "🇰🇷 한국" },
  { value: "US", label: "🇺🇸 미국" },
];

type Props = {
  value: MarketFilter;
  onChange: (next: MarketFilter) => void;
};

export function MarketToggle({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="시장 선택"
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
              "flex-1 rounded-xl px-4 py-2.5 text-base font-medium transition-colors md:px-5 md:py-2 md:text-sm",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
