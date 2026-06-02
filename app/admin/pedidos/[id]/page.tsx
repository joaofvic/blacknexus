import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL, formatDate, formatNumber } from "@/lib/format";
import { StatusBadge } from "@/components/ui";
import { PageHeader } from "@/components/admin/page-header";
import { StatusForm, DeliveryForm } from "@/components/admin/pedido-actions-client";

export const dynamic = "force-dynamic";

export default async function AdminPedidoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: pedido } = await admin.from("pedidos").select("*").eq("id", id).single();
  if (!pedido) notFound();

  const [{ data: itens }, { data: profile }, { data: pagamento }] = await Promise.all([
    admin.from("pedido_itens").select("*").eq("pedido_id", id),
    admin
      .from("profiles")
      .select("nome, email, whatsapp")
      .eq("id", pedido.user_id)
      .maybeSingle(),
    admin
      .from("pagamentos")
      .select("provedor, status, valor, expira_em, mp_payment_id")
      .eq("pedido_id", id)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/admin/pedidos" className="text-xs text-muted hover:text-foreground">
        ← Voltar para pedidos
      </Link>

      <PageHeader
        title={`Pedido #${pedido.id.slice(0, 8)}`}
        description={formatDate(pedido.created_at)}
        actions={<StatusBadge status={pedido.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">
            Cliente
          </h3>
          <div className="text-sm font-semibold">{profile?.nome ?? "—"}</div>
          <div className="mt-1 text-xs text-muted">{profile?.email ?? "—"}</div>
          {pedido.whatsapp && (
            <div className="mt-2 text-xs">
              <span className="text-muted">WhatsApp do pedido: </span>
              <a
                href={`https://wa.me/${pedido.whatsapp.startsWith("55") ? pedido.whatsapp : `55${pedido.whatsapp}`}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary"
              >
                {pedido.whatsapp}
              </a>
            </div>
          )}
          {profile?.whatsapp && profile.whatsapp !== pedido.whatsapp && (
            <div className="mt-1 text-xs text-muted">
              WhatsApp do cadastro: {profile.whatsapp}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">
            Pagamento
          </h3>
          {pagamento ? (
            <>
              <div className="text-sm font-semibold capitalize">
                {pagamento.provedor} · {pagamento.status}
              </div>
              <div className="mt-1 text-xs text-muted">{formatBRL(Number(pagamento.valor))}</div>
              {pagamento.mp_payment_id && (
                <div className="mt-1 truncate font-mono text-[11px] text-muted">
                  {pagamento.mp_payment_id}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted">Sem pagamento registrado.</div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">
            Total
          </h3>
          <div className="text-2xl font-extrabold text-primary">{formatBRL(pedido.total)}</div>
          <div className="mt-1 text-xs text-muted">{itens?.length ?? 0} ite{(itens?.length ?? 0) === 1 ? "m" : "ns"}</div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">
          Alterar status
        </h3>
        <StatusForm pedidoId={pedido.id} current={pedido.status} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">Itens & entrega</h2>
        <div className="flex flex-col gap-4">
          {(itens ?? []).map((it) => (
            <div key={it.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{it.nome_produto}</div>
                  <div className="mt-1 text-xs text-muted">
                    Qtd: {formatNumber(it.qtd)}
                    {it.link_alvo && <> • Alvo: <span className="font-mono text-foreground">{it.link_alvo}</span></>}
                  </div>
                </div>
                <div className="font-bold text-primary">{formatBRL(it.subtotal)}</div>
              </div>
              <DeliveryForm
                itemId={it.id}
                pedidoId={pedido.id}
                initial={it.conteudo_entregue}
                deliveredAt={it.entregue_em}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
