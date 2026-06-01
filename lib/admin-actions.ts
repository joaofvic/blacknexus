"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoriaTipo, ProdutoTipo } from "@/lib/database.types";

export type ActionState = { ok: boolean; message: string } | null;

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function fail(message: string): ActionState {
  return { ok: false, message };
}
function ok(message: string): ActionState {
  return { ok: true, message };
}

// ---------- Categorias ----------
export async function salvarCategoria(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || null;
  const payload = {
    nome: formData.get("nome") as string,
    slug: formData.get("slug") as string,
    tipo: formData.get("tipo") as CategoriaTipo,
    icone: (formData.get("icone") as string) || null,
    ordem: num(formData.get("ordem")) ?? 0,
    ativo: formData.get("ativo") === "on",
  };

  if (!payload.nome?.trim() || !payload.slug?.trim()) {
    return fail("Nome e slug são obrigatórios.");
  }

  const { error } = id
    ? await admin.from("categorias").update(payload).eq("id", id)
    : await admin.from("categorias").insert(payload);

  if (error) return fail(error.message);

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return ok(id ? "Categoria atualizada." : "Categoria criada.");
}

export async function excluirCategoria(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const { error } = await admin.from("categorias").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/categorias");
  return ok("Categoria removida.");
}

// ---------- Produtos ----------
export async function salvarProduto(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || null;
  const tipo = formData.get("tipo") as ProdutoTipo;

  const imagemUrl =
    (formData.get("imagem_url") as string) ||
    (formData.get("imagem_url_atual") as string) ||
    null;

  const payload = {
    categoria_id: (formData.get("categoria_id") as string) || null,
    nome: formData.get("nome") as string,
    slug: formData.get("slug") as string,
    descricao: (formData.get("descricao") as string) || null,
    imagem_url: imagemUrl,
    tipo,
    ativo: formData.get("ativo") === "on",
    destaque: formData.get("destaque") === "on",
    preco_por_mil: tipo === "servico" ? num(formData.get("preco_por_mil")) : null,
    qtd_min: tipo === "servico" ? num(formData.get("qtd_min")) : null,
    qtd_max: tipo === "servico" ? num(formData.get("qtd_max")) : null,
    rede_social: tipo === "servico" ? (formData.get("rede_social") as string) || null : null,
    preco: tipo === "assinatura" ? num(formData.get("preco")) : null,
    duracao: tipo === "assinatura" ? (formData.get("duracao") as string) || null : null,
    precisa_link: formData.get("precisa_link") === "on",
    preco_original: num(formData.get("preco_original")),
  };

  if (!payload.nome?.trim() || !payload.slug?.trim()) {
    return fail("Nome e slug são obrigatórios.");
  }

  const { error } = id
    ? await admin.from("produtos").update(payload).eq("id", id)
    : await admin.from("produtos").insert(payload);

  if (error) return fail(error.message);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  return ok(id ? "Produto atualizado." : "Produto criado.");
}

export async function excluirProduto(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const { error } = await admin.from("produtos").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/produtos");
  return ok("Produto removido.");
}

// ---------- Pedidos ----------
export async function atualizarStatusPedido(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("pedido_id") as string;
  const status = formData.get("status") as string;
  const { error } = await admin
    .from("pedidos")
    .update({ status: status as never, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
  return ok("Status atualizado.");
}

// ---------- Variantes ----------
export async function salvarVariante(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || null;
  const produtoId = formData.get("produto_id") as string;
  if (!produtoId) return fail("Produto inválido.");

  const nome = (formData.get("nome") as string)?.trim();
  if (!nome) return fail("Nome da variante é obrigatório.");

  const preco = num(formData.get("preco"));
  if (preco == null || preco <= 0) return fail("Preço inválido.");

  const payload = {
    produto_id: produtoId,
    nome,
    preco,
    preco_original: num(formData.get("preco_original")),
    duracao: ((formData.get("duracao") as string) || "").trim() || null,
    estoque: num(formData.get("estoque")),
    ordem: num(formData.get("ordem")) ?? 0,
    ativo: formData.get("ativo") === "on",
  };

  const { error } = id
    ? await admin.from("produto_variantes").update(payload).eq("id", id)
    : await admin.from("produto_variantes").insert(payload);

  if (error) return fail(error.message);

  revalidatePath("/admin/produtos");
  // revalida a página pública do produto
  const { data: prod } = await admin
    .from("produtos")
    .select("slug")
    .eq("id", produtoId)
    .single();
  if (prod?.slug) revalidatePath(`/produto/${prod.slug}`);

  return ok(id ? "Variante atualizada." : "Variante criada.");
}

export async function excluirVariante(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const { error } = await admin.from("produto_variantes").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/produtos");
  return ok("Variante removida.");
}

// ---------- Avaliações ----------
export async function salvarAvaliacaoFake(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || null;
  const produtoId = formData.get("produto_id") as string;
  if (!produtoId) return fail("Produto inválido.");

  const autor = (formData.get("autor_nome") as string)?.trim();
  if (!autor) return fail("Nome do autor é obrigatório.");

  const nota = num(formData.get("nota"));
  if (nota == null || nota < 1 || nota > 5) return fail("Nota deve ser entre 1 e 5.");

  const dataStr = (formData.get("created_at") as string) || "";
  const createdAt = dataStr ? new Date(dataStr).toISOString() : new Date().toISOString();

  const payload = {
    produto_id: produtoId,
    user_id: null,
    autor_nome: autor,
    nota: Math.trunc(nota),
    texto: ((formData.get("texto") as string) || "").trim() || null,
    e_fake: true,
    created_at: createdAt,
  };

  const { error } = id
    ? await admin.from("avaliacoes").update(payload).eq("id", id)
    : await admin.from("avaliacoes").insert(payload);

  if (error) return fail(error.message);

  revalidatePath("/admin/avaliacoes");
  const { data: prod } = await admin
    .from("produtos")
    .select("slug")
    .eq("id", produtoId)
    .single();
  if (prod?.slug) revalidatePath(`/produto/${prod.slug}`);

  return ok(id ? "Avaliação atualizada." : "Avaliação criada.");
}

export async function excluirAvaliacao(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;

  const { data: av } = await admin
    .from("avaliacoes")
    .select("produto_id")
    .eq("id", id)
    .single();

  const { error } = await admin.from("avaliacoes").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidatePath("/admin/avaliacoes");
  if (av?.produto_id) {
    const { data: prod } = await admin
      .from("produtos")
      .select("slug")
      .eq("id", av.produto_id)
      .single();
    if (prod?.slug) revalidatePath(`/produto/${prod.slug}`);
  }
  return ok("Avaliação removida.");
}

export async function entregarItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const admin = createAdminClient();
  const itemId = formData.get("item_id") as string;
  const pedidoId = formData.get("pedido_id") as string;
  const conteudo = (formData.get("conteudo_entregue") as string) || null;
  const { error } = await admin
    .from("pedido_itens")
    .update({
      conteudo_entregue: conteudo,
      entregue_em: conteudo ? new Date().toISOString() : null,
    })
    .eq("id", itemId);
  if (error) return fail(error.message);
  revalidatePath(`/admin/pedidos/${pedidoId}`);
  return ok(conteudo ? "Entrega registrada." : "Entrega limpa.");
}
