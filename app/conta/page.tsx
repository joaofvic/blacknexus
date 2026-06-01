import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusBadge, LinkButton } from "@/components/ui";

export const metadata = { title: "Minha conta — BlackNexus" };

export default async function ContaPage() {
  const session = await requireUser();
  const supabase = await createClient();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("id, status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const lista = pedidos ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">
          Olá, {session.profile?.nome ?? "cliente"} 👋
        </h1>
        <p className="text-sm text-muted">{session.email}</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">Pedidos recentes</h2>
        <Link href="/conta/pedidos" className="text-sm text-primary hover:underline">
          Ver todos
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-muted">Você ainda não fez nenhum pedido.</p>
          <LinkButton href="/">Explorar produtos</LinkButton>
        </div>
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
