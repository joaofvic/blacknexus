import { createClient } from "@/lib/supabase/server";
import type {
  Avaliacao,
  Categoria,
  Produto,
  ProdutoVariante,
} from "@/lib/database.types";

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

export async function getProdutosByCategoriaSlug(
  slug: string,
  limit = 8
): Promise<Produto[]> {
  if (!supabaseConfigurado()) return [];
  try {
    const supabase = await createClient();
    const { data: cat } = await supabase
      .from("categorias")
      .select("id")
      .eq("slug", slug)
      .eq("ativo", true)
      .single();
    if (!cat) return [];
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("categoria_id", cat.id)
      .eq("ativo", true)
      .order("destaque", { ascending: false })
      .order("nome")
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function searchProdutos(q: string, limit = 48): Promise<Produto[]> {
  if (!supabaseConfigurado()) return [];
  const termo = q.trim();
  if (!termo) return [];
  try {
    const supabase = await createClient();
    const padrao = `%${termo}%`;
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .or(`nome.ilike.${padrao},descricao.ilike.${padrao},rede_social.ilike.${padrao}`)
      .order("destaque", { ascending: false })
      .order("nome")
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

// ============================================================
//  Variantes
// ============================================================

export async function getVariantesByProdutoId(
  produtoId: string
): Promise<ProdutoVariante[]> {
  if (!supabaseConfigurado()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("produto_variantes")
      .select("*")
      .eq("produto_id", produtoId)
      .eq("ativo", true)
      .order("ordem")
      .order("preco");
    return data ?? [];
  } catch {
    return [];
  }
}

// ============================================================
//  Avaliações
// ============================================================

export type AvaliacaoPublica = Pick<
  Avaliacao,
  "id" | "autor_nome" | "nota" | "texto" | "created_at"
>;

export async function getAvaliacoesByProdutoId(
  produtoId: string,
  limit = 50
): Promise<AvaliacaoPublica[]> {
  if (!supabaseConfigurado()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("avaliacoes")
      .select("id, autor_nome, nota, texto, created_at")
      .eq("produto_id", produtoId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as AvaliacaoPublica[];
  } catch {
    return [];
  }
}

export type ResumoAvaliacoes = {
  media: number;
  total: number;
  distribuicao: Record<1 | 2 | 3 | 4 | 5, number>;
};

export async function getResumoAvaliacoes(
  produtoId: string
): Promise<ResumoAvaliacoes> {
  const zero: ResumoAvaliacoes = {
    media: 0,
    total: 0,
    distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
  if (!supabaseConfigurado()) return zero;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("avaliacoes")
      .select("nota")
      .eq("produto_id", produtoId);
    const rows = data ?? [];
    if (!rows.length) return zero;
    const dist: ResumoAvaliacoes["distribuicao"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let soma = 0;
    for (const r of rows) {
      const n = Math.min(5, Math.max(1, Math.trunc(r.nota))) as 1 | 2 | 3 | 4 | 5;
      dist[n] += 1;
      soma += n;
    }
    return {
      media: Math.round((soma / rows.length) * 10) / 10,
      total: rows.length,
      distribuicao: dist,
    };
  } catch {
    return zero;
  }
}

// Verifica se o usuário logado pode avaliar o produto.
// Regra: precisa ter pedido em pago/em_andamento/concluido com esse produto, e ainda não ter avaliado.
export async function usuarioPodeAvaliar(
  produtoId: string
): Promise<{ pode: boolean; motivo: "nao_logado" | "nao_comprou" | "ja_avaliou" | "ok" }> {
  if (!supabaseConfigurado()) return { pode: false, motivo: "nao_logado" };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { pode: false, motivo: "nao_logado" };

    const { data: existente } = await supabase
      .from("avaliacoes")
      .select("id")
      .eq("produto_id", produtoId)
      .eq("user_id", user.id)
      .limit(1);
    if ((existente ?? []).length > 0) return { pode: false, motivo: "ja_avaliou" };

    const { data: itens } = await supabase
      .from("pedido_itens")
      .select("pedido_id, pedidos!inner(user_id, status)")
      .eq("produto_id", produtoId)
      .eq("pedidos.user_id", user.id)
      .in("pedidos.status", ["pago", "em_andamento", "concluido"])
      .limit(1);
    if ((itens ?? []).length === 0) return { pode: false, motivo: "nao_comprou" };

    return { pode: true, motivo: "ok" };
  } catch {
    return { pode: false, motivo: "nao_logado" };
  }
}

// Produtos relacionados: prioriza mesma categoria; completa com destaques/recentes.
export async function getProdutosRelacionados(
  produto: Produto,
  limit = 4
): Promise<Produto[]> {
  if (!supabaseConfigurado()) return [];
  try {
    const supabase = await createClient();
    const acumulado: Produto[] = [];
    const vistos = new Set<string>([produto.id]);

    if (produto.categoria_id) {
      const { data } = await supabase
        .from("produtos")
        .select("*")
        .eq("categoria_id", produto.categoria_id)
        .eq("ativo", true)
        .neq("id", produto.id)
        .order("destaque", { ascending: false })
        .order("nome")
        .limit(limit);
      for (const p of data ?? []) {
        if (!vistos.has(p.id)) {
          acumulado.push(p);
          vistos.add(p.id);
        }
      }
    }

    if (acumulado.length < limit) {
      const { data } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("destaque", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit + vistos.size);
      for (const p of data ?? []) {
        if (acumulado.length >= limit) break;
        if (!vistos.has(p.id)) {
          acumulado.push(p);
          vistos.add(p.id);
        }
      }
    }

    return acumulado;
  } catch {
    return [];
  }
}
