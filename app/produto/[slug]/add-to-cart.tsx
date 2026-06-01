"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Produto } from "@/lib/database.types";
import { precoDoItem, validarQuantidade, exigeLink } from "@/lib/pricing";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/components/cart-provider";
import { Button, Input, Label } from "@/components/ui";

export function AddToCart({ produto }: { produto: Produto }) {
  const router = useRouter();
  const { addItem } = useCart();
  const isServico = produto.tipo === "servico";
  const precisaLink = exigeLink(produto);

  const [qtd, setQtd] = useState(isServico ? produto.qtd_min ?? 100 : 1);
  const [linkAlvo, setLinkAlvo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const subtotal = precoDoItem(produto, qtd) * (isServico ? 1 : 1);
  const precoUnit = precoDoItem(produto, qtd);

  function handleAdd(irParaCarrinho: boolean) {
    setErro(null);
    const erroQtd = validarQuantidade(produto, qtd);
    if (erroQtd) {
      setErro(erroQtd);
      return;
    }
    if (precisaLink && !linkAlvo.trim()) {
      setErro("Informe o link/usuário do perfil ou publicação.");
      return;
    }

    addItem({
      produtoId: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      tipo: produto.tipo,
      imagemUrl: produto.imagem_url,
      qtd,
      linkAlvo: precisaLink ? linkAlvo.trim() : null,
      precoUnit,
      subtotal,
    });
    setAdded(true);
    if (irParaCarrinho) router.push("/carrinho");
  }

  return (
    <div className="flex flex-col gap-4">
      {isServico && (
        <div>
          <Label>Quantidade</Label>
          <Input
            type="number"
            min={produto.qtd_min ?? 1}
            max={produto.qtd_max ?? undefined}
            step={1}
            value={qtd}
            onChange={(e) => setQtd(Number(e.target.value))}
          />
        </div>
      )}

      {precisaLink && (
        <div>
          <Label>{isServico ? "Link ou @usuário" : "Link/observação"}</Label>
          <Input
            value={linkAlvo}
            onChange={(e) => setLinkAlvo(e.target.value)}
            placeholder="https://instagram.com/seuperfil"
          />
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
        <span className="text-sm text-muted">Subtotal</span>
        <span className="text-lg font-bold text-primary">{formatBRL(subtotal)}</span>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={() => handleAdd(false)} className="flex-1">
          {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </Button>
        <Button onClick={() => handleAdd(true)} className="flex-1">
          Comprar agora
        </Button>
      </div>
    </div>
  );
}
