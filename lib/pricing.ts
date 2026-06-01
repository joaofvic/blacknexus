import type { Produto } from "@/lib/database.types";

// Calcula o preço unitário de um produto para uma dada quantidade.
// Serviço SMM: preco_por_mil * qtd / 1000. Assinatura: preço fixo.
export function precoDoItem(produto: Produto, qtd: number): number {
  if (produto.tipo === "servico") {
    const porMil = produto.preco_por_mil ?? 0;
    return Math.round(((porMil * qtd) / 1000) * 100) / 100;
  }
  return produto.preco ?? 0;
}

// Valida a quantidade conforme o tipo de produto. Retorna mensagem de erro ou null.
export function validarQuantidade(produto: Produto, qtd: number): string | null {
  if (produto.tipo === "assinatura") {
    return qtd === 1 ? null : "Assinatura tem quantidade fixa de 1.";
  }
  if (!Number.isInteger(qtd) || qtd <= 0) return "Quantidade inválida.";
  if (produto.qtd_min != null && qtd < produto.qtd_min)
    return `Quantidade mínima: ${produto.qtd_min}.`;
  if (produto.qtd_max != null && qtd > produto.qtd_max)
    return `Quantidade máxima: ${produto.qtd_max}.`;
  return null;
}

// Indica se o produto exige link/usuário alvo do cliente.
export function exigeLink(produto: Produto): boolean {
  return produto.tipo === "servico" || produto.precisa_link;
}

// Preço "atual" de referência do produto (por mil para serviço, fixo para assinatura).
export function precoBase(produto: Produto): number {
  return (produto.tipo === "servico" ? produto.preco_por_mil : produto.preco) ?? 0;
}

// Percentual de desconto a partir do preço original. Retorna 0 se não houver promo.
export function descontoPct(produto: Produto): number {
  const original = produto.preco_original ?? 0;
  const atual = precoBase(produto);
  if (original <= 0 || atual <= 0 || original <= atual) return 0;
  return Math.round(((original - atual) / original) * 100);
}
