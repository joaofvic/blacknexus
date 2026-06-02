"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Produto, ProdutoVariante } from "@/lib/database.types";
import { precoDoItem, validarQuantidade, exigeLink } from "@/lib/pricing";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/components/cart-provider";
import { Button, Input, Label, PixTag, DiscountBadge } from "@/components/ui";

function pct(original: number | null, atual: number): number {
  if (!original || original <= 0 || atual <= 0 || original <= atual) return 0;
  return Math.round(((original - atual) / original) * 100);
}

export function AddToCart({
  produto,
  variantes,
}: {
  produto: Produto;
  variantes: ProdutoVariante[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const isServico = produto.tipo === "servico";
  const precisaLink = exigeLink(produto);
  const temVariantes = variantes.length > 0;

  const varianteDisponivel = (v: ProdutoVariante) =>
    v.estoque == null || v.estoque > 0;
  const produtoEsgotado =
    temVariantes && variantes.every((v) => !varianteDisponivel(v));

  const [varianteId, setVarianteId] = useState<string | null>(
    temVariantes
      ? (variantes.find(varianteDisponivel)?.id ?? variantes[0].id)
      : null
  );
  const varianteAtual = useMemo(
    () => variantes.find((v) => v.id === varianteId) ?? null,
    [variantes, varianteId]
  );
  const varianteIndisponivel =
    !!varianteAtual &&
    varianteAtual.estoque != null &&
    varianteAtual.estoque <= 0;
  const indisponivel = produtoEsgotado || varianteIndisponivel;

  const [qtd, setQtd] = useState(isServico ? produto.qtd_min ?? 100 : 1);
  const [linkAlvo, setLinkAlvo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // Preço unitário: variante > pricing.precoDoItem.
  const precoUnit = varianteAtual
    ? varianteAtual.preco
    : precoDoItem(produto, qtd);
  const subtotal = isServico && !varianteAtual ? precoUnit : precoUnit;

  const precoOriginal = varianteAtual?.preco_original ?? produto.preco_original ?? null;
  const descPct = pct(precoOriginal, precoUnit);

  function handleAdd(irParaCarrinho: boolean) {
    setErro(null);
    if (indisponivel) {
      setErro("Item sem estoque no momento.");
      return;
    }
    if (
      varianteAtual &&
      varianteAtual.estoque != null &&
      varianteAtual.estoque < 1
    ) {
      setErro("Item sem estoque no momento.");
      return;
    }
    if (!varianteAtual) {
      const erroQtd = validarQuantidade(produto, qtd);
      if (erroQtd) {
        setErro(erroQtd);
        return;
      }
    }
    if (precisaLink && !linkAlvo.trim()) {
      setErro("Informe o link/usuário do perfil ou publicação.");
      return;
    }

    const nomeComVariante = varianteAtual
      ? `${produto.nome} · ${varianteAtual.nome}`
      : produto.nome;

    addItem({
      produtoId: produto.id,
      slug: produto.slug,
      nome: nomeComVariante,
      tipo: produto.tipo,
      imagemUrl: produto.imagem_url,
      qtd: varianteAtual ? 1 : qtd,
      linkAlvo: precisaLink ? linkAlvo.trim() : null,
      precoUnit,
      subtotal,
      varianteId: varianteAtual?.id ?? null,
      varianteNome: varianteAtual?.nome ?? null,
    });
    setAdded(true);
    if (irParaCarrinho) router.push("/carrinho");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Preço */}
      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          {precoOriginal && descPct > 0 && (
            <span className="text-sm text-muted line-through">
              {formatBRL(precoOriginal)}
            </span>
          )}
          {descPct > 0 && <DiscountBadge pct={descPct} />}
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-primary">
            {formatBRL(precoUnit)}
          </span>
          {isServico && !varianteAtual && (
            <span className="text-sm text-muted">/ mil</span>
          )}
        </div>
        <div className="mt-2">
          <PixTag />
          <span className="ml-2 text-xs text-muted">À vista no Pix</span>
        </div>
      </div>

      {/* Variantes (chips) */}
      {temVariantes && (
        <div>
          <Label>Escolha uma opção</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {variantes.map((v) => {
              const selecionada = v.id === varianteId;
              const semEstoque = v.estoque != null && v.estoque <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={semEstoque}
                  onClick={() => setVarianteId(v.id)}
                  className={
                    "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition " +
                    (selecionada
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-surface-2 hover:border-primary/60") +
                    (semEstoque ? " opacity-50 cursor-not-allowed" : "")
                  }
                >
                  <span className="text-sm font-bold">{v.nome}</span>
                  <span className="text-xs text-muted">{formatBRL(v.preco)}</span>
                  {v.duracao && (
                    <span className="text-[10px] text-muted">{v.duracao}</span>
                  )}
                  {semEstoque && (
                    <span className="text-[10px] text-danger">Sem estoque</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantidade (apenas serviço sem variante) */}
      {isServico && !varianteAtual && (
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

      {indisponivel && (
        <p className="text-sm text-danger">
          {produtoEsgotado
            ? "Produto sem estoque no momento."
            : "Variante selecionada sem estoque."}
        </p>
      )}
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => handleAdd(true)}
          className="w-full"
          disabled={indisponivel}
        >
          {indisponivel ? "Esgotado" : "Comprar agora"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleAdd(false)}
          className="w-full"
          disabled={indisponivel}
        >
          {indisponivel
            ? "Esgotado"
            : added
            ? "Adicionado ✓"
            : "Adicionar ao carrinho"}
        </Button>
      </div>
    </div>
  );
}
