import type { ActionType } from "@/lib/mock-data/smart-money";
import { cn } from "@/lib/utils";

type Props = {
  action: ActionType;
  className?: string;
};

export function ActionBadge({ action, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide",
        action === "BUY"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
        className,
      )}
    >
      {action}
    </span>
  );
}
