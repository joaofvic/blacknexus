import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowUpIcon, ArrowDownIcon } from "./icons";

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  delta?: number; // % (pode ser negativo)
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "accent" | "success" | "warning";
}) {
  const accentClass = {
    primary: "text-primary",
    accent: "text-accent",
    success: "text-success",
    warning: "text-warning",
  }[accent];

  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const up = (delta ?? 0) >= 0;

  return (
    <div className="kpi-card p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {icon && (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2", accentClass)}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={cn("text-2xl font-extrabold tracking-tight", accentClass)}>{value}</span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {hasDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold",
              up ? "bg-success/15 kpi-delta-up" : "bg-danger/15 kpi-delta-down"
            )}
          >
            {up ? <ArrowUpIcon width={12} height={12} /> : <ArrowDownIcon width={12} height={12} />}
            {Math.abs(delta!)}%
          </span>
        )}
        {hint && <span className="text-muted">{hint}</span>}
      </div>
    </div>
  );
}
