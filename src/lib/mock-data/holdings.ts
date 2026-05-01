export type SectorWeight = {
  sector: string;
  weight: number;
};

export type TickerInfo = {
  ticker: string;
  name: string;
  market: "KR" | "US";
  weights: SectorWeight[];
};

export const SECTORS = [
  "기술",
  "금융",
  "헬스케어",
  "소비재",
  "산업",
  "에너지",
  "통신·미디어",
  "소재",
  "부동산",
  "유틸리티",
  "기타",
] as const;

export const SECTOR_COLORS: Record<string, string> = {
  기술: "#6366f1",
  금융: "#10b981",
  헬스케어: "#f43f5e",
  소비재: "#f59e0b",
  산업: "#06b6d4",
  에너지: "#f97316",
  "통신·미디어": "#8b5cf6",
  소재: "#78716c",
  부동산: "#14b8a6",
  유틸리티: "#84cc16",
  기타: "#94a3b8",
};

const E = (sector: string, weight: number): SectorWeight => ({
  sector,
  weight,
});

export const TICKER_DATABASE: TickerInfo[] = [
  {
    ticker: "QQQ",
    name: "Invesco QQQ (나스닥100)",
    market: "US",
    weights: [
      E("기술", 0.5),
      E("통신·미디어", 0.2),
      E("소비재", 0.15),
      E("헬스케어", 0.1),
      E("기타", 0.05),
    ],
  },
  {
    ticker: "SPY",
    name: "SPDR S&P500",
    market: "US",
    weights: [
      E("기술", 0.3),
      E("금융", 0.15),
      E("헬스케어", 0.13),
      E("소비재", 0.12),
      E("산업", 0.09),
      E("통신·미디어", 0.09),
      E("에너지", 0.04),
      E("부동산", 0.03),
      E("유틸리티", 0.03),
      E("소재", 0.02),
    ],
  },
  {
    ticker: "VOO",
    name: "Vanguard S&P500",
    market: "US",
    weights: [
      E("기술", 0.3),
      E("금융", 0.15),
      E("헬스케어", 0.13),
      E("소비재", 0.12),
      E("산업", 0.09),
      E("통신·미디어", 0.09),
      E("에너지", 0.04),
      E("부동산", 0.03),
      E("유틸리티", 0.03),
      E("소재", 0.02),
    ],
  },
  {
    ticker: "SCHD",
    name: "Schwab 미국배당주",
    market: "US",
    weights: [
      E("금융", 0.18),
      E("헬스케어", 0.15),
      E("소비재", 0.15),
      E("기술", 0.13),
      E("산업", 0.13),
      E("에너지", 0.1),
      E("통신·미디어", 0.08),
      E("소재", 0.05),
      E("기타", 0.03),
    ],
  },
  {
    ticker: "TSLA",
    name: "테슬라",
    market: "US",
    weights: [E("산업", 0.5), E("기술", 0.5)],
  },
  {
    ticker: "NVDA",
    name: "엔비디아",
    market: "US",
    weights: [E("기술", 1)],
  },
  {
    ticker: "AAPL",
    name: "애플",
    market: "US",
    weights: [E("기술", 1)],
  },
  {
    ticker: "MSFT",
    name: "마이크로소프트",
    market: "US",
    weights: [E("기술", 1)],
  },
  {
    ticker: "GOOGL",
    name: "구글",
    market: "US",
    weights: [E("기술", 0.7), E("통신·미디어", 0.3)],
  },
  {
    ticker: "AMZN",
    name: "아마존",
    market: "US",
    weights: [E("소비재", 0.5), E("기술", 0.5)],
  },
  {
    ticker: "META",
    name: "메타",
    market: "US",
    weights: [E("통신·미디어", 0.6), E("기술", 0.4)],
  },
  {
    ticker: "JPM",
    name: "JP모건",
    market: "US",
    weights: [E("금융", 1)],
  },
  {
    ticker: "삼성전자",
    name: "삼성전자",
    market: "KR",
    weights: [E("기술", 1)],
  },
  {
    ticker: "SK하이닉스",
    name: "SK하이닉스",
    market: "KR",
    weights: [E("기술", 1)],
  },
  {
    ticker: "네이버",
    name: "NAVER",
    market: "KR",
    weights: [E("기술", 0.7), E("통신·미디어", 0.3)],
  },
  {
    ticker: "카카오",
    name: "카카오",
    market: "KR",
    weights: [E("기술", 0.6), E("통신·미디어", 0.4)],
  },
  {
    ticker: "현대차",
    name: "현대차",
    market: "KR",
    weights: [E("산업", 1)],
  },
  {
    ticker: "LG에너지솔루션",
    name: "LG에너지솔루션",
    market: "KR",
    weights: [E("산업", 0.6), E("소재", 0.4)],
  },
  {
    ticker: "셀트리온",
    name: "셀트리온",
    market: "KR",
    weights: [E("헬스케어", 1)],
  },
  {
    ticker: "KB금융",
    name: "KB금융",
    market: "KR",
    weights: [E("금융", 1)],
  },
  {
    ticker: "TIGER 미국S&P500",
    name: "TIGER 미국S&P500",
    market: "KR",
    weights: [
      E("기술", 0.3),
      E("금융", 0.15),
      E("헬스케어", 0.13),
      E("소비재", 0.12),
      E("산업", 0.09),
      E("통신·미디어", 0.09),
      E("에너지", 0.04),
      E("부동산", 0.03),
      E("유틸리티", 0.03),
      E("소재", 0.02),
    ],
  },
  {
    ticker: "TIGER 미국나스닥100",
    name: "TIGER 미국나스닥100",
    market: "KR",
    weights: [
      E("기술", 0.5),
      E("통신·미디어", 0.2),
      E("소비재", 0.15),
      E("헬스케어", 0.1),
      E("기타", 0.05),
    ],
  },
  {
    ticker: "KODEX 200",
    name: "KODEX 200 (코스피200)",
    market: "KR",
    weights: [
      E("기술", 0.35),
      E("금융", 0.18),
      E("산업", 0.15),
      E("소비재", 0.12),
      E("헬스케어", 0.08),
      E("통신·미디어", 0.05),
      E("소재", 0.04),
      E("에너지", 0.03),
    ],
  },
];

const TICKER_INDEX = new Map(
  TICKER_DATABASE.map((t) => [t.ticker.toUpperCase(), t]),
);

export function findTicker(ticker: string): TickerInfo | undefined {
  return TICKER_INDEX.get(ticker.trim().toUpperCase());
}

export function getKnownTickers(): TickerInfo[] {
  return TICKER_DATABASE;
}
