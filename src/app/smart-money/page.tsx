import { Radar, ShieldCheck } from "lucide-react";
import { SmartMoney } from "@/components/smart-money/smart-money";
import { GuideSection } from "@/components/layout/guide-section";

export default function SmartMoneyPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <Radar className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            스마트 머니 추적
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground md:text-base">
            한국 내부자(임원) 자사주 매수와 미국 13F 헤지펀드 보유 변동을 한
            화면에서 추적하세요.
          </p>
        </div>
      </header>

      <SmartMoney />

      <GuideSection
        title="스마트 머니, 왜 따라갈 가치가 있나요?"
        items={[
          {
            heading: "한국 내부자 매수란?",
            body: "회사의 임원·대주주가 자기 회사 주식을 사는 행위는 자본시장법상 5영업일 이내에 금융감독원 전자공시시스템(DART)에 의무적으로 신고해야 합니다. 이들은 회사 내부 사정을 가장 잘 아는 사람들이기 때문에, 자비를 들여 매수했다는 사실 자체가 시장에 비해 한 발 앞선 정보일 수 있어요.",
          },
          {
            heading: "미국 13F는 무엇인가요?",
            body: "미국에서 1억 달러 이상을 굴리는 모든 펀드는 분기 종료 후 45일 이내에 보유 종목 내역을 SEC에 13F 양식으로 제출합니다. 워렌 버핏의 버크셔, 마이클 버리의 사이언, 빌 애크먼의 퍼싱스퀘어 같은 거물들의 신규 진입과 청산이 모두 공개되며, 시장 컨센서스보다 한 분기 일찍 전략 변화를 엿볼 수 있어요.",
          },
          {
            heading: "맹신하면 안 되는 이유",
            body: "13F는 분기 말 기준이라 공시 시점엔 이미 45일이 지난 정보일 수 있고, 옵션 포지션이나 공매도는 포함되지 않습니다. 한국 내부자 매수도 절세 목적의 자전거래일 가능성이 있어요. 신호 자체보다는 누가, 얼마나, 어떤 맥락에서 사고팔았는지를 함께 살피는 것이 안전합니다.",
          },
        ]}
      />

      <footer className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground md:text-sm">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          Source: <strong className="font-semibold">DART</strong> (KR 공시) ·
          <strong className="ml-1 font-semibold">SEC EDGAR</strong> (US 13F)
        </span>
      </footer>

      <p className="text-center text-[11px] text-muted-foreground md:text-xs">
        ※ 현재 표시된 데이터는 데모용 더미입니다. 실제 공시는 분기/공시일 기준 지연 반영됩니다.
      </p>
    </div>
  );
}
