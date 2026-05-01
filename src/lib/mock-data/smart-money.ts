export type ActionType = "BUY" | "SELL";

export type KrInsiderTrade = {
  id: string;
  name: string;
  position: string;
  stock: string;
  amountKRW: number;
  action: ActionType;
  filedAt: string;
};

export type Us13FHolding = {
  id: string;
  fund: string;
  manager: string;
  ticker: string;
  stockName: string;
  changePct: number;
  currentWeightPct: number;
  action: ActionType;
  quarter: string;
  // Optional: percentage-point weight delta vs prior quarter (live data only)
  weightChangePp?: number;
  isNew?: boolean;
};

export const KR_INSIDER_TRADES: KrInsiderTrade[] = [
  {
    id: "kr-1",
    name: "이재용",
    position: "회장",
    stock: "삼성전자",
    amountKRW: 2_500_000_000,
    action: "BUY",
    filedAt: "2026-04-22",
  },
  {
    id: "kr-2",
    name: "최태원",
    position: "회장",
    stock: "SK하이닉스",
    amountKRW: 1_800_000_000,
    action: "BUY",
    filedAt: "2026-04-20",
  },
  {
    id: "kr-3",
    name: "정의선",
    position: "회장",
    stock: "현대차",
    amountKRW: 1_200_000_000,
    action: "BUY",
    filedAt: "2026-04-18",
  },
  {
    id: "kr-4",
    name: "구광모",
    position: "회장",
    stock: "LG에너지솔루션",
    amountKRW: 950_000_000,
    action: "BUY",
    filedAt: "2026-04-16",
  },
  {
    id: "kr-5",
    name: "서정진",
    position: "명예회장",
    stock: "셀트리온",
    amountKRW: 800_000_000,
    action: "BUY",
    filedAt: "2026-04-14",
  },
  {
    id: "kr-6",
    name: "신동빈",
    position: "회장",
    stock: "롯데지주",
    amountKRW: 700_000_000,
    action: "SELL",
    filedAt: "2026-04-12",
  },
  {
    id: "kr-7",
    name: "권오현",
    position: "고문",
    stock: "삼성SDI",
    amountKRW: 600_000_000,
    action: "BUY",
    filedAt: "2026-04-10",
  },
  {
    id: "kr-8",
    name: "박정원",
    position: "회장",
    stock: "두산에너빌리티",
    amountKRW: 450_000_000,
    action: "BUY",
    filedAt: "2026-04-08",
  },
  {
    id: "kr-9",
    name: "김택진",
    position: "대표이사",
    stock: "엔씨소프트",
    amountKRW: 320_000_000,
    action: "SELL",
    filedAt: "2026-04-06",
  },
  {
    id: "kr-10",
    name: "한상범",
    position: "부회장",
    stock: "LG디스플레이",
    amountKRW: 280_000_000,
    action: "BUY",
    filedAt: "2026-04-04",
  },
];

export const US_13F_HOLDINGS: Us13FHolding[] = [
  {
    id: "us-1",
    fund: "Berkshire Hathaway",
    manager: "Warren Buffett",
    ticker: "AAPL",
    stockName: "Apple Inc.",
    changePct: 12.5,
    currentWeightPct: 38.2,
    action: "BUY",
    quarter: "Q1 2026",
  },
  {
    id: "us-2",
    fund: "Berkshire Hathaway",
    manager: "Warren Buffett",
    ticker: "OXY",
    stockName: "Occidental Petroleum",
    changePct: 8.4,
    currentWeightPct: 4.6,
    action: "BUY",
    quarter: "Q1 2026",
  },
  {
    id: "us-3",
    fund: "Bridgewater Associates",
    manager: "Ray Dalio",
    ticker: "GLD",
    stockName: "SPDR Gold Shares",
    changePct: 25.3,
    currentWeightPct: 8.7,
    action: "BUY",
    quarter: "Q1 2026",
  },
  {
    id: "us-4",
    fund: "Pershing Square",
    manager: "Bill Ackman",
    ticker: "CMG",
    stockName: "Chipotle Mexican Grill",
    changePct: -8.1,
    currentWeightPct: 14.5,
    action: "SELL",
    quarter: "Q1 2026",
  },
  {
    id: "us-5",
    fund: "Scion Asset Management",
    manager: "Michael Burry",
    ticker: "BABA",
    stockName: "Alibaba Group",
    changePct: 32.7,
    currentWeightPct: 17.8,
    action: "BUY",
    quarter: "Q1 2026",
  },
  {
    id: "us-6",
    fund: "Tiger Global",
    manager: "Chase Coleman",
    ticker: "MSFT",
    stockName: "Microsoft",
    changePct: 6.2,
    currentWeightPct: 11.3,
    action: "BUY",
    quarter: "Q1 2026",
  },
  {
    id: "us-7",
    fund: "Appaloosa Management",
    manager: "David Tepper",
    ticker: "NVDA",
    stockName: "NVIDIA",
    changePct: 18.9,
    currentWeightPct: 9.4,
    action: "BUY",
    quarter: "Q1 2026",
  },
  {
    id: "us-8",
    fund: "Soros Fund Management",
    manager: "George Soros",
    ticker: "TSLA",
    stockName: "Tesla",
    changePct: -22.5,
    currentWeightPct: 2.1,
    action: "SELL",
    quarter: "Q1 2026",
  },
  {
    id: "us-9",
    fund: "Greenlight Capital",
    manager: "David Einhorn",
    ticker: "GM",
    stockName: "General Motors",
    changePct: 15.6,
    currentWeightPct: 7.2,
    action: "BUY",
    quarter: "Q1 2026",
  },
  {
    id: "us-10",
    fund: "Third Point",
    manager: "Daniel Loeb",
    ticker: "META",
    stockName: "Meta Platforms",
    changePct: -11.4,
    currentWeightPct: 5.8,
    action: "SELL",
    quarter: "Q1 2026",
  },
];
