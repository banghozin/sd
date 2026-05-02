"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[page error]", error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center md:p-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          페이지를 불러오는 중 문제가 발생했어요
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          잠시 후 다시 시도하거나 다른 메뉴로 이동해주세요. 문제가 계속되면
          새로고침 (<kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Ctrl</kbd>{" "}
          + <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Shift</kbd>{" "}
          + <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">R</kbd>) 한
          번 시도해보세요.
        </p>
      </div>

      {error?.digest && (
        <p className="font-mono text-[11px] text-muted-foreground/70">
          오류 ID · {error.digest}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>
        <Link
          href="/sector-map"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          <Home className="h-4 w-4" />
          홈으로
        </Link>
      </div>
    </div>
  );
}
