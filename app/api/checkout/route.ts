import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPixPayment } from "@/lib/mercadopago";
import { precoDoItem, validarQuantidade, exigeLink } from "@/lib/pricing";

interface ReqItem {
  produtoId: string;
  qtd: number;
  linkAlvo?: string | null;
}

export async function POST(req: Request) {
  // 1) Autenticação
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login para finalizar." }, { status: 401 });
  }

  // 2) Payload
  let body: { items?: ReqItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
  const reqItems = body.items ?? [];
  if (reqItems.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 3) Busca produtos reais e RECALCULA preços (nunca confia no cliente)
  const ids = [...new Set(reqItems.map((i) => i.produtoId))];
  const { data: produtos, error: prodErr } = await admin
    .from("produtos")
    .select("*")
    .in("id", ids)
    .eq("ativo", true);

  if (prodErr || !produtos) {
    return NextResponse.json({ error: "Erro ao validar produtos." }, { status: 500 });
  }

  const itensCalculados: {
    produto_id: string;
    nome_produto: string;
    qtd: number;
    link_alvo: string | null;
    preco_unit: number;
    subtotal: number;
  }[] = [];

  for (const item of reqItems) {
    const produto = produtos.find((p) => p.id === item.produtoId);
    if (!produto) {
      return NextResponse.json(
        { error: "Produto indisponível no carrinho." },
        { status: 400 }
      );
    }
    const qtd = produto.tipo === "assinatura" ? 1 : Math.floor(item.qtd);
    const erroQtd = validarQuantidade(produto, qtd);
    if (erroQtd) {
      return NextResponse.json({ error: `${produto.nome}: ${erroQtd}` }, { status: 400 });
    }
    if (exigeLink(produto) && !item.linkAlvo?.trim()) {
      return NextResponse.json(
        { error: `${produto.nome}: informe o link/usuário.` },
        { status: 400 }
      );
    }
    const precoUnit = precoDoItem(produto, qtd);
    itensCalculados.push({
      produto_id: produto.id,
      nome_produto: produto.nome,
      qtd,
      link_alvo: exigeLink(produto) ? item.linkAlvo!.trim() : null,
      preco_unit: precoUnit,
      subtotal: precoUnit,
    });
  }

  const total = Math.round(
    itensCalculados.reduce((s, i) => s + i.subtotal, 0) * 100
  ) / 100;

  if (total <= 0) {
    return NextResponse.json({ error: "Total inválido." }, { status: 400 });
  }

  // 4) Cria pedido + itens
  const { data: pedido, error: pedErr } = await admin
    .from("pedidos")
    .insert({ user_id: user.id, status: "aguardando_pagamento", total })
    .select()
    .single();

  if (pedErr || !pedido) {
    return NextResponse.json({ error: "Erro ao criar pedido." }, { status: 500 });
  }

  const { error: itensErr } = await admin
    .from("pedido_itens")
    .insert(itensCalculados.map((i) => ({ ...i, pedido_id: pedido.id })));

  if (itensErr) {
    await admin.from("pedidos").delete().eq("id", pedido.id);
    return NextResponse.json({ error: "Erro ao salvar itens." }, { status: 500 });
  }

  // 5) Gera pagamento Pix
  try {
    const pix = await createPixPayment({
      amount: total,
      description: `Pedido BlackNexus ${pedido.id.slice(0, 8)}`,
      email: user.email ?? "comprador@blacknexus.com",
      externalReference: pedido.id,
    });

    await admin.from("pagamentos").insert({
      pedido_id: pedido.id,
      provedor: "mercadopago",
      mp_payment_id: pix.mpPaymentId,
      status: pix.status,
      qr_code: pix.qrCode,
      qr_code_base64: pix.qrCodeBase64,
      ticket_url: pix.ticketUrl,
      valor: total,
      expira_em: pix.expiresAt,
    });

    return NextResponse.json({
      pedidoId: pedido.id,
      total,
      qrCode: pix.qrCode,
      qrCodeBase64: pix.qrCodeBase64,
      ticketUrl: pix.ticketUrl,
    });
  } catch (e) {
    console.error("Erro Mercado Pago:", e);
    await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedido.id);
    return NextResponse.json(
      { error: "Não foi possível gerar o Pix. Tente novamente." },
      { status: 502 }
    );
  }
}
