import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui";

export const metadata = { title: "Meus pedidos — BlackNexus" };

export default async function PedidosPage() {
  await requireUser("/login?next=/conta/pedidos");
  const supabase = await createClient();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("id, status, total, created_at")
    .order("created_at", { ascending: false });

  const lista = pedidos ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">Meus pedidos</h1>

      {lista.length === 0 ? (
        <p className="text-muted">Nenhum pedido encontrado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map((p) => (
            <Link
              key={p.id}
              href={`/conta/pedidos/${p.id}`}
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
        </div>
      )}
    </div>
  );
}
