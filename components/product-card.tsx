import Link from "next/link";
import type { Produto } from "@/lib/database.types";
import { formatBRL } from "@/lib/format";
import { precoBase, descontoPct } from "@/lib/pricing";
import { DiscountBadge, PixTag } from "@/components/ui";

export function ProductCard({ produto }: { produto: Produto }) {
  const atual = precoBase(produto);
  const pct = descontoPct(produto);
  const sufixo = produto.tipo === "servico" ? " /mil" : "";

  return (
    <Link
      href={`/produto/${produto.slug}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-surface-2 to-background text-4xl">
        {produto.imagem_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produto.imagem_url} alt={produto.nome} className="h-full w-full object-cover" />
        ) : (
          <span>{produto.tipo === "assinatura" ? "🎬" : "🚀"}</span>
        )}
        {pct > 0 && (
          <div className="absolute left-2 top-2">
            <DiscountBadge pct={pct} />
          </div>
        )}
        {produto.rede_social && (
          <span className="absolute right-2 top-2 rounded-md bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
            {produto.rede_social}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight">{produto.nome}</h3>

        <div className="mt-auto">
          {produto.preco_original && pct > 0 && (
            <div className="text-xs text-muted line-through">
              {formatBRL(produto.preco_original)}
              {sufixo}
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-primary">{formatBRL(atual)}</span>
            <span className="text-xs font-medium text-muted">{sufixo}</span>
          </div>
          <div className="mt-1">
            <PixTag />
          </div>
        </div>

        <span className="btn-buy mt-3 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold">
          COMPRAR
        </span>
      </div>
    </Link>
  );
}
