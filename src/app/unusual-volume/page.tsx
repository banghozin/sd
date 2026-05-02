import type { Metadata } from "next";
import { Activity, AlertTriangle, TrendingUp } from "lucide-react";
import unusualVolumeData from "@/data/unusual-volume.json";
import { SignalTable } from "@/components/unusual-volume/signal-table";
import { LastUpdated } from "@/components/unusual-volume/last-updated";

export const metadata: Metadata = {
  title: "조용한 매집 감지 | StocksNet",
  description:
    "거래량은 평소의 3배 이상으로 터졌는데 가격은 ±2% 이내로 잠잠한 미국 소형주를 준실시간으로 감지합니다. 시총 $5M~$1.3B + 일평균 거래량 50k 이상 종목 대상.",
};

type Signal = {
  ticker: string;
  name: string;
  price: number;
  priceChangePct: number;
  todayVolume: number;
  avg5dVolume: number;
  rvol: number;
  elapsedMin: number;
  mcap: number;
};

type DataShape = {
  generatedAt: string;
  marketStatus: string;
  universeCount?: number;
  scannedCount?: number;
  count: number;
  signals: Signal[];
};

const data = unusualVolumeData as DataShape;

export default function UnusualVolumePage() {
  const isFresh = data.generatedAt !== "1970-01-01T00:00:00.000Z";
  const marketLabel =
    data.marketStatus === "open"
      ? "미국 장 진행 중"
      : data.marketStatus === "closed"
        ? "미국 장 마감"
        : data.marketStatus === "no-universe"
          ? "데이터 준비 중"
          : "데이터 없음";

  return (
    <article className="flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <Activity className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            조용한 매집 감지
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            거래량만 평소의 3배 이상 터졌는데 가격은 ±2% 이내로 잠잠한 종목
          </p>
        </div>
      </header>

      <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm md:grid-cols-3 md:p-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            마지막 갱신
          </span>
          {isFresh ? (
            <LastUpdated iso={data.generatedAt} />
          ) : (
            <span className="text-base font-semibold">아직 데이터 없음</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            시장 상태
          </span>
          <span className="flex items-center gap-2 text-base font-semibold">
            {data.marketStatus === "open" ? (
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            ) : (
              <span className="inline-flex h-2 w-2 rounded-full bg-muted-foreground/50" />
            )}
            {marketLabel}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            스캔 종목
          </span>
          <span className="text-base font-semibold">
            {data.scannedCount?.toLocaleString() ?? 0} 개
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed md:p-6">
        <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          중요 안내
        </div>
        <ul className="ml-5 list-disc space-y-1.5 text-foreground/85">
          <li>
            데이터는 <strong>최대 약 45분 지연</strong>됩니다. (Yahoo
            Finance 무료 데이터 15분 지연 + 30분 갱신 주기)
          </li>
          <li>
            시총 $5M ~ $1.3B 의 미국 소형주 대상이며, <strong>저유동성·펌프앤덤프
            위험</strong>이 있는 영역입니다.
          </li>
          <li>
            거래량 시그널은 <strong>매수 추천이 아닙니다</strong>. 단순한 통계적
            이상치 감지일 뿐, 매매 결정은 본인 책임입니다.
          </li>
          <li>
            장 시작 직후 30분은 노이즈가 크므로 시그널 계산에서 제외합니다.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold md:text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            감지된 시그널
            {data.count > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {data.count}
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            상위 100개 · RVol 내림차순
          </p>
        </div>

        {data.count === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="text-base font-medium">
              {data.marketStatus === "open"
                ? "현재 조건에 맞는 시그널이 없습니다"
                : "장이 마감되었거나 데이터가 아직 준비되지 않았습니다"}
            </p>
            <p className="text-sm text-muted-foreground">
              미국 장 시간 (한국 22:30 ~ 05:00 KST)에 다시 확인해주세요.
            </p>
          </div>
        ) : (
          <SignalTable signals={data.signals} />
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-sm leading-relaxed md:p-6">
        <h3 className="font-semibold">시그널 기준</h3>
        <ul className="ml-5 list-disc space-y-1.5 text-foreground/85">
          <li>
            <strong>RVol ≥ 3</strong> — 오늘 거래량을 정규장 시간 비율로
            전체 일봉 거래량으로 환산했을 때, 5거래일 평균의 3배 이상
          </li>
          <li>
            <strong>|가격 변동| ≤ 2%</strong> — 거래량은 폭발했는데 가격
            반응이 제한적 (=조용히 매집되는 시그널)
          </li>
          <li>
            <strong>유니버스</strong> — 시총 $5M ~ $1.3B + 5일 평균 거래량
            50,000주 이상의 미국 종목 (NASDAQ + NYSE + AMEX)
          </li>
        </ul>
      </section>
    </article>
  );
}
