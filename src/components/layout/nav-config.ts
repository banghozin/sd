import { Activity, LayoutGrid, Layers, Radar, Flame, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/sector-map",
    label: "섹터 맵",
    shortLabel: "섹터",
    description: "한·미 산업 섹터 히트맵",
    icon: LayoutGrid,
  },
  {
    href: "/overlap",
    label: "중복 분석",
    shortLabel: "중복",
    description: "포트폴리오 중복 위험 진단",
    icon: Layers,
  },
  {
    href: "/smart-money",
    label: "스마트 머니",
    shortLabel: "추적",
    description: "기관·외국인 자금 흐름",
    icon: Radar,
  },
  {
    href: "/unusual-volume",
    label: "조용한 매집",
    shortLabel: "매집",
    description: "거래량 폭증 + 가격 정체 감지",
    icon: Activity,
  },
  {
    href: "/fire",
    label: "FIRE 시뮬",
    shortLabel: "FIRE",
    description: "배당 스노우볼 시뮬레이터",
    icon: Flame,
  },
];
