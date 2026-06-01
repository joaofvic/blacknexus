import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Pedido, PedidoStatus, Produto, Categoria, Profile } from "@/lib/database.types";

// ============================================================
//  KPIs
// ============================================================

export type Kpis = {
  receitaMes: number;
  receitaMesDelta: number; // %
  pedidosHoje: number;
  pedidosHojeDelta: number;
  pendentes: number;
  ticketMedio: number;
  ticketMedioDelta: number;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function deltaPct(curr: number, prev: number): number {
  if (prev <= 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

export async function getKpis(): Promise<Kpis> {
  const admin = createAdminClient();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const [mesAtual, mesAnterior, hoje, ontem, pendentesRes] = await Promise.all([
    admin
      .from("pedidos")
      .select("total")
      .eq("status", "concluido")
      .gte("created_at", monthStart.toISOString()),
    admin
      .from("pedidos")
      .select("total")
      .eq("status", "concluido")
      .gte("created_at", prevMonthStart.toISOString())
      .lt("created_at", monthStart.toISOString()),
    admin
      .from("pedidos")
      .select("id, total", { count: "exact" })
      .gte("created_at", todayStart.toISOString()),
    admin
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterdayStart.toISOString())
      .lt("created_at", todayStart.toISOString()),
    admin
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .in("status", ["pago", "em_andamento"]),
  ]);

  const receitaMes = (mesAtual.data ?? []).reduce((s, p) => s + Number(p.total), 0);
  const receitaMesAnterior = (mesAnterior.data ?? []).reduce((s, p) => s + Number(p.total), 0);
  const pedidosHoje = hoje.count ?? 0;
  const pedidosOntem = ontem.count ?? 0;

  const ticketMesValues = (mesAtual.data ?? []).map((p) => Number(p.total));
  const ticketAnteriorValues = (mesAnterior.data ?? []).map((p) => Number(p.total));
  const ticketMedio = ticketMesValues.length
    ? ticketMesValues.reduce((a, b) => a + b, 0) / ticketMesValues.length
    : 0;
  const ticketAnterior = ticketAnteriorValues.length
    ? ticketAnteriorValues.reduce((a, b) => a + b, 0) / ticketAnteriorValues.length
    : 0;

  return {
    receitaMes,
    receitaMesDelta: deltaPct(receitaMes, receitaMesAnterior),
    pedidosHoje,
    pedidosHojeDelta: deltaPct(pedidosHoje, pedidosOntem),
    pendentes: pendentesRes.count ?? 0,
    ticketMedio,
    ticketMedioDelta: deltaPct(ticketMedio, ticketAnterior),
  };
}

// ============================================================
//  Gráfico de receita 14 dias
// ============================================================

export type RevenuePoint = { date: string; label: string; total: number };

export async function getRevenueLast14Days(): Promise<RevenuePoint[]> {
  const admin = createAdminClient();
  const now = new Date();
  const start = startOfDay(new Date(now));
  start.setDate(start.getDate() - 13);

  const { data } = await admin
    .from("pedidos")
    .select("total, created_at, status")
    .gte("created_at", start.toISOString())
    .in("status", ["pago", "em_andamento", "concluido"]);

  const buckets = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of data ?? []) {
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + Number(row.total));
  }
  return [...buckets.entries()].map(([date, total]) => {
    const d = new Date(date + "T12:00:00");
    return {
      date,
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      total,
    };
  });
}

// ============================================================
//  Fila urgente / Recentes / Top produtos
// ============================================================

export type QueueOrder = Pick<Pedido, "id" | "status" | "total" | "created_at"> & {
  cliente: string | null;
};

export async function getUrgentQueue(limit = 5): Promise<QueueOrder[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pedidos")
    .select("id, status, total, created_at, user_id")
    .eq("status", "pago")
    .order("created_at", { ascending: true })
    .limit(limit);

  const rows = data ?? [];
  if (!rows.length) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nome, email")
    .in("id", userIds);
  const map = new Map<string, { nome: string | null; email: string | null }>(
    (profiles ?? []).map((p) => [p.id, { nome: p.nome, email: p.email }])
  );

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    total: Number(r.total),
    created_at: r.created_at,
    cliente: map.get(r.user_id)?.nome ?? map.get(r.user_id)?.email ?? null,
  }));
}

export async function getRecentOrders(limit = 8): Promise<QueueOrder[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pedidos")
    .select("id, status, total, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = data ?? [];
  if (!rows.length) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nome, email")
    .in("id", userIds);
  const map = new Map<string, { nome: string | null; email: string | null }>(
    (profiles ?? []).map((p) => [p.id, { nome: p.nome, email: p.email }])
  );

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    total: Number(r.total),
    created_at: r.created_at,
    cliente: map.get(r.user_id)?.nome ?? map.get(r.user_id)?.email ?? null,
  }));
}

