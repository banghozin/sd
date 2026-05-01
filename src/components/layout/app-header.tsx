"use client";

import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { NAV_ITEMS } from "./nav-config";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 md:h-16 md:px-6 lg:px-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground md:hidden">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold md:text-lg">
            {current?.label ?? "StocksNet"}
          </h1>
          {current?.description ? (
            <p className="hidden truncate text-xs text-muted-foreground md:block">
              {current.description}
            </p>
          ) : null}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
