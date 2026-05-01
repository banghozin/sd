import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "후원하기 | StocksNet",
  description:
    "StocksNet 운영을 도와주세요. 여러분의 작은 후원이 사이트를 유지하고 더 나은 기능을 만드는 데 큰 힘이 됩니다.",
};

const TOONATION_URL = "https://toon.at/donate/stocksnet";

export default function SupportPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <Coffee className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            개발자에게 커피 한 잔 ☕
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            여러분의 작은 후원이 StocksNet을 살아 움직이게 합니다.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-primary">
          <Heart className="h-5 w-5" />
          <h2 className="text-lg font-semibold md:text-xl">
            왜 후원이 필요한가요?
          </h2>
        </div>
        <p className="leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
          StocksNet은 광고 외에 별도의 결제·구독 없이 누구나 무료로 쓸 수
          있도록 만들었습니다. 다만 사이트를 안정적으로 유지하려면 도메인
          비용, 데이터 갱신을 위한 자동화 인프라, 외부 API 사용량 등
          소소한 운영 비용이 꾸준히 발생합니다.
        </p>
        <p className="leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
          여러분의 후원은 이 사이트가 계속 살아 움직일 수 있도록 하는 데에
          큰 힘이 됩니다. 단 한 잔의 커피값이라도 정말 큰 도움이 됩니다.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold md:text-xl">
            후원금은 어떻게 쓰이나요?
          </h2>
        </div>
        <ul className="ml-5 list-disc space-y-2 leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
          <li>
            <strong className="font-semibold">사이트 운영 비용</strong> —
            도메인, 호스팅, 데이터 자동화 인프라 유지
          </li>
          <li>
            <strong className="font-semibold">유료 데이터 API 도입</strong> —
            후원금이 일정 규모 이상 모이면 더 정확하고 빠른 시장 데이터를
            제공할 수 있는 유료 API로 업그레이드
          </li>
          <li>
            <strong className="font-semibold">신규 편의 기능 개발</strong> —
            후원금이 쌓이는 만큼 알림 기능, 즐겨찾기, 더 다양한 분석 도구
            등을 차근차근 추가해 나갈 예정입니다.
          </li>
        </ul>
        <p className="leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
          후원금이 모일수록 더 많은 시간과 노력을 사이트 개선에 쏟을 수
          있습니다. 약속드릴 수 있는 건, 받은 만큼 사이트가 더 좋아진다는
          것입니다.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8">
        <h2 className="text-lg font-semibold md:text-xl">후원하기</h2>
        <p className="leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
          한국 사용자에게 친숙한 후원 플랫폼{" "}
          <strong className="font-semibold">투네이션(Toonation)</strong>을
          통해 카카오페이, 카드, 계좌이체 등 다양한 방법으로 후원할 수
          있습니다. 닉네임만 노출되어 후원자의 개인정보가 안전하게 보호됩니다.
        </p>
        <Link
          href={TOONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 md:text-lg"
        >
          <Coffee className="h-5 w-5" />
          투네이션으로 후원하기
        </Link>
        <p className="text-xs text-muted-foreground md:text-sm">
          버튼을 누르면 외부 사이트(toon.at)로 이동합니다.
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-6 md:p-8">
        <h2 className="text-base font-semibold md:text-lg">감사의 말</h2>
        <p className="leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
          후원 여부와 관계없이 StocksNet을 찾아주시는 모든 분들께 진심으로
          감사드립니다. 이 사이트는 여러분이 있기에 의미가 있습니다. 💙
        </p>
      </section>
    </article>
  );
}
