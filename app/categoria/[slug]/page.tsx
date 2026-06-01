import { notFound } from "next/navigation";
import { getCategoriaBySlug, getProdutosByCategoria } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoria = await getCategoriaBySlug(slug);
  if (!categoria) notFound();

  const produtos = await getProdutosByCategoria(categoria.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-2xl">
          {categoria.icone ?? "✨"}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">{categoria.nome}</h1>
          <p className="text-xs text-muted">Entrega rápida • Pagamento via Pix</p>
        </div>
      </div>

      {produtos.length === 0 ? (
        <p className="text-muted">Nenhum produto nesta categoria ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produtos.map((p) => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
