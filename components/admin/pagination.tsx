"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function Pagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function go(next: number) {
    const params = new URLSearchParams(sp.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted">
      <span>
        Mostrando <span className="font-semibold text-foreground">{from}–{to}</span> de{" "}
        <span className="font-semibold text-foreground">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          className="rounded-md border border-border bg-surface-2 px-3 py-1.5 font-medium text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Anterior
        </button>
        <span className="px-2 font-semibold text-foreground">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
          className="rounded-md border border-border bg-surface-2 px-3 py-1.5 font-medium text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
