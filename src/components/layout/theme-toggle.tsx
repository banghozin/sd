"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount detection for SSR-safe theme read
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="다크모드 전환"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background transition-colors",
        "hover:bg-accent",
      )}
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-opacity",
          mounted && isDark ? "opacity-0" : "opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-opacity",
          mounted && isDark ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
