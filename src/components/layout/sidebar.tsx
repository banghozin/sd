"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { NAV_ITEMS } from "./nav-config";
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
        <span className="hidden lg:block text-lg font-semibold tracking-tight">
          한미 대시보드
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 lg:px-4">
        {NAV_ITEMS.map((item) => {
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

      <div className="hidden lg:block border-t border-sidebar-border px-6 py-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          데이터는 브라우저에 저장됩니다.
          <br />
          서버 없이 0원으로 운영돼요.
        </p>
      </div>
    </aside>
  );
}
