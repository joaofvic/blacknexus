"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { usuarioPodeAvaliar } from "@/lib/queries";

export type AvaliacaoActionState = { ok: boolean; message: string } | null;

export async function criarAvaliacao(
  _prev: AvaliacaoActionState,
  formData: FormData
): Promise<AvaliacaoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Faça login para avaliar." };

  const produtoId = (formData.get("produto_id") as string) || "";
  const slug = (formData.get("slug") as string) || "";
  if (!produtoId) return { ok: false, message: "Produto inválido." };

  const notaRaw = Number(formData.get("nota"));
  const nota = Number.isFinite(notaRaw) ? Math.trunc(notaRaw) : 0;
  if (nota < 1 || nota > 5) return { ok: false, message: "Escolha uma nota de 1 a 5." };

  const texto = ((formData.get("texto") as string) || "").trim() || null;

  const { pode, motivo } = await usuarioPodeAvaliar(produtoId);
  if (!pode) {
    const msg: Record<typeof motivo, string> = {
      nao_logado: "Faça login para avaliar.",
      nao_comprou: "Só quem comprou este produto pode avaliá-lo.",
      ja_avaliou: "Você já avaliou este produto.",
      ok: "",
    };
    return { ok: false, message: msg[motivo] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email")
    .eq("id", user.id)
    .single();
  const autor =
    (profile?.nome?.trim() || profile?.email?.split("@")[0] || "Cliente").slice(0, 80);

  const admin = createAdminClient();
  const { error } = await admin.from("avaliacoes").insert({
    produto_id: produtoId,
    user_id: user.id,
    autor_nome: autor,
    nota,
    texto,
    e_fake: false,
  });
  if (error) return { ok: false, message: error.message };

  if (slug) revalidatePath(`/produto/${slug}`);
  return { ok: true, message: "Avaliação enviada. Obrigado!" };
}
