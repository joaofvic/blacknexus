import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPixPayment, createCardPayment, describeMpError } from "@/lib/mercadopago";
import { precoDoItem, validarQuantidade, exigeLink } from "@/lib/pricing";

interface ReqItem {
  produtoId: string;
  qtd: number;
  linkAlvo?: string | null;
  varianteId?: string | null;
}

interface CardPayload {
  cardToken: string;
  paymentMethodId: string;
  issuerId: string;
  installments: number;
  email: string;
  identificationType: string;
  identificationNumber: string;
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
  let body: { items?: ReqItem[]; method?: "pix" | "card"; whatsapp?: string } & Partial<CardPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
  const metodo = body.method ?? "pix";
  const reqItems = body.items ?? [];
  if (reqItems.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }

  // WhatsApp obrigatório (10 ou 11 dígitos BR — DDD + 8/9 dígitos).
  const whatsappDigits = (body.whatsapp ?? "").replace(/\D/g, "");
  if (whatsappDigits.length < 10 || whatsappDigits.length > 13) {
    return NextResponse.json({ error: "Informe um WhatsApp válido." }, { status: 400 });
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

  // Carrega variantes referenciadas
  const varianteIds = [...new Set(reqItems.map((i) => i.varianteId).filter(Boolean) as string[])];
  const variantesMap = new Map<string, { id: string; produto_id: string; nome: string; preco: number; estoque: number | null; ativo: boolean }>();
  if (varianteIds.length > 0) {
    const { data: vars } = await admin
      .from("produto_variantes")
      .select("id, produto_id, nome, preco, estoque, ativo")
      .in("id", varianteIds);
    for (const v of vars ?? []) variantesMap.set(v.id, v);
  }

  const itensCalculados: {
    produto_id: string;
    nome_produto: string;
    qtd: number;
    link_alvo: string | null;
    preco_unit: number;
    subtotal: number;
    variante_id: string | null;
    variante_nome: string | null;
  }[] = [];

  for (const item of reqItems) {
    const produto = produtos.find((p) => p.id === item.produtoId);
    if (!produto) {
      return NextResponse.json(
        { error: "Produto indisponível no carrinho." },
        { status: 400 }
      );
    }

    const variante = item.varianteId ? variantesMap.get(item.varianteId) ?? null : null;
    if (item.varianteId && (!variante || variante.produto_id !== produto.id || !variante.ativo)) {
      return NextResponse.json(
        { error: `${produto.nome}: variante indisponível.` },
        { status: 400 }
      );
    }
    if (variante && variante.estoque != null && variante.estoque <= 0) {
      return NextResponse.json(
        { error: `${produto.nome} · ${variante.nome}: sem estoque.` },
        { status: 400 }
      );
    }

    const qtd = variante || produto.tipo === "assinatura" ? 1 : Math.floor(item.qtd);

    if (
      variante &&
      variante.estoque != null &&
      variante.estoque < qtd
    ) {
      return NextResponse.json(
        {
          error: `${produto.nome} · ${variante.nome}: apenas ${variante.estoque} em estoque.`,
        },
        { status: 400 }
      );
    }
    if (!variante) {
      const erroQtd = validarQuantidade(produto, qtd);
      if (erroQtd) {
        return NextResponse.json({ error: `${produto.nome}: ${erroQtd}` }, { status: 400 });
      }
    }
    if (exigeLink(produto) && !item.linkAlvo?.trim()) {
      return NextResponse.json(
        { error: `${produto.nome}: informe o link/usuário.` },
        { status: 400 }
      );
    }
    const precoUnit = variante ? Number(variante.preco) : precoDoItem(produto, qtd);
    itensCalculados.push({
      produto_id: produto.id,
      nome_produto: variante ? `${produto.nome} · ${variante.nome}` : produto.nome,
      qtd,
      link_alvo: exigeLink(produto) ? item.linkAlvo!.trim() : null,
      preco_unit: precoUnit,
      subtotal: precoUnit,
      variante_id: variante?.id ?? null,
      variante_nome: variante?.nome ?? null,
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
    .insert({
      user_id: user.id,
      status: "aguardando_pagamento",
      total,
      whatsapp: whatsappDigits,
    })
    .select()
    .single();

  if (pedErr || !pedido) {
    return NextResponse.json({ error: "Erro ao criar pedido." }, { status: 500 });
  }

  // Se o profile do usuário não tem WhatsApp, preenche com o do pedido — não
  // sobrescreve um número já cadastrado.
  admin
    .from("profiles")
    .update({ whatsapp: whatsappDigits })
    .eq("id", user.id)
    .is("whatsapp", null)
    .then(() => { /* best-effort, ignora erros */ });

  const { error: itensErr } = await admin
    .from("pedido_itens")
    .insert(itensCalculados.map((i) => ({ ...i, pedido_id: pedido.id })));

  if (itensErr) {
    await admin.from("pedidos").delete().eq("id", pedido.id);
    return NextResponse.json({ error: "Erro ao salvar itens." }, { status: 500 });
  }

  // 5) Gera pagamento
  if (metodo === "card") {
    const { cardToken, paymentMethodId, issuerId, installments, email, identificationType, identificationNumber } = body;
    if (!cardToken || !paymentMethodId) {
      await admin.from("pedidos").delete().eq("id", pedido.id);
      return NextResponse.json({ error: "Dados do cartão incompletos." }, { status: 400 });
    }
    try {
      const card = await createCardPayment({
        amount: total,
        description: `Pedido BlackNexus ${pedido.id.slice(0, 8)}`,
        token: cardToken,
        paymentMethodId,
        issuerId: issuerId ?? "",
        installments: Number(installments) || 1,
        email: email ?? user.email ?? "comprador@blacknexus.com",
        identificationType: identificationType ?? "CPF",
        identificationNumber: identificationNumber ?? "",
        externalReference: pedido.id,
      });

      await admin.from("pagamentos").insert({
        pedido_id: pedido.id,
        provedor: "mercadopago",
        mp_payment_id: card.mpPaymentId,
        status: card.status,
        valor: total,
        qr_code: null,
        qr_code_base64: null,
        ticket_url: null,
        expira_em: null,
      });

      if (card.status === "approved") {
        await admin.from("pedidos").update({ status: "pago" }).eq("id", pedido.id);
      } else if (card.status === "rejected" || card.status === "cancelled") {
        await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedido.id);
        const msg = card.statusDetail === "cc_rejected_insufficient_amount"
          ? "Saldo insuficiente."
          : card.statusDetail === "cc_rejected_bad_filled_security_code"
          ? "CVV incorreto."
          : "Cartão recusado. Verifique os dados ou tente outro cartão.";
        return NextResponse.json({ error: msg }, { status: 402 });
      }

      return NextResponse.json({
        pedidoId: pedido.id,
        total,
        method: "card",
        status: card.status,
        statusDetail: card.statusDetail,
      });
    } catch (e) {
      const mpError = describeMpError(e);
      console.error("Erro Mercado Pago (card):", mpError, e);
      await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedido.id);
      return NextResponse.json(
        { error: "Não foi possível processar o pagamento. Tente novamente.", detail: mpError },
        { status: 502 }
      );
    }
  }

  // Pix
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
      method: "pix",
      qrCode: pix.qrCode,
      qrCodeBase64: pix.qrCodeBase64,
      ticketUrl: pix.ticketUrl,
    });
  } catch (e) {
    const mpError = describeMpError(e);
    console.error("Erro Mercado Pago (pix):", mpError, e);
    await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedido.id);
    return NextResponse.json(
      { error: "Não foi possível gerar o Pix. Tente novamente.", detail: mpError },
      { status: 502 }
    );
  }
}
