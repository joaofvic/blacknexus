import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ReqItem {
  produtoId: string;
  varianteId?: string | null;
  qtd?: number;
}

export async function POST(req: Request) {
  let body: { items?: ReqItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const items = body.items ?? [];
  if (items.length === 0) {
    return NextResponse.json({ unavailable: [] });
  }

  const admin = createAdminClient();
  const produtoIds = [...new Set(items.map((i) => i.produtoId))];
  const varianteIds = [
    ...new Set(items.map((i) => i.varianteId).filter(Boolean) as string[]),
  ];

  const { data: produtos } = await admin
    .from("produtos")
    .select("id, ativo")
    .in("id", produtoIds);

  const produtosAtivos = new Set(
    (produtos ?? []).filter((p) => p.ativo).map((p) => p.id)
  );

  const variantesMap = new Map<
    string,
    { id: string; estoque: number | null; ativo: boolean }
  >();
  if (varianteIds.length > 0) {
    const { data: vars } = await admin
      .from("produto_variantes")
      .select("id, estoque, ativo")
      .in("id", varianteIds);
    for (const v of vars ?? []) variantesMap.set(v.id, v);
  }

  const unavailable: string[] = [];
  for (const item of items) {
    if (!produtosAtivos.has(item.produtoId)) {
      unavailable.push(item.varianteId ?? item.produtoId);
      continue;
    }
    if (item.varianteId) {
      const v = variantesMap.get(item.varianteId);
      const semEstoque =
        !v ||
        !v.ativo ||
        (v.estoque != null && v.estoque <= 0) ||
        (v.estoque != null && item.qtd != null && v.estoque < item.qtd);
      if (semEstoque) unavailable.push(item.varianteId);
    }
  }

  return NextResponse.json({ unavailable });
}
