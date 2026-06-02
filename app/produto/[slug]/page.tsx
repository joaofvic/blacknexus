import Link from "next/link";
import { notFound } from "next/navigation";
import { getProdutoBySlug, getVariantesByProdutoId } from "@/lib/queries";
import { AddToCart } from "./add-to-cart";
import { TrustCards, ProdutoFeatureRow } from "./trust-cards";
import { ProdutoDescricao } from "./produto-descricao";
import { AvaliacoesSection } from "./avaliacoes-section";
import { RelacionadosGrid } from "./relacionados-grid";
import { ProdutoAside } from "./produto-aside";

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug);
  if (!produto) notFound();

  const variantes = await getVariantesByProdutoId(produto.id);

  const estoqueTotal = variantes.reduce(
    (sum, v) => (v.estoque == null ? sum : sum + v.estoque),
    0
  );
  const temEstoqueInfo = variantes.some((v) => v.estoque != null);
  const entregaAuto = produto.tipo === "assinatura";

  return (
    <div className="mx-auto max-w-[1200px] px-3 sm:px-6 lg:px-8 pt-8 pb-16">
      <Link href="/" className="text-xs text-muted hover:underline">
        ← Voltar
      </Link>

      {/* Coluna principal (rola) + sidebar sticky até o final das avaliações */}
      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* ----- COLUNA PRINCIPAL ----- */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Topo: imagem + info/compra */}
          <div className="grid items-start gap-5 md:grid-cols-2">
            {/* Imagem + aside (rating snapshot + compartilhar) */}
            <div className="flex flex-col">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
                {produto.imagem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className="block h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-7xl">
                    {produto.tipo === "assinatura" ? "🎬" : "🚀"}
                  </div>
                )}
              </div>
              <ProdutoAside produtoId={produto.id} nome={produto.nome} />
            </div>

            {/* Info + compra */}
            <div className="flex min-w-0 flex-col">
              <div className="mb-3 flex flex-wrap gap-2">
                {temEstoqueInfo && estoqueTotal > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-success/40 bg-success/15 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-success">
                    {estoqueTotal} em estoque
                  </span>
                )}
                {temEstoqueInfo && estoqueTotal <= 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-danger/40 bg-danger/15 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-danger">
                    Esgotado
                  </span>
                )}
                <span className="inline-flex items-center rounded-xl border border-accent/55 bg-accent/25 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
                  {entregaAuto ? "Entrega automática" : "Entrega manual"}
                </span>
                {produto.rede_social && (
                  <span className="inline-flex items-center rounded-xl border border-border bg-surface-2 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
                    {produto.rede_social}
                  </span>
                )}
              </div>

              <h1 className="mb-4 break-words text-2xl font-extrabold leading-tight sm:text-3xl">
                {produto.nome}
              </h1>

              <AddToCart produto={produto} variantes={variantes} />

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-2.5 py-2 text-sm">
                  <span aria-hidden>⚡</span>
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-semibold">
                      {entregaAuto ? "Entrega automática" : "Entrega manual"}
                    </div>
                    <div className="truncate text-[10px] text-muted">
                      Após confirmação Pix
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-2.5 py-2 text-sm">
                  <span aria-hidden>🛡</span>
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-semibold">
                      Garantia ativa
                    </div>
                    <div className="truncate text-[10px] text-muted">
                      Substituição grátis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="-mx-3 px-3 py-5 sm:mx-0 sm:rounded-2xl sm:border sm:border-border sm:bg-surface/40 sm:p-6">
            <div className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">
              Sobre o produto
            </div>
            <ProdutoDescricao texto={produto.descricao} />
            <ProdutoFeatureRow />
          </div>

          {/* Avaliações (sidebar ainda sticky) */}
          <div id="avaliacoes" className="scroll-mt-24">
            <AvaliacoesSection produtoId={produto.id} slug={produto.slug} />
          </div>
        </div>

        {/* ----- SIDEBAR (sticky, acompanha do topo até o fim das avaliações) ----- */}
        <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <TrustCards />
        </div>
      </div>

      {/* Relacionados full-width — sidebar já terminou */}
      <RelacionadosGrid produto={produto} />
    </div>
  );
}
