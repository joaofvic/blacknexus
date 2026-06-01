"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type FilterOption = { value: string; label: string };

export function TableFilter({
  param,
  label,
  options,
}: {
  param: string;
  label: string;
  options: FilterOption[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const value = sp.get(param) ?? "";

  function onChange(next: string) {
    const params = new URLSearchParams(sp.toString());
    if (next) params.set(param, next);
    else params.delete(param);
    params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-muted">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm text-foreground outline-none focus:border-primary"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
