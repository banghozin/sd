import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AdSenseLoader } from "@/components/ads/adsense-loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://stocksnet.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StocksNet · 한·미 주식 분석",
    template: "%s · StocksNet",
  },
  description:
    "한국과 미국 주식을 한눈에. 매시간 자동 갱신되는 섹터 히트맵, 포트폴리오 중복 분석, 스마트 머니 추적, FIRE 배당 시뮬레이터까지 무료로.",
  keywords: [
    "주식",
    "한국 주식",
    "미국 주식",
    "섹터 분석",
    "포트폴리오",
    "ETF 중복",
    "스마트 머니",
    "13F",
    "DART",
    "내부자 매수",
    "FIRE",
    "배당 시뮬레이터",
    "DRIP",
    "조기은퇴",
    "주식 대시보드",
    "StocksNet",
  ],
  authors: [{ name: "StocksNet" }],
  applicationName: "StocksNet",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "StocksNet",
    url: SITE_URL,
    title: "StocksNet · 한·미 주식 분석",
    description:
      "매시간 자동 갱신되는 한·미 섹터 히트맵, 포트폴리오 중복 분석, 스마트 머니 추적, FIRE 시뮬레이터.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StocksNet · 한·미 주식 분석",
    description:
      "한국과 미국 주식을 한 화면에서. 섹터 맵 · 13F · 내부자 매수 · FIRE 시뮬.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  verification: {
    google: "WzJU2wV95TwoMPH_RPUQ8Lu_fZWKp3XodCLwkotzR8I",
    other: {
      "naver-site-verification":
        "350d1f17837421344e09ef9cb9d6791953762b9d",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
        <AdSenseLoader />
      </body>
    </html>
  );
}
