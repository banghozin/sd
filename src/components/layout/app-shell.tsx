import type { ReactNode } from "react";
import Link from "next/link";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { AppHeader } from "./app-header";
import { AdBanner } from "@/components/ads/ad-banner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-20 lg:pl-64">
        <AppHeader />
        <div className="mx-auto flex w-full max-w-screen-2xl gap-6 px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-6 lg:px-8 lg:pt-8 xl:gap-8">
          <main role="main" className="min-w-0 flex-1">
            {children}
            <div className="mt-10 xl:hidden">
              <AdBanner variant="horizontal" slot="bottom-banner" />
            </div>
            <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground md:text-sm">
              <Link
                href="/privacy"
                className="hover:text-foreground hover:underline underline-offset-4"
              >
                개인정보처리방침
              </Link>
              <span aria-hidden>·</span>
              <a
                href="https://github.com/banghozin/sd"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:underline underline-offset-4"
              >
                GitHub
              </a>
              <span aria-hidden>·</span>
              <span>© {new Date().getFullYear()} 한미 통합 주식 대시보드</span>
            </footer>
          </main>

          <aside
            aria-label="사이드 광고"
            className="hidden w-72 shrink-0 xl:block"
          >
            <div className="sticky top-20">
              <AdBanner variant="vertical" slot="right-rail" />
            </div>
          </aside>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
