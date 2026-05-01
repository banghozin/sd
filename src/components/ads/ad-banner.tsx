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
        AdSense loader script is wired in app/layout.tsx (client ca-pub-5250094872537223).
        Once Google approves the site:
          1) AdSense 대시보드 → Ads → By ad unit → Create new ad unit
             각 variant 별로 광고 단위 생성:
               - inline   → "Display ads" Auto 반응형
               - horizontal → "Display ads" Horizontal
               - vertical → "Display ads" Vertical
          2) 각 단위가 부여하는 numeric slot ID (e.g. "1234567890") 를 받아
             SLOT_IDS 매핑(아래)에 채워 넣고 placeholder 를 <ins.adsbygoogle> 로 교체:

             const SLOT_IDS: Record<string, string> = {
               "sector-map-infeed": "1234567890",
               "overlap-infeed":    "1234567891",
               "bottom-banner":     "1234567892",
               "right-rail":        "1234567893",
             };

             <ins
               className="adsbygoogle block"
               style={{ display: "block" }}
               data-ad-client="ca-pub-5250094872537223"
               data-ad-slot={SLOT_IDS[slot]}
               data-ad-format="auto"
               data-full-width-responsive="true"
             />
             <Script id={`adsbygoogle-${slot}`} strategy="afterInteractive">
               {`(adsbygoogle = window.adsbygoogle || []).push({});`}
             </Script>

          3) 클릭 유도 방지: 버튼/링크와 최소 24px 마진 유지 (현재 컨테이너 spacing 충족).
      */}
    </aside>
  );
}
