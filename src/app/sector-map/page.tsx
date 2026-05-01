import { LayoutGrid } from "lucide-react";
import { HeatmapSection } from "@/components/heatmap/heatmap-section";
import { GuideSection } from "@/components/layout/guide-section";

export default function SectorMapPage() {
  const today = new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <LayoutGrid className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            한·미 통합 산업 섹터 맵
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground md:text-base">
            {today} 기준 · 한국 11개, 미국 11개 섹터의 오늘 등락률을 한눈에
          </p>
        </div>
      </header>

      <HeatmapSection />

      <GuideSection
        title="섹터 맵, 어떻게 읽나요?"
        items={[
          {
            heading: "데이터는 어떻게 모아지나요?",
            body: "한국은 KOSPI·KOSDAQ에 상장된 11개 산업 섹터, 미국은 S&P 500과 나스닥100을 기준으로 나눈 11개 섹터의 오늘 등락률을 한 화면에 보여드려요. 각 섹터의 등락률은 그 안에 속한 대표 종목들의 시가총액 가중평균으로 산출되며, 진한 색일수록 변동폭이 큽니다.",
          },
          {
            heading: "한국과 미국, 색이 왜 반대인가요?",
            body: "관습이 달라서 그렇습니다. 한국 증시에서는 빨간색이 상승, 파란색이 하락을 의미하지만, 미국에서는 초록색이 상승이고 빨간색이 하락이에요. 같은 화면에서 양국 시장을 동시에 보더라도 자국 시장 관습대로 직관적으로 읽히도록 색을 분리해 두었습니다.",
          },
          {
            heading: "이 데이터는 어디에 활용하나요?",
            body: "오늘 어떤 산업이 시장의 관심을 받고 있는지, 한국과 미국 중 어디서 더 강한지를 한눈에 파악할 수 있어요. 예컨대 반도체가 한·미 모두 강세라면 글로벌 사이클의 신호일 수 있고, 한쪽만 강하다면 환율·정책 이슈를 추가로 살펴볼 만합니다.",
          },
        ]}
      />

      <p className="text-center text-xs text-muted-foreground md:text-xs">
        ※ 데모용 더미 데이터입니다. 실제 시세는 추후 무료 API로 연동됩니다.
      </p>
    </div>
  );
}
