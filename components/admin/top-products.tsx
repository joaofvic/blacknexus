import { formatBRL, formatNumber } from "@/lib/format";
import type { TopProduct } from "@/lib/admin-queries";

export function TopProducts({ items }: { items: TopProduct[] }) {
  if (!items.length) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted">
        Sem vendas nos últimos 30 dias.
      </p>
    );
  }
  const max = Math.max(...items.map((i) => i.receita), 1);
  return (
    <ul className="flex flex-col gap-3">
      {items.map((p, i) => {
        const pct = (p.receita / max) * 100;
        return (
          <li key={p.produto_id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-bold text-muted">
                  {i + 1}
                </span>
                <span className="truncate font-medium">{p.nome}</span>
              </div>
              <span className="shrink-0 font-bold text-primary">{formatBRL(p.receita)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full bg-gradient-to-r from-primary-dark to-primary"
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>
              <span className="text-[11px] text-muted">{formatNumber(p.qtd)} vendidos</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
