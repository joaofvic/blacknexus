"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { formatBRL, formatNumber } from "@/lib/format";
import { Button, LinkButton } from "@/components/ui";

export function CarrinhoView() {
  const { items, total, removeItem, clear } = useCart();
  const router = useRouter();
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) {
      setUnavailable(new Set());
      return;
    }
    const ctrl = new AbortController();
    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((it) => ({
          produtoId: it.produtoId,
          varianteId: it.varianteId ?? null,
          qtd: it.qtd,
        })),
      }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : { unavailable: [] }))
      .then((data: { unavailable: string[] }) => {
        setUnavailable(new Set(data.unavailable ?? []));
      })
      .catch(() => {
        /* falha silenciosa: checkout server-side ainda valida */
      });
    return () => ctrl.abort();
  }, [items]);

  const itemIndisponivel = (it: (typeof items)[number]) =>
    unavailable.has(it.varianteId ?? "") || unavailable.has(it.produtoId);
  const temIndisponivel = items.some(itemIndisponivel);

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <span className="text-4xl">🛒</span>
        <p className="text-muted">Seu carrinho está vazio.</p>
        <LinkButton href="/">Ver produtos</LinkButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((it, i) => {
        const indisponivel = itemIndisponivel(it);
        return (
          <div
            key={i}
            className={
              "card flex items-center gap-4 p-4 " +
              (indisponivel ? "border-danger/50" : "")
            }
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 text-2xl">
              {it.tipo === "assinatura" ? "🎬" : "🚀"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{it.nome}</div>
              <div className="text-xs text-muted">
                {it.tipo === "servico" ? `${formatNumber(it.qtd)} un.` : "Assinatura"}
                {it.linkAlvo && ` • ${it.linkAlvo}`}
              </div>
              {indisponivel && (
                <div className="mt-1 inline-flex items-center rounded-md border border-danger/40 bg-danger/15 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-danger">
                  Sem estoque
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">{formatBRL(it.subtotal)}</div>
              <button
                onClick={() => removeItem(i)}
                className={
                  "text-xs " +
                  (indisponivel
                    ? "font-bold text-danger hover:underline"
                    : "text-muted hover:text-danger")
                }
              >
                remover
              </button>
            </div>
          </div>
        );
      })}

      <div className="card flex items-center justify-between p-5">
        <span className="text-muted">Total</span>
        <span className="text-2xl font-extrabold text-primary">{formatBRL(total)}</span>
      </div>

      {temIndisponivel && (
        <p className="text-sm text-danger">
          Há itens sem estoque no seu carrinho. Remova-os para continuar.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <button onClick={clear} className="text-sm text-muted hover:text-danger">
          Esvaziar carrinho
        </button>
        <div className="flex gap-2">
          <Link href="/" className="rounded-lg border border-border px-4 py-2.5 text-sm">
            Continuar comprando
          </Link>
          <Button
            onClick={() => router.push("/checkout")}
            disabled={temIndisponivel}
          >
            {temIndisponivel ? "Remova itens indisponíveis" : "Finalizar compra"}
          </Button>
        </div>
      </div>
    </div>
  );
}
