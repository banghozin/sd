import { Layers } from "lucide-react";
import { OverlapAnalyzer } from "@/components/overlap/overlap-analyzer";
import { GuideSection } from "@/components/layout/guide-section";
import { DataDisclaimer } from "@/components/layout/data-disclaimer";

export default function OverlapPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <Layers className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            크로스보더 포트폴리오 중복 위험
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground md:text-base">
            보유 ETF·종목을 입력하면 섹터 비중과 쏠림 위험을 분석해드려요.
          </p>
        </div>
      </header>

      <DataDisclaimer>
        <strong className="font-semibold">참고용 추정치예요.</strong> ETF의 섹터
        비중은 분기마다 한 번씩 바뀌는 정적 매핑을 사용하기 때문에 실제 비중과
        ±5% 정도 오차가 있을 수 있어요. 정확한 비중은 각 ETF 발행사의 상품
        설명서로 확인해 주세요.
      </DataDisclaimer>

      <OverlapAnalyzer />

      <GuideSection
        title="포트폴리오 분산, 왜 중요한가요?"
        items={[
          {
            heading: "이 분석기는 어떻게 작동하나요?",
            body: "보유 ETF나 종목을 입력하면 각 자산의 섹터 비중을 곱해 합산한 뒤, 내 포트폴리오 전체가 어떤 산업에 얼마나 노출돼 있는지 도넛 차트로 그려드려요. 예를 들어 QQQ와 TIGER 미국S&P500을 함께 보유 중이라면 두 ETF가 모두 미국 빅테크 비중이 커서 실제로는 분산되지 않은 채 한쪽으로 쏠려 있을 수 있습니다.",
          },
          {
            heading: "왜 50%가 위험 기준인가요?",
            body: "특정 섹터 비중이 전체의 절반을 넘으면 그 산업의 충격이 곧 내 자산 전체의 충격이 됩니다. 2022년 빅테크 급락이나 2008년 금융위기처럼 특정 섹터가 흔들릴 때 50%를 넘게 쏠려 있는 포트폴리오는 회복 속도가 현저히 느렸어요. 그래서 주황 35%, 빨강 50% 두 단계로 미리 알려드립니다.",
          },
          {
            heading: "내 데이터는 안전한가요?",
            body: "입력한 모든 데이터는 사용자 브라우저의 LocalStorage에만 저장되며 서버로 전송되지 않습니다. 다른 브라우저나 기기로 옮기면 새로 입력해야 하지만, 그만큼 외부 유출 위험이 없어요. 브라우저 캐시를 지우면 데이터도 함께 사라지는 점 참고해 주세요.",
          },
        ]}
      />

    </div>
  );
}
