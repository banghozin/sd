import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 한미 통합 주식 대시보드",
  description:
    "한미 통합 주식 대시보드의 개인정보처리방침 — 수집하는 정보, 쿠키, 광고, 외부 데이터 출처 안내.",
};

const UPDATED_AT = "2026-05-01";

export default function PrivacyPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-12 md:w-12">
          <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            개인정보처리방침
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            한미 통합 주식 대시보드 (stocksnet.vercel.app) · 시행일 {UPDATED_AT}
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3 leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
        <h2 className="text-lg font-semibold md:text-xl">1. 개요</h2>
        <p>
          본 사이트(이하 &ldquo;서비스&rdquo;)는 한국과 미국 주식 시장에 대한 공개 정보를
          시각화해 제공하는 무료 도구입니다. 서비스는 별도의 회원가입 절차 없이 누구나
          이용할 수 있으며, 사용자에게서 식별 가능한 개인정보를 수집하지 않는 것을 원칙으로
          합니다.
        </p>
      </section>

      <section className="flex flex-col gap-3 leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
        <h2 className="text-lg font-semibold md:text-xl">2. 수집하는 정보</h2>
        <p>
          서비스는 자체 서버에 사용자의 개인정보를 저장하지 않습니다. 다만 아래 두 가지
          데이터가 사용자의 브라우저에 한해 보관됩니다.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="font-semibold">사용자 입력 포트폴리오</strong>: &ldquo;크로스보더
            포트폴리오 중복 위험&rdquo; 메뉴에서 입력한 보유 종목·금액은 사용자 브라우저의
            LocalStorage에만 저장되며 외부 서버로 전송되지 않습니다. 브라우저 캐시를
            삭제하면 함께 사라집니다.
          </li>
          <li>
            <strong className="font-semibold">테마 설정</strong>: 다크모드 토글 상태는
            LocalStorage에 보관됩니다.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
        <h2 className="text-lg font-semibold md:text-xl">3. 쿠키 및 광고</h2>
        <p>
          서비스는 운영비를 충당하기 위해{" "}
          <strong className="font-semibold">Google AdSense</strong>를 이용해 광고를
          노출합니다. Google과 그 파트너사는 광고 송출을 위해 사용자의 브라우저에 쿠키를
          설정할 수 있으며, 이 쿠키에는 광고 식별자(예: DoubleClick 쿠키), IP 주소,
          사용자 에이전트, 이전 방문 페이지 등이 포함될 수 있습니다.
        </p>
        <p>
          사용자는{" "}
          <a
            className="font-medium text-primary underline underline-offset-4"
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google 광고 설정
          </a>
          에서 관심 기반 광고를 거부할 수 있고,{" "}
          <a
            className="font-medium text-primary underline underline-offset-4"
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info
          </a>
          에서 다른 광고 네트워크의 쿠키도 일괄 거부할 수 있습니다. 또한 브라우저 설정을
          통해 모든 쿠키를 차단할 수 있으며, 이 경우 광고 노출에 불편이 있을 수 있으나
          서비스 본 기능 이용에는 영향이 없습니다.
        </p>
        <p>
          Google의 데이터 수집 정책 전문은{" "}
          <a
            className="font-medium text-primary underline underline-offset-4"
            href="https://policies.google.com/technologies/ads?hl=ko"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google 광고 정책
          </a>
          에서 확인할 수 있습니다.
        </p>
      </section>

      <section className="flex flex-col gap-3 leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
        <h2 className="text-lg font-semibold md:text-xl">4. 외부 데이터 출처</h2>
        <p>
          서비스가 표시하는 시장 데이터는 모두 공개된 외부 소스에서 가져온 것입니다.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="font-semibold">환율</strong>: Frankfurter (유럽중앙은행
            공식 데이터)
          </li>
          <li>
            <strong className="font-semibold">섹터 등락률</strong>: Yahoo Finance 공개
            차트 API (한미 섹터 ETF)
          </li>
          <li>
            <strong className="font-semibold">한국 내부자 매수</strong>: 금융감독원
            전자공시시스템 DART OpenAPI (공시 의무 데이터)
          </li>
          <li>
            <strong className="font-semibold">미국 13F</strong>: SEC EDGAR (헤지펀드
            분기별 의무 공시)
          </li>
        </ul>
        <p>
          위 데이터는 GitHub Actions 자동화를 통해 1시간 단위로 갱신되며, 정적 JSON
          파일로 사용자 브라우저에 전달됩니다. 사용자 정보가 외부 API로 전송되지
          않습니다.
        </p>
      </section>

      <section className="flex flex-col gap-3 leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
        <h2 className="text-lg font-semibold md:text-xl">5. 사용자의 권리</h2>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            저장된 포트폴리오 데이터는 브라우저 캐시·사이트 데이터 삭제 기능으로 언제든
            완전 삭제할 수 있습니다.
          </li>
          <li>
            서비스 화면 내 &ldquo;모두 삭제&rdquo; 버튼으로도 입력 데이터를 즉시 비울 수
            있습니다.
          </li>
          <li>
            서비스는 사용자의 개인정보를 저장·전송하지 않으므로, 별도의 열람·정정·삭제
            요청 절차는 두지 않습니다.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 leading-relaxed text-foreground/90 md:text-[15px] md:leading-7">
        <h2 className="text-lg font-semibold md:text-xl">6. 정책 변경</h2>
        <p>
          본 처리방침은 법령 또는 서비스 변경에 따라 개정될 수 있으며, 개정 시 본 페이지를
          통해 공지합니다. 시행일 기준 최신 버전이 효력을 가집니다.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        시행일: {UPDATED_AT}
      </p>
    </article>
  );
}
