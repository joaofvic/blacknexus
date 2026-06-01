import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentStatus } from "@/lib/mercadopago";

// Webhook do Mercado Pago. Recebe a notificação, consulta o pagamento na API
// (fonte da verdade) e atualiza o status do pedido.
export async function POST(req: Request) {
  let payload: { type?: string; action?: string; data?: { id?: string } };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Só nos interessa evento de pagamento.
  const isPayment =
    payload.type === "payment" || payload.action?.startsWith("payment.");
  const mpPaymentId = payload.data?.id;

  if (!isPayment || !mpPaymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { status, externalReference } = await getPaymentStatus(String(mpPaymentId));
    const admin = createAdminClient();

    // Atualiza o registro de pagamento.
    await admin
      .from("pagamentos")
      .update({ status })
      .eq("mp_payment_id", String(mpPaymentId));

    // Resolve o pedido por external_reference (id do pedido) ou pelo pagamento.
    let pedidoId = externalReference;
    if (!pedidoId) {
      const { data: pag } = await admin
        .from("pagamentos")
        .select("pedido_id")
        .eq("mp_payment_id", String(mpPaymentId))
        .single();
      pedidoId = pag?.pedido_id ?? null;
    }

    if (pedidoId) {
      if (status === "approved") {
        await admin
          .from("pedidos")
          .update({ status: "pago", updated_at: new Date().toISOString() })
          .eq("id", pedidoId)
          .eq("status", "aguardando_pagamento");
      } else if (status === "cancelled" || status === "rejected") {
        await admin
          .from("pedidos")
          .update({ status: "cancelado", updated_at: new Date().toISOString() })
          .eq("id", pedidoId)
          .eq("status", "aguardando_pagamento");
      }
    }
  } catch (e) {
    console.error("Erro no webhook MP:", e);
    // Retorna 200 mesmo assim para o MP não reenviar em loop indefinido;
    // a reconciliação pode ser feita por polling/consulta manual.
  }

  return NextResponse.json({ ok: true });
}

// O Mercado Pago às vezes valida o endpoint com GET.
export async function GET() {
  return NextResponse.json({ ok: true });
}
