export type Market = "KR" | "US";

export const TAX_RATE: Record<Market, number> = {
  KR: 0.154,
  US: 0.15,
};

export const FX_USD_KRW = 1350;

export type FireParams = {
  currentAge: number;
  retirementAge: number;
  seedKRW: number;
  monthlyKRW: number;
  dividendRate: number;
  market: Market;
};

export type FireYearPoint = {
  age: number;
  invested: number;
  dividends: number;
  total: number;
};

export type FireResult = {
  yearsUntilRetirement: number;
  finalTotal: number;
  totalInvested: number;
  totalAfterTaxDividends: number;
  monthlyAfterTaxDividend: number;
  series: FireYearPoint[];
  taxRate: number;
};

export function simulateFire(p: FireParams): FireResult {
  const taxRate = TAX_RATE[p.market];
  const annualContribution = Math.max(0, p.monthlyKRW * 12);
  const yearsUntil = Math.max(0, p.retirementAge - p.currentAge);

  let invested = Math.max(0, p.seedKRW);
  let dividendsCum = 0;
  let total = invested;

  const series: FireYearPoint[] = [
    { age: p.currentAge, invested, dividends: 0, total },
  ];

  for (let i = 1; i <= yearsUntil; i++) {
    total += annualContribution;
    invested += annualContribution;

    const gross = total * p.dividendRate;
    const net = gross * (1 - taxRate);
    dividendsCum += net;
    total += net;

    series.push({
      age: p.currentAge + i,
      invested,
      dividends: dividendsCum,
      total,
    });
  }

  const monthlyAfterTaxDividend = (total * p.dividendRate * (1 - taxRate)) / 12;

  return {
    yearsUntilRetirement: yearsUntil,
    finalTotal: total,
    totalInvested: invested,
    totalAfterTaxDividends: dividendsCum,
    monthlyAfterTaxDividend,
    series,
    taxRate,
  };
}

export function formatKRWLong(value: number): string {
  if (!Number.isFinite(value)) return "0원";
  const won = Math.round(value);
  if (won >= 100_000_000) {
    const eok = Math.floor(won / 100_000_000);
    const man = Math.round((won % 100_000_000) / 10_000);
    if (man === 0) return `${eok.toLocaleString("ko-KR")}억 원`;
    return `${eok.toLocaleString("ko-KR")}억 ${man.toLocaleString("ko-KR")}만 원`;
  }
  if (won >= 10_000) {
    return `${Math.round(won / 10_000).toLocaleString("ko-KR")}만 원`;
  }
  return `${won.toLocaleString("ko-KR")}원`;
}

export function formatKRWShort(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const won = Math.round(value);
  if (won >= 100_000_000) {
    return `${(won / 100_000_000).toFixed(1)}억`;
  }
  if (won >= 10_000) {
    return `${Math.round(won / 10_000).toLocaleString("ko-KR")}만`;
  }
  return won.toLocaleString("ko-KR");
}
