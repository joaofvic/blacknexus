"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoriaTipo, ProdutoTipo } from "@/lib/database.types";

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// ---------- Categorias ----------
export async function salvarCategoria(formData: FormData) {
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

  if (id) {
    await admin.from("categorias").update(payload).eq("id", id);
  } else {
    await admin.from("categorias").insert(payload);
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function excluirCategoria(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  await admin.from("categorias").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}

// ---------- Produtos ----------
export async function salvarProduto(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || null;
  const tipo = formData.get("tipo") as ProdutoTipo;

  // Upload de imagem (opcional)
  let imagemUrl = (formData.get("imagem_url_atual") as string) || null;
  const file = formData.get("imagem") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() || "png";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await admin.storage
      .from("produtos")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (!error) {
      const { data } = admin.storage.from("produtos").getPublicUrl(path);
      imagemUrl = data.publicUrl;
    }
  }

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

  if (id) {
    await admin.from("produtos").update(payload).eq("id", id);
  } else {
    await admin.from("produtos").insert(payload);
  }
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function excluirProduto(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  await admin.from("produtos").delete().eq("id", id);
  revalidatePath("/admin/produtos");
}

// ---------- Pedidos ----------
export async function atualizarStatusPedido(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("pedido_id") as string;
  const status = formData.get("status") as string;
  await admin
    .from("pedidos")
    .update({ status: status as never, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
}

export async function entregarItem(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const itemId = formData.get("item_id") as string;
  const pedidoId = formData.get("pedido_id") as string;
  const conteudo = (formData.get("conteudo_entregue") as string) || null;
  await admin
    .from("pedido_itens")
    .update({
      conteudo_entregue: conteudo,
      entregue_em: conteudo ? new Date().toISOString() : null,
    })
    .eq("id", itemId);
  revalidatePath(`/admin/pedidos/${pedidoId}`);
}
