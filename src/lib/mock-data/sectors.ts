export type Market = "KR" | "US";

export type Sector = {
  id: string;
  name: string;
  market: Market;
  changePct: number;
  marketCapBillion: number;
  topTickers: string[];
};

export const KR_SECTORS: Sector[] = [
  {
    id: "kr-semi",
    name: "반도체",
    market: "KR",
    changePct: 2.84,
    marketCapBillion: 720,
    topTickers: ["삼성전자", "SK하이닉스"],
  },
  {
    id: "kr-battery",
    name: "2차전지",
    market: "KR",
    changePct: -3.12,
    marketCapBillion: 145,
    topTickers: ["LG에너지솔루션", "에코프로비엠"],
  },
  {
    id: "kr-ai",
    name: "AI·SW",
    market: "KR",
    changePct: 1.27,
    marketCapBillion: 88,
    topTickers: ["네이버", "카카오"],
  },
  {
    id: "kr-auto",
    name: "자동차",
    market: "KR",
    changePct: 0.42,
    marketCapBillion: 110,
    topTickers: ["현대차", "기아"],
  },
  {
    id: "kr-bio",
    name: "바이오·제약",
    market: "KR",
    changePct: -1.85,
    marketCapBillion: 92,
    topTickers: ["삼성바이오", "셀트리온"],
  },
  {
    id: "kr-finance",
    name: "금융",
    market: "KR",
    changePct: 0.95,
    marketCapBillion: 124,
    topTickers: ["KB금융", "신한지주"],
  },
  {
    id: "kr-chemical",
    name: "화학·소재",
    market: "KR",
    changePct: -0.38,
    marketCapBillion: 76,
    topTickers: ["LG화학", "롯데케미칼"],
  },
  {
    id: "kr-defense",
    name: "조선·방산",
    market: "KR",
    changePct: 4.61,
    marketCapBillion: 54,
    topTickers: ["HD현대중공업", "한화에어로"],
  },
  {
    id: "kr-game",
    name: "게임·엔터",
    market: "KR",
    changePct: -2.04,
    marketCapBillion: 38,
    topTickers: ["크래프톤", "하이브"],
  },
  {
    id: "kr-steel",
    name: "철강·금속",
    market: "KR",
    changePct: -0.71,
    marketCapBillion: 42,
    topTickers: ["POSCO홀딩스", "고려아연"],
  },
  {
    id: "kr-telecom",
    name: "통신·플랫폼",
    market: "KR",
    changePct: 0.18,
    marketCapBillion: 35,
    topTickers: ["SK텔레콤", "KT"],
  },
];

export const US_SECTORS: Sector[] = [
  {
    id: "us-semi",
    name: "반도체",
    market: "US",
    changePct: 3.92,
    marketCapBillion: 4200,
    topTickers: ["NVDA", "AMD", "AVGO"],
  },
  {
    id: "us-bigtech",
    name: "AI·빅테크",
    market: "US",
    changePct: 1.74,
    marketCapBillion: 8800,
    topTickers: ["MSFT", "GOOGL", "META"],
  },
  {
    id: "us-cloud",
    name: "클라우드·SaaS",
    market: "US",
    changePct: -0.52,
    marketCapBillion: 1800,
    topTickers: ["CRM", "ORCL", "NOW"],
  },
  {
    id: "us-ev",
    name: "EV·자동차",
    market: "US",
    changePct: -2.86,
    marketCapBillion: 1100,
    topTickers: ["TSLA", "F", "GM"],
  },
  {
    id: "us-bio",
    name: "바이오·제약",
    market: "US",
    changePct: 0.48,
    marketCapBillion: 2400,
    topTickers: ["LLY", "JNJ", "PFE"],
  },
  {
    id: "us-finance",
    name: "금융",
    market: "US",
    changePct: 1.12,
    marketCapBillion: 3300,
    topTickers: ["JPM", "BAC", "WFC"],
  },
  {
    id: "us-energy",
    name: "에너지",
    market: "US",
    changePct: -1.43,
    marketCapBillion: 1600,
    topTickers: ["XOM", "CVX"],
  },
  {
    id: "us-consumer",
    name: "소비재",
    market: "US",
    changePct: 0.21,
    marketCapBillion: 2100,
    topTickers: ["WMT", "COST", "PG"],
  },
  {
    id: "us-health",
    name: "헬스케어",
    market: "US",
    changePct: -0.94,
    marketCapBillion: 1900,
    topTickers: ["UNH", "ELV"],
  },
  {
    id: "us-media",
    name: "미디어·엔터",
    market: "US",
    changePct: 2.37,
    marketCapBillion: 1400,
    topTickers: ["NFLX", "DIS"],
  },
  {
    id: "us-defense",
    name: "항공·방산",
    market: "US",
    changePct: 5.18,
    marketCapBillion: 720,
    topTickers: ["LMT", "RTX", "BA"],
  },
];

export const ALL_SECTORS: Sector[] = [...KR_SECTORS, ...US_SECTORS];
