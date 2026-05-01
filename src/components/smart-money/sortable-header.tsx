"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

type Props<K extends string> = {
  column: K;
  label: string;
  sortKey: K;
  sortDir: SortDir;
  onSort: (key: K) => void;
  align?: "left" | "right";
};

export function SortableHeader<K extends string>({
  column,
  label,
  sortKey,
  sortDir,
  onSort,
  align = "left",
}: Props<K>) {
  const active = column === sortKey;
  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
        align === "right" && "ml-auto",
      )}
    >
      {label}
      <Icon className="h-3 w-3" />
    </button>
  );
}
