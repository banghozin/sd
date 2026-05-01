# StocksNet

> 한·미 주식을 한눈에. 무료, 0원 백엔드, 매시간 자동 갱신되는 라이브 대시보드.

**Live**: [stocksnet.vercel.app](https://stocksnet.vercel.app)

---

## ✨ 핵심 기능

| 메뉴 | 설명 | 데이터 소스 |
|------|------|------------|
| 🗺️ **섹터 맵** | 한국 11 + 미국 11 = 22개 산업 섹터의 오늘 등락률을 히트맵으로 | Yahoo Finance (SPDR Select / TIGER · KODEX 섹터 ETF) |
| 🔀 **포트폴리오 중복 분석** | 보유 ETF·종목의 섹터 비중을 합산해 도넛 차트 + 50% 쏠림 경고 | 정적 매핑 (분기 단위 갱신) |
| 🛰️ **스마트 머니** | 한국 임원 자사주 매수 + 미국 13F 헤지펀드 보유 변동 | DART OpenAPI · SEC EDGAR |
| 🔥 **FIRE 시뮬레이터** | 세후 DRIP(배당 재투자) 복리 시뮬레이션, 슬라이더 UI | 환율: Frankfurter (ECB) |

---

## 🧠 디자인 원칙

1. **완벽한 반응형** — 모바일 / 태블릿 / PC / 울트라와이드 (2xl)까지 네 단계 그리드
2. **Toss 스타일** — 큼지막한 폰트, 넉넉한 여백, rounded-2xl, 부드러운 그림자
3. **저사양 기기 최적화** — Recharts 애니메이션 OFF, 스켈레톤 UI, 콘텐츠 우선 렌더
4. **0원 백엔드** — 사용자 입력은 LocalStorage (Zustand persist), 외부 데이터는 정적 JSON
5. **다크모드 + 시스템 테마 자동 감지** — `next-themes`

---

## 🛠️ 기술 스택

| 카테고리 | 사용 |
|---------|-----|
| Framework | Next.js 16 (App Router · Turbopack) |
| Language | TypeScript 5 · React 19 |
| Styling | Tailwind CSS v4 · `tailwind-merge` · `class-variance-authority` |
| UI Kit | shadcn/ui · Lucide React 아이콘 |
| Charts | Recharts (히트맵 그리드는 순수 Tailwind) |
| State | Zustand 5 + persist 미들웨어 (LocalStorage) |
| Theme | next-themes |
| Data Fetch (CI) | tsx · fast-xml-parser (SEC 13F 파싱용) |
| 배포 | Vercel (Hobby 플랜, 자동 글로벌 CDN) |

---

## 🔄 데이터 파이프라인

```
GitHub Actions (cron: 매시 :15)
   │
   ├─ scripts/fetch-fx.ts        → src/data/fx.json
   ├─ scripts/fetch-sectors.ts   → src/data/sectors.json
   ├─ scripts/fetch-dart.ts      → src/data/kr-insiders.json   (DART_API_KEY 필요)
   └─ scripts/fetch-13f.ts       → src/data/us-13f.json
   │
   ▼
변경분만 git commit → main push
   │
   ▼
Vercel 자동 재배포 (정적 빌드에 JSON 인라인) → CDN 엣지 캐시
```

JSON이 바뀌지 않은 시간대(예: 시장 마감)에는 `git diff --staged --quiet` 가드로 커밋이 스킵돼 Vercel 빌드도 건너뜁니다.

### SEC EDGAR 우회 노트
SEC의 Akamai 프론트는 `<Name> <email>` 형식 User-Agent를 한국 ISP / 일부 클라우드 ASN에서 403 처리합니다. 이 프로젝트는 **브라우저 UA + HTTP `From` 헤더에 컨택트 이메일** 조합으로 우회합니다 — Akamai는 일반 브라우저로 인식하고, SEC는 `From` 헤더로 컨택트 정보를 식별합니다.

---

## 🚀 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 데이터 수동 갱신 (선택)
npm run fetch:fx        # 환율 (키 불필요)
npm run fetch:sectors   # 22개 섹터 ETF (키 불필요)
npm run fetch:13f       # SEC 13F (키 불필요)
npm run fetch:dart      # DART (DART_API_KEY 환경변수 필요)
npm run fetch:all       # 위 4개 순차 실행
```

DART API 키는 [opendart.fss.or.kr](https://opendart.fss.or.kr) 에서 무료 발급. 로컬에선 `.env.local`(.gitignore 처리됨)에 `DART_API_KEY=...` 형식으로, Vercel·CI에선 GitHub Secrets에 등록.

---

## 📂 디렉토리 구조

```
src/
├─ app/                          ← Next.js App Router
│  ├─ layout.tsx                 ← 루트 메타데이터 + AdSense + 테마
│  ├─ opengraph-image.tsx        ← OG 이미지 (1200×630, 자동 생성)
│  ├─ sitemap.ts                 ← /sitemap.xml
│  ├─ robots.ts                  ← /robots.txt
│  ├─ sector-map/
│  ├─ overlap/
│  ├─ smart-money/
│  ├─ fire/
│  └─ privacy/
├─ components/
│  ├─ heatmap/                   ← 섹터 히트맵 (TOP3 + 그리드)
│  ├─ overlap/                   ← 폼 + 도넛 + 위험 배너
│  ├─ smart-money/               ← Tabs + 적응형 테이블/카드
│  ├─ fire/                      ← 슬라이더 + 영역 차트
│  ├─ layout/                    ← AppShell, Sidebar, BottomNav, Theme
│  ├─ ads/                       ← AdSense 로더 + 배너 placeholder
│  └─ ui/                        ← shadcn 컴포넌트
├─ lib/
│  ├─ fire-calculation.ts        ← DRIP 복리 시뮬
│  ├─ portfolio-analysis.ts      ← 섹터 합산 + KRW 포맷
│  ├─ heatmap-color.ts           ← 등락률 → Tailwind 색상 5단계 버킷
│  ├─ store/portfolio-store.ts   ← Zustand + persist
│  └─ mock-data/                 ← 데이터 비어있을 때 폴백
└─ data/                         ← 워크플로 산출 JSON (커밋됨)

scripts/                         ← GitHub Actions에서 실행되는 tsx 스크립트
.github/workflows/update-data.yml ← 매시 :15 cron
```

---

## 📜 라이선스 / 데이터 출처

개인 포트폴리오 프로젝트입니다. 표시되는 데이터는 각 출처의 약관·재배포 정책을 따릅니다.

- **Frankfurter** — 무료, 무제한 (ECB 데이터)
- **Yahoo Finance** — 비공식 chart API
- **DART OpenAPI** — 사용자 본인 발급 키, 일 20,000회 제한
- **SEC EDGAR** — 공개 데이터, fair use 준수 (10 req/s 미만)

투자 권유 / 자문 / 거래 신호가 아니며, 본 사이트의 정보로 인한 투자 판단의 책임은 사용자에게 있습니다.
