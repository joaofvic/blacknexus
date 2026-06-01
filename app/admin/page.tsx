import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const admin = createAdminClient();

  const [{ count: totalPedidos }, { count: pendentes }, { data: pagos }, { data: ultimos }] =
    await Promise.all([
      admin.from("pedidos").select("*", { count: "exact", head: true }),
      admin
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .in("status", ["pago", "em_andamento"]),
      admin.from("pedidos").select("total").eq("status", "concluido"),
      admin
        .from("pedidos")
        .select("id, status, total, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const faturamento = (pagos ?? []).reduce((s, p) => s + Number(p.total), 0);

  const cards = [
    { label: "Pedidos", valor: String(totalPedidos ?? 0) },
    { label: "A processar", valor: String(pendentes ?? 0) },
    { label: "Faturamento (concluídos)", valor: formatBRL(faturamento) },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Resumo</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="text-sm text-muted">{c.label}</div>
            <div className="mt-1 text-2xl font-extrabold text-primary">{c.valor}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-bold">Últimos pedidos</h2>
      <div className="flex flex-col gap-2">
        {(ultimos ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/pedidos/${p.id}`}
            className="card card-hover flex items-center justify-between p-4"
          >
            <div>
              <div className="font-mono text-sm">#{p.id.slice(0, 8)}</div>
              <div className="text-xs text-muted">{formatDate(p.created_at)}</div>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={p.status} />
              <span className="font-bold text-primary">{formatBRL(p.total)}</span>
            </div>
          </Link>
        ))}
        {(ultimos ?? []).length === 0 && (
          <p className="text-sm text-muted">Nenhum pedido ainda.</p>
        )}
      </div>
    </div>
  );
}
