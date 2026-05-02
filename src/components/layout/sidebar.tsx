"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Shield, TrendingUp } from "lucide-react";
import { SIDEBAR_MAIN_ITEMS } from "./nav-config";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col",
        "md:fixed md:inset-y-0 md:left-0 md:z-30",
        "md:w-20 lg:w-64",
        "border-r border-border bg-sidebar text-sidebar-foreground",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4 lg:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <TrendingUp className="h-5 w-5" />
        </div>
        <span className="hidden lg:flex lg:flex-col lg:leading-tight">
          <span className="text-base font-bold tracking-tight">StocksNet</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            한·미 주식 분석
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 lg:px-4">
        {SIDEBAR_MAIN_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                "lg:px-4",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div className="hidden lg:flex lg:flex-col lg:min-w-0">
                <span className="truncate">{item.label}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border px-3 py-3 lg:px-6 lg:py-4">
        <Link
          href="/support"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors lg:px-4 lg:text-sm",
            pathname === "/support"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
        >
          <Coffee className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">개발자에게 커피 한 잔</span>
        </Link>
        <Link
          href="/privacy"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors lg:px-4 lg:text-sm",
            pathname === "/privacy"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
        >
          <Shield className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">개인정보처리방침</span>
        </Link>
        <p className="mt-3 hidden text-xs text-muted-foreground leading-relaxed lg:block">
          별다른 결제 없이
          <br />
          0원으로도 이 홈페이지를
          <br />
          누릴 수 있습니다.
        </p>
      </div>
    </aside>
  );
}
