"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { useNotificationStore } from "@/lib/store/notification-store";
import { cn } from "@/lib/utils";

type PermState = "default" | "granted" | "denied" | "unsupported";

export function NotificationToggle() {
  const enabled = useNotificationStore((s) => s.enabled);
  const hydrated = useNotificationStore((s) => s.hasHydrated);
  const threshold = useNotificationStore((s) => s.rvolThreshold);
  const setEnabled = useNotificationStore((s) => s.setEnabled);
  const setRvolThreshold = useNotificationStore((s) => s.setRvolThreshold);

  const [perm, setPerm] = useState<PermState>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
  }, []);

  const handleToggle = async () => {
    if (perm === "unsupported") return;
    if (enabled) {
      setEnabled(false);
      return;
    }
    if (perm === "default") {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result === "granted") setEnabled(true);
      return;
    }
    if (perm === "denied") return;
    if (perm === "granted") setEnabled(true);
  };

  if (!hydrated) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <Bell className="h-4 w-4" />
        <span>알림 설정 불러오는 중...</span>
      </div>
    );
  }

  const active = enabled && perm === "granted";

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              active
                ? "bg-amber-500/10 text-amber-500"
                : "bg-muted text-muted-foreground",
            )}
          >
            {active ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold md:text-base">
              강한 시그널 데스크톱 알림
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
              RVol {threshold}배 이상 시그널 발견 시 브라우저 알림으로 알려드립니다.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={perm === "unsupported" || perm === "denied"}
          aria-pressed={active}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            active ? "bg-primary" : "bg-muted-foreground/30",
            (perm === "unsupported" || perm === "denied") &&
              "cursor-not-allowed opacity-50",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
              active ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      {active && (
        <div className="flex items-center gap-3 border-t border-border/60 pt-3">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            기준 RVol
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[3, 5, 8, 10].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setRvolThreshold(v)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  threshold === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground/70 hover:bg-muted/80",
                )}
              >
                ≥ {v}배
              </button>
            ))}
          </div>
        </div>
      )}

      {perm === "denied" && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>
            브라우저에서 알림 권한이 차단되어 있습니다. 주소창의 자물쇠 아이콘을
            클릭해 알림 권한을 허용한 후 다시 시도해주세요.
          </p>
        </div>
      )}

      {perm === "unsupported" && (
        <div className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>이 브라우저는 데스크톱 알림을 지원하지 않습니다.</p>
        </div>
      )}
    </section>
  );
}
