import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminPedidos() {
  const admin = createAdminClient();
  const { data: pedidos } = await admin
    .from("pedidos")
    .select("id, status, total, created_at, user_id")
    .order("created_at", { ascending: false });

  const lista = pedidos ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Pedidos</h1>
      {lista.length === 0 ? (
        <p className="text-sm text-muted">Nenhum pedido.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Data</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-surface-2/50">
                  <td className="p-3">
                    <Link href={`/admin/pedidos/${p.id}`} className="font-mono text-primary hover:underline">
                      #{p.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="p-3 text-muted">{formatDate(p.created_at)}</td>
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3 text-right font-semibold">{formatBRL(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
