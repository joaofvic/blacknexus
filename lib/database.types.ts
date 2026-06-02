// Tipos do banco (mantidos manualmente — espelham supabase/migrations/0001_init.sql).
// Após criar o projeto Supabase, você pode regenerar com:
//   npx supabase gen types typescript --project-id SEU_ID > lib/database.types.ts

export type CategoriaTipo = "streaming" | "social" | "variedades";
export type ProdutoTipo = "servico" | "assinatura";
export type PedidoStatus =
  | "aguardando_pagamento"
  | "pago"
  | "em_andamento"
  | "concluido"
  | "cancelado";

export type Profile = {
  id: string;
  nome: string | null;
  email: string | null;
  whatsapp: string | null;
  role: "cliente" | "admin";
  created_at: string;
}

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  tipo: CategoriaTipo;
  icone: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export type Produto = {
  id: string;
  categoria_id: string | null;
  nome: string;
  slug: string;
  descricao: string | null;
  imagem_url: string | null;
  tipo: ProdutoTipo;
  ativo: boolean;
  destaque: boolean;
  preco_por_mil: number | null;
  qtd_min: number | null;
  qtd_max: number | null;
  rede_social: string | null;
  preco: number | null;
  duracao: string | null;
  precisa_link: boolean;
  preco_original: number | null;
  created_at: string;
}

export type Pedido = {
  id: string;
  user_id: string;
  status: PedidoStatus;
  total: number;
  whatsapp: string | null;
  created_at: string;
  updated_at: string;
}

export type PedidoItem = {
  id: string;
  pedido_id: string;
  produto_id: string | null;
  nome_produto: string;
  qtd: number;
  link_alvo: string | null;
  preco_unit: number;
  subtotal: number;
  conteudo_entregue: string | null;
  entregue_em: string | null;
  variante_id: string | null;
  variante_nome: string | null;
}

export type ProdutoVariante = {
  id: string;
  produto_id: string;
  nome: string;
  preco: number;
  preco_original: number | null;
  duracao: string | null;
  estoque: number | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export type Avaliacao = {
  id: string;
  produto_id: string;
  user_id: string | null;
  autor_nome: string;
  nota: number;
  texto: string | null;
  e_fake: boolean;
  created_at: string;
}

export type Pagamento = {
  id: string;
  pedido_id: string;
  provedor: string;
  mp_payment_id: string | null;
  status: string;
  qr_code: string | null;
  qr_code_base64: string | null;
  ticket_url: string | null;
  valor: number;
  expira_em: string | null;
  created_at: string;
}

// Tipo Database para tipar o cliente Supabase (formato compatível com @supabase/supabase-js).
type TableDef<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      categorias: TableDef<Categoria>;
      produtos: TableDef<Produto>;
      produto_variantes: TableDef<ProdutoVariante>;
      avaliacoes: TableDef<Avaliacao>;
      pedidos: TableDef<Pedido>;
      pedido_itens: TableDef<PedidoItem>;
      pagamentos: TableDef<Pagamento>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      categoria_tipo: CategoriaTipo;
      produto_tipo: ProdutoTipo;
      pedido_status: PedidoStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
