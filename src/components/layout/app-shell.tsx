import type { ReactNode } from "react";
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
