import { createClient } from "@/lib/supabase/server";
import type { Categoria, Produto } from "@/lib/database.types";

// Indica se o Supabase está configurado (evita erros quando .env ainda está vazio).
function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getCategorias(): Promise<Categoria[]> {
  if (!supabaseConfigurado()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categorias")
      .select("*")
      .eq("ativo", true)
      .order("ordem");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getCategoriaBySlug(slug: string): Promise<Categoria | null> {
  if (!supabaseConfigurado()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categorias")
      .select("*")
      .eq("slug", slug)
      .eq("ativo", true)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getProdutosByCategoria(categoriaId: string): Promise<Produto[]> {
  if (!supabaseConfigurado()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("categoria_id", categoriaId)
      .eq("ativo", true)
      .order("destaque", { ascending: false })
      .order("nome");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getProdutosDestaque(limit = 8): Promise<Produto[]> {
  if (!supabaseConfigurado()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .eq("destaque", true)
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getProdutoBySlug(slug: string): Promise<Produto | null> {
  if (!supabaseConfigurado()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("slug", slug)
      .eq("ativo", true)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}
