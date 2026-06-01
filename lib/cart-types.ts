// Item do carrinho (persistido em localStorage).
export interface CartItem {
  produtoId: string;
  slug: string;
  nome: string;
  tipo: "servico" | "assinatura";
  imagemUrl: string | null;
  qtd: number;
  linkAlvo: string | null;
  precoUnit: number; // informativo; o servidor recalcula no checkout
  subtotal: number;
}
