import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL, formatDate, formatNumber } from "@/lib/format";
import { StatusBadge, Button } from "@/components/ui";
import { atualizarStatusPedido, entregarItem } from "@/lib/admin-actions";
import type { PedidoStatus } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const statusOptions: PedidoStatus[] = [
  "aguardando_pagamento",
  "pago",
  "em_andamento",
  "concluido",
  "cancelado",
];

export default async function AdminPedidoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: pedido } = await admin.from("pedidos").select("*").eq("id", id).single();
  if (!pedido) notFound();

  const { data: itens } = await admin
    .from("pedido_itens")
    .select("*")
    .eq("pedido_id", id);

  const { data: profile } = await admin
    .from("profiles")
    .select("nome, email, whatsapp")
    .eq("id", pedido.user_id)
    .maybeSingle();

  return (
    <div>
      <Link href="/admin/pedidos" className="text-sm text-muted hover:text-foreground">
        ← Voltar
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold">#{pedido.id.slice(0, 8)}</h1>
          <p className="text-xs text-muted">{formatDate(pedido.created_at)}</p>
        </div>
        <StatusBadge status={pedido.status} />
      </div>

      {/* Cliente */}
      <div className="card mt-5 p-4 text-sm">
        <div className="font-semibold">Cliente</div>
        <div className="mt-1 text-muted">
          {profile?.nome ?? "—"} • {profile?.email ?? "—"}
          {profile?.whatsapp && ` • ${profile.whatsapp}`}
        </div>
      </div>

      {/* Alterar status */}
      <form action={atualizarStatusPedido} className="card mt-5 flex flex-wrap items-end gap-3 p-4">
        <input type="hidden" name="pedido_id" value={pedido.id} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Status do pedido</label>
          <select
            name="status"
            defaultValue={pedido.status}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <Button type="submit">Atualizar status</Button>
      </form>

      {/* Itens + entrega */}
      <h2 className="mt-6 mb-3 text-lg font-bold">Itens</h2>
      <div className="flex flex-col gap-4">
        {(itens ?? []).map((it) => (
          <div key={it.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{it.nome_produto}</div>
              <div className="font-bold text-primary">{formatBRL(it.subtotal)}</div>
            </div>
            <div className="mt-1 text-xs text-muted">
              Qtd: {formatNumber(it.qtd)}
              {it.link_alvo && ` • Alvo do cliente: ${it.link_alvo}`}
            </div>

            <form action={entregarItem} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="item_id" value={it.id} />
              <input type="hidden" name="pedido_id" value={pedido.id} />
              <label className="text-xs font-medium text-muted">
                Conteúdo entregue (login/senha, código ou observação)
              </label>
              <textarea
                name="conteudo_entregue"
                defaultValue={it.conteudo_entregue ?? ""}
                rows={3}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                placeholder="Ex.: Login: email@x.com | Senha: 1234"
              />
              <div className="flex items-center gap-3">
                <Button type="submit" variant="outline">Salvar entrega</Button>
                {it.entregue_em && (
                  <span className="text-xs text-success">
                    Entregue em {formatDate(it.entregue_em)}
                  </span>
                )}
              </div>
            </form>
          </div>
        ))}
      </div>

      <div className="card mt-6 flex items-center justify-between p-5">
        <span className="text-muted">Total</span>
        <span className="text-2xl font-extrabold text-primary">{formatBRL(pedido.total)}</span>
      </div>
    </div>
  );
}
