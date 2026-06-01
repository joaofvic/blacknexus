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
