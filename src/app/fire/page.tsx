import { Flame } from "lucide-react";
import { FireSimulator } from "@/components/fire/fire-simulator";
import { GuideSection } from "@/components/layout/guide-section";

export default function FirePage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <Flame className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            FIRE 배당 스노우볼 시뮬레이터
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground md:text-base">
            세금과 환율을 반영한 한·미 배당 재투자 시뮬레이션 (DRIP 가정)
          </p>
        </div>
      </header>

      <FireSimulator />

      <GuideSection
        title="FIRE 시뮬레이션, 어떻게 계산되나요?"
        items={[
          {
            heading: "DRIP(배당 재투자) 방식이란?",
            body: "받은 배당금을 한 푼도 쓰지 않고 100% 같은 자산에 다시 투자하는 전략입니다. 처음 1년의 배당이 다음 해의 배당을 늘리고, 그렇게 늘어난 배당이 또 다음 해를 키우는 복리 효과 덕분에 시간이 갈수록 그래프가 가속하듯 휘어 올라갑니다. 이 곡선이 바로 워렌 버핏이 말한 '눈덩이 효과(Snowball Effect)'예요.",
          },
          {
            heading: "세금은 어떻게 적용되나요?",
            body: "한국 주식의 배당은 배당소득세 15.4%(원천 14% + 지방소득세 1.4%)가 자동으로 차감되고, 미국 주식은 미국 정부가 15%를 원천징수합니다. 시뮬레이터는 매년 받은 배당에서 해당 세율을 즉시 차감하고 남은 금액만 재투자하기 때문에, 화면에 보이는 숫자는 모두 '세후 기준'입니다. 환율은 일단 1달러 1,350원으로 고정해 단순화했어요.",
          },
          {
            heading: "이 시뮬레이션의 한계",
            body: "주가 자체의 상승은 일부러 반영하지 않았습니다. 배당만으로 얼마까지 갈 수 있는지를 보수적으로 보여드리기 위해서예요. 또한 배당 컷(기업이 배당을 줄이는 사건), 환율 변동, 세제 개편은 가정하지 않았기 때문에 실제 결과는 더 클 수도, 적을 수도 있습니다. 참고용 가이드로 활용해 주세요.",
          },
        ]}
      />

      <p className="text-center text-xs text-muted-foreground">
        ※ 배당소득세 한국 15.4% / 미국 원천징수 15% · 환율 1$ = 1,350원 (고정 가정)
        <br />
        실제 수익률·세율·환율은 시장 상황에 따라 변동합니다.
      </p>
    </div>
  );
}
