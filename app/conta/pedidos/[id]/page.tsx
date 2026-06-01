import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, formatDate, formatNumber } from "@/lib/format";
import { StatusBadge } from "@/components/ui";

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/login?next=/conta/pedidos/${id}`);
  const supabase = await createClient();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("*")
    .eq("id", id)
    .single();

  if (!pedido) notFound();

  const { data: itens } = await supabase
    .from("pedido_itens")
    .select("*")
    .eq("pedido_id", id);

  const { data: pagamento } = await supabase
    .from("pagamentos")
    .select("qr_code, qr_code_base64, status")
    .eq("pedido_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/conta/pedidos" className="text-sm text-muted hover:text-foreground">
        ← Voltar aos pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold">#{pedido.id.slice(0, 8)}</h1>
          <p className="text-xs text-muted">{formatDate(pedido.created_at)}</p>
        </div>
        <StatusBadge status={pedido.status} />
      </div>

      {/* Pix pendente */}
      {pedido.status === "aguardando_pagamento" && pagamento?.qr_code_base64 && (
        <div className="card mt-6 flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-muted">Pagamento pendente. Pague o Pix abaixo:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${pagamento.qr_code_base64}`}
            alt="QR Code Pix"
            className="h-48 w-48 rounded-lg bg-white p-2"
          />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {(itens ?? []).map((it) => (
          <div key={it.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{it.nome_produto}</div>
              <div className="font-bold text-primary">{formatBRL(it.subtotal)}</div>
            </div>
            <div className="mt-1 text-xs text-muted">
              Qtd: {formatNumber(it.qtd)}
              {it.link_alvo && ` • Alvo: ${it.link_alvo}`}
            </div>

            {it.conteudo_entregue ? (
              <div className="mt-3 rounded-lg border border-success/40 bg-success/10 p-3">
                <div className="mb-1 text-xs font-semibold text-success">
                  ✅ Entrega
                </div>
                <pre className="whitespace-pre-wrap break-words text-sm">
                  {it.conteudo_entregue}
                </pre>
              </div>
            ) : (
              pedido.status !== "concluido" && (
                <p className="mt-3 text-xs text-muted">
                  {pedido.status === "aguardando_pagamento"
                    ? "Aguardando pagamento."
                    : "Em processamento — a entrega aparecerá aqui."}
                </p>
              )
            )}
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
