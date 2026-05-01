import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

export function DataDisclaimer({ children, className }: Props) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm leading-relaxed md:text-[15px]",
        "border-amber-200 bg-amber-50 text-amber-900",
        "dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 md:h-5 md:w-5" />
      <p className="min-w-0">{children}</p>
    </div>
  );
}