export type TopProduct = {
  produto_id: string;
  nome: string;
  qtd: number;
  receita: number;
};

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const admin = createAdminClient();
  const now = new Date();
  const since = startOfDay(new Date(now));
  since.setDate(since.getDate() - 30);

  const { data } = await admin
    .from("pedido_itens")
    .select("produto_id, nome_produto, qtd, subtotal, pedido_id");

  // Filtra por pedidos pagos/concluídos nos últimos 30d
  const itens = data ?? [];
  if (!itens.length) return [];

  const pedidoIds = [...new Set(itens.map((i) => i.pedido_id))];
  const { data: pedidos } = await admin
    .from("pedidos")
    .select("id, status, created_at")
    .in("id", pedidoIds)
    .gte("created_at", since.toISOString())
    .in("status", ["pago", "em_andamento", "concluido"]);

  const valid = new Set((pedidos ?? []).map((p) => p.id));
  const agg = new Map<string, TopProduct>();
  for (const it of itens) {
    if (!it.produto_id || !valid.has(it.pedido_id)) continue;
    const cur = agg.get(it.produto_id) ?? {
      produto_id: it.produto_id,
      nome: it.nome_produto,
      qtd: 0,
      receita: 0,
    };
    cur.qtd += Number(it.qtd);
    cur.receita += Number(it.subtotal);
    agg.set(it.produto_id, cur);
  }
  return [...agg.values()]
    .sort((a, b) => b.receita - a.receita)
    .slice(0, limit);
}

// ============================================================
//  Listas paginadas
// ============================================================

export type PageQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 20;

function clampPage(p?: number) {
  return Math.max(1, Number.isFinite(p) ? Math.trunc(p ?? 1) : 1);
}

export type PedidoRow = QueueOrder;

export async function getPedidosPaginated(
  args: PageQuery & { status?: string; dias?: string }
): Promise<{ rows: PedidoRow[]; total: number; page: number; pageSize: number }> {
  const admin = createAdminClient();
  const page = clampPage(args.page);
  const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("pedidos")
    .select("id, status, total, created_at, user_id", { count: "exact" })
    .order("created_at", { ascending: false });

  if (args.status) {
    query = query.eq("status", args.status as PedidoStatus);
  }
  if (args.dias) {
    const days = Number(args.dias);
    if (Number.isFinite(days) && days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      query = query.gte("created_at", since.toISOString());
    }
  }
  if (args.q) {
    const trimmed = args.q.trim();
    if (trimmed) query = query.ilike("id", `${trimmed}%`);
  }

  const { data, count } = await query.range(from, to);
  const rows = data ?? [];
  if (!rows.length) return { rows: [], total: count ?? 0, page, pageSize };

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nome, email")
    .in("id", userIds);
  const map = new Map<string, { nome: string | null; email: string | null }>(
    (profiles ?? []).map((p) => [p.id, { nome: p.nome, email: p.email }])
  );

  return {
    rows: rows.map((r) => ({
      id: r.id,
      status: r.status,
      total: Number(r.total),
      created_at: r.created_at,
      cliente: map.get(r.user_id)?.nome ?? map.get(r.user_id)?.email ?? null,
    })),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export type ProdutoRow = Produto & { categoria_nome: string | null };

export async function getProdutosPaginated(
  args: PageQuery & { categoria?: string; tipo?: string; ativo?: string }
): Promise<{ rows: ProdutoRow[]; total: number; page: number; pageSize: number; categorias: Categoria[] }> {
  const admin = createAdminClient();
  const page = clampPage(args.page);
  const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("produtos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (args.categoria) query = query.eq("categoria_id", args.categoria);
  if (args.tipo) query = query.eq("tipo", args.tipo as Produto["tipo"]);
  if (args.ativo === "true") query = query.eq("ativo", true);
  if (args.ativo === "false") query = query.eq("ativo", false);
  if (args.q?.trim()) query = query.ilike("nome", `%${args.q.trim()}%`);

  const [{ data, count }, { data: cats }] = await Promise.all([
    query.range(from, to),
    admin.from("categorias").select("*").order("ordem"),
  ]);

  const categorias = cats ?? [];
  const catMap = new Map(categorias.map((c) => [c.id, c.nome]));
  const rows = (data ?? []).map((p) => ({
    ...p,
    categoria_nome: p.categoria_id ? catMap.get(p.categoria_id) ?? null : null,
  }));

  return { rows, total: count ?? 0, page, pageSize, categorias };
}

export async function getCategoriasPaginated(
  args: PageQuery & { tipo?: string }
): Promise<{ rows: Categoria[]; total: number; page: number; pageSize: number }> {
  const admin = createAdminClient();
  const page = clampPage(args.page);
  const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("categorias")
    .select("*", { count: "exact" })
    .order("ordem");

  if (args.tipo) query = query.eq("tipo", args.tipo as Categoria["tipo"]);
  if (args.q?.trim()) query = query.ilike("nome", `%${args.q.trim()}%`);

  const { data, count } = await query.range(from, to);
  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getUsuariosPaginated(
  args: PageQuery & { role?: string }
): Promise<{ rows: Profile[]; total: number; page: number; pageSize: number }> {
  const admin = createAdminClient();
  const page = clampPage(args.page);
  const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (args.role) query = query.eq("role", args.role as Profile["role"]);
  if (args.q?.trim()) {
    const term = args.q.trim();
    query = query.or(`nome.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data, count } = await query.range(from, to);
  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}
