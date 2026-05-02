"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[global error]", error);
    }
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#fafafa",
          color: "#111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            padding: 32,
            background: "#ffffff",
            border: "1px solid #fecaca",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            치명적인 오류가 발생했어요
          </h1>
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#6b7280",
            }}
          >
            사이트 전체가 영향을 받는 오류예요. 페이지를 새로고침하거나 잠시 후
            다시 접속해주세요.
          </p>
          {error?.digest && (
            <p
              style={{
                marginTop: 12,
                fontFamily: "monospace",
                fontSize: 11,
                color: "#9ca3af",
              }}
            >
              오류 ID · {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              color: "#ffffff",
              background: "#0f172a",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
