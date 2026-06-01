import { formatBRL } from "@/lib/format";
import type { RevenuePoint } from "@/lib/admin-queries";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const totalPeriod = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="card p-5">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Receita · últimos 14 dias
          </h3>
          <p className="mt-1 text-2xl font-extrabold text-primary">{formatBRL(totalPeriod)}</p>
        </div>
        <span className="text-xs text-muted">apenas pedidos pagos+</span>
      </div>

      <div className="mt-6 flex h-40 items-end gap-1.5">
        {data.map((d) => {
          const pct = (d.total / max) * 100;
          return (
            <div
              key={d.date}
              className="group relative flex h-full flex-1 items-end"
              title={`${d.label}: ${formatBRL(d.total)}`}
            >
              <div
                style={{ height: `${Math.max(pct, 2)}%` }}
                className="w-full rounded-t-md bg-gradient-to-t from-primary-dark to-primary opacity-80 transition group-hover:opacity-100"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
