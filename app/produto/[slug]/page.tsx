import { notFound } from "next/navigation";
import { getProdutoBySlug } from "@/lib/queries";
import { formatBRL, formatNumber } from "@/lib/format";
import { descontoPct } from "@/lib/pricing";
import { DiscountBadge, PixTag } from "@/components/ui";
import { AddToCart } from "./add-to-cart";

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug);
  if (!produto) notFound();

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
      <div className="card flex h-72 items-center justify-center overflow-hidden text-6xl md:h-96">
        {produto.imagem_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produto.imagem_url} alt={produto.nome} className="h-full w-full object-cover" />
        ) : (
          <span>{produto.tipo === "assinatura" ? "🎬" : "🚀"}</span>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-extrabold">{produto.nome}</h1>
        {produto.rede_social && (
          <span className="mt-2 inline-block rounded-md bg-surface-2 px-2 py-1 text-xs text-muted">
            {produto.rede_social}
          </span>
        )}
        {produto.descricao && (
          <p className="mt-4 text-sm text-muted">{produto.descricao}</p>
        )}

        <div className="mt-5 rounded-xl border border-border bg-surface-2 p-4">
          {(() => {
            const pct = descontoPct(produto);
            const atual = produto.tipo === "servico" ? produto.preco_por_mil ?? 0 : produto.preco ?? 0;
            const sufixo = produto.tipo === "servico" ? " / mil" : "";
            return (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {produto.preco_original && pct > 0 && (
                    <span className="text-sm text-muted line-through">
                      {formatBRL(produto.preco_original)}
                    </span>
                  )}
                  {pct > 0 && <DiscountBadge pct={pct} />}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-primary">{formatBRL(atual)}</span>
                  <span className="text-sm text-muted">{sufixo}</span>
                </div>
                <div className="mt-2">
                  <PixTag />
                </div>
                {produto.tipo === "servico" ? (
                  <p className="mt-3 text-xs text-muted">
                    Mín. {formatNumber(produto.qtd_min ?? 0)} • Máx.{" "}
                    {formatNumber(produto.qtd_max ?? 0)}
                  </p>
                ) : (
                  produto.duracao && (
                    <p className="mt-3 text-xs text-muted">Duração: {produto.duracao}</p>
                  )
                )}
              </>
            );
          })()}
        </div>

        <div className="mt-5">
          <AddToCart produto={produto} />
        </div>
      </div>
    </div>
  );
}
