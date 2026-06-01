import Link from "next/link";
import type { Produto } from "@/lib/database.types";
import { formatBRL } from "@/lib/format";
import { precoBase, descontoPct } from "@/lib/pricing";
import { DiscountBadge } from "@/components/ui";

export function ProductCard({ produto }: { produto: Produto }) {
  const atual = precoBase(produto);
  const pct = descontoPct(produto);
  const sufixo = produto.tipo === "servico" ? " /mil" : "";

  return (
    <Link
      href={`/produto/${produto.slug}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      {/* Imagem */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-surface-2 to-background">
        {produto.imagem_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl opacity-70">
            {produto.tipo === "assinatura" ? "🎬" : "🚀"}
          </div>
        )}

        {pct > 0 && (
          <div className="absolute left-2.5 top-2.5">
            <DiscountBadge pct={pct} />
          </div>
        )}
        {produto.rede_social && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {produto.rede_social}
          </span>
        )}
      </div>

      {/* Informações */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight tracking-tight">
          {produto.nome}
        </h3>

        <div className="mt-auto pt-2">
          {produto.preco_original && pct > 0 && (
            <div className="text-[11px] text-muted line-through">
              {formatBRL(produto.preco_original)}
            </div>
          )}
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-xl font-bold leading-none text-foreground">
                {formatBRL(atual)}
                {sufixo && (
                  <span className="ml-0.5 text-xs font-medium text-muted">{sufixo}</span>
                )}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13 2 4 14h7l-2 8 9-12h-7l2-8z" />
                </svg>
                Pix
              </div>
            </div>
            <span aria-label="Adicionar ao carrinho" className="btn-cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
