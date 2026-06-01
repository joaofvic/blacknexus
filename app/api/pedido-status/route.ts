import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Retorna o status do pedido (somente do dono — protegido por RLS).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pedidoId = searchParams.get("pedidoId");
  if (!pedidoId) {
    return NextResponse.json({ error: "pedidoId obrigatório." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { data } = await supabase
    .from("pedidos")
    .select("status")
    .eq("id", pedidoId)
    .single();

  if (!data) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json({ status: data.status });
}
