import { cn } from "@/lib/utils";

type AdVariant = "inline" | "horizontal" | "vertical";

type Props = {
  variant?: AdVariant;
  slot?: string;
  className?: string;
  label?: string;
};

const VARIANT_STYLES: Record<AdVariant, string> = {
  inline: "min-h-[180px] md:min-h-[200px]",
  horizontal: "min-h-[120px] md:min-h-[140px]",
  vertical: "min-h-[480px] lg:min-h-[600px]",
};

const VARIANT_LABEL: Record<AdVariant, string> = {
  inline: "in-feed",
  horizontal: "horizontal banner",
  vertical: "vertical sidebar",
};

export function AdBanner({
  variant = "inline",
  slot,
  className,
  label = "광고 영역",
}: Props) {
  return (
    <aside
      role="complementary"
      aria-label="광고"
      data-ad-slot={slot}
      data-ad-variant={variant}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-dashed",
        "border-gray-300 bg-gray-100 text-gray-500",
        "dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400",
        "px-4 py-6",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
        Advertisement
      </span>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-[11px] text-gray-400 dark:text-gray-600">
        {VARIANT_LABEL[variant]}
        {slot ? ` · ${slot}` : ""}
      </span>

      {/*
        TODO: 실제 구글 애드센스로 교체할 위치
        --------------------------------------
        1) /src/app/layout.tsx 의 <head> 또는 root에 AdSense 로더 한 번만 추가:
             import Script from "next/script";
             <Script
               async
               strategy="afterInteractive"
               src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
               crossOrigin="anonymous"
             />

        2) 이 컴포넌트의 placeholder 마크업을 아래 ins + push로 교체:
             <ins
               className="adsbygoogle block"
               style={{ display: "block" }}
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot={slot}
               data-ad-format="auto"
               data-full-width-responsive="true"
             />
             <Script id={`adsbygoogle-${slot}`} strategy="afterInteractive">
               {`(adsbygoogle = window.adsbygoogle || []).push({});`}
             </Script>

        3) variant 별로 권장 사이즈:
             - inline   : data-ad-format="fluid" / 반응형
             - horizontal: 728x90 (PC) ~ 320x100 (모바일) 반응형
             - vertical : 300x600 (rectangle, sidebar)

        4) 클릭 유도(accidental clicks) 방지:
             - 버튼/링크와 최소 24px 이상 마진 유지
             - 광고 위에 고정 헤더/푸터를 겹치지 않게
      */}
    </aside>
  );
}
