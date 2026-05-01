import { ImageResponse } from "next/og";

export const alt = "StocksNet · 한·미 주식 분석";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@800&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\((https:\/\/[^)]+)\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    return fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background:
            "linear-gradient(135deg, #fff7ed 0%, #fce7f3 50%, #e0f2fe 100%)",
          fontFamily: fontData ? "NotoKR" : "system-ui, sans-serif",
          color: "#0a0a0a",
          position: "relative",
        }}
      >
        {/* small badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(255,255,255,0.7)",
            padding: "10px 20px",
            borderRadius: "999px",
            fontSize: "24px",
            fontWeight: 700,
            color: "#7c2d12",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "999px",
              background: "#10b981",
              display: "block",
            }}
          />
          LIVE · 매시간 자동 갱신
        </div>

        {/* title */}
        <div
          style={{
            fontSize: "164px",
            fontWeight: 800,
            letterSpacing: "-4px",
            lineHeight: 1,
            marginTop: "32px",
          }}
        >
          StocksNet
        </div>

        {/* subtitle */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#1f2937",
            marginTop: "16px",
            lineHeight: 1.2,
          }}
        >
          🇰🇷 한국 · 🇺🇸 미국 주식 분석
        </div>

        {/* features */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "40px",
            fontSize: "26px",
            color: "#52525b",
            fontWeight: 700,
          }}
        >
          <span style={{ background: "rgba(255,255,255,0.6)", padding: "8px 18px", borderRadius: "999px" }}>섹터 맵</span>
          <span style={{ background: "rgba(255,255,255,0.6)", padding: "8px 18px", borderRadius: "999px" }}>포트폴리오 중복 분석</span>
          <span style={{ background: "rgba(255,255,255,0.6)", padding: "8px 18px", borderRadius: "999px" }}>스마트 머니</span>
          <span style={{ background: "rgba(255,255,255,0.6)", padding: "8px 18px", borderRadius: "999px" }}>FIRE 시뮬</span>
        </div>

        {/* footer */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            fontSize: "22px",
            color: "#6b7280",
            fontWeight: 700,
          }}
        >
          stocksnet.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "NotoKR",
              data: fontData,
              weight: 800,
              style: "normal",
            },
          ]
        : undefined,
    },
  );
}
