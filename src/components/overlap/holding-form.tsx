"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findTicker, getKnownTickers } from "@/lib/mock-data/holdings";
import { usePortfolioStore } from "@/lib/store/portfolio-store";
import { cn } from "@/lib/utils";

const QUICK_PICKS = [
  "QQQ",
  "SPY",
  "VOO",
  "SCHD",
  "삼성전자",
  "TIGER 미국S&P500",
  "TSLA",
  "NVDA",
];

export function HoldingForm() {
  const add = usePortfolioStore((s) => s.add);
  const [ticker, setTicker] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const matched = useMemo(() => {
    const q = ticker.trim().toUpperCase();
    if (!q) return [];
    return getKnownTickers()
      .filter(
        (t) =>
          t.ticker.toUpperCase().includes(q) || t.name.toUpperCase().includes(q),
      )
      .slice(0, 5);
  }, [ticker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ticker.trim();
    const num = Number(amount.replace(/,/g, ""));

    if (!trimmed) {
      setError("종목명을 입력해주세요");
      return;
    }
    if (!Number.isFinite(num) || num <= 0) {
      setError("0보다 큰 금액을 입력해주세요");
      return;
    }
    if (!findTicker(trimmed)) {
      setError(
        `'${trimmed}'은(는) 등록되지 않은 종목입니다. 추천 목록에서 선택해주세요.`,
      );
      return;
    }

    add(trimmed, num);
    setTicker("");
    setAmount("");
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ticker" className="text-base font-medium md:text-sm">
          종목명 또는 티커
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="ticker"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value);
              setError(null);
            }}
            placeholder="예: QQQ, 삼성전자, TIGER 미국S&P500"
            className="h-12 pl-10 text-base md:h-11 md:text-sm"
            autoComplete="off"
          />
          {matched.length > 0 && ticker && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
              {matched.map((t) => (
                <li key={t.ticker}>
                  <button
                    type="button"
                    onClick={() => setTicker(t.ticker)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent"
                  >
                    <span className="font-medium">{t.ticker}</span>
                    <span className="ml-2 truncate text-xs text-muted-foreground">
                      {t.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount" className="text-base font-medium md:text-sm">
          투자 금액 (원)
        </Label>
        <Input
          id="amount"
          inputMode="numeric"
          value={amount}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/[^\d]/g, "");
            setAmount(onlyNums ? Number(onlyNums).toLocaleString("ko-KR") : "");
            setError(null);
          }}
          placeholder="예: 1,000,000"
          className="h-12 text-base md:h-11 md:text-sm"
        />
      </div>

      {error && (
        <p
          className={cn(
            "rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700",
            "dark:bg-rose-950/40 dark:text-rose-300",
          )}
          role="alert"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-xl text-base font-semibold md:h-11 md:text-sm"
      >
        <Plus className="h-5 w-5" />
        포트폴리오에 추가
      </Button>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          빠른 선택
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PICKS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTicker(t);
                setError(null);
              }}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
