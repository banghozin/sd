"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import {
  PRIMARY_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  UTILITY_NAV_ITEMS,
} from "./nav-config";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const drawerItems = [...SECONDARY_NAV_ITEMS, ...UTILITY_NAV_ITEMS];
  const moreActive = drawerItems.some(
    (it) => pathname === it.href || pathname?.startsWith(`${it.href}/`),
  );

  return (
    <>
      <nav
        className={cn(
          "md:hidden",
          "fixed inset-x-0 bottom-0 z-40",
          "border-t border-border bg-background/95 backdrop-blur",
          "pb-[env(safe-area-inset-bottom)]",
        )}
        aria-label="주요 메뉴"
      >
        <ul className="grid grid-cols-5">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-3 text-[12px] transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={cn("h-6 w-6", active && "scale-110")} />
                  <span className="font-medium">{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-1 py-3 text-[12px] transition-colors",
                moreActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MoreHorizontal
                className={cn("h-6 w-6", moreActive && "scale-110")}
              />
              <span className="font-medium">더보기</span>
            </button>
          </li>
        </ul>
      </nav>

      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="더보기 메뉴"
          className="fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-background shadow-2xl",
              "pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-200",
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">더보기</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex flex-col py-2">
              {SECONDARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-5 py-4 transition-colors",
                        active
                          ? "bg-primary/5 text-primary"
                          : "hover:bg-muted",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-foreground/70",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
              {UTILITY_NAV_ITEMS.length > 0 && (
                <>
                  <li
                    aria-hidden
                    className="my-1 border-t border-border/60"
                  />
                  {UTILITY_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-4 px-5 py-3 transition-colors",
                            active
                              ? "bg-primary/5 text-primary"
                              : "hover:bg-muted",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              active
                                ? "bg-primary/10 text-primary"
                                : "bg-muted/60 text-foreground/60",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {item.label}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
