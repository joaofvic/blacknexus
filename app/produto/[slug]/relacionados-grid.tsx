import { getProdutosRelacionados } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import type { Produto } from "@/lib/database.types";

export async function RelacionadosGrid({ produto }: { produto: Produto }) {
  const lista = await getProdutosRelacionados(produto, 4);
  if (lista.length === 0) return null;

  return (
    <section className="mt-12">
      <h3 className="mb-5 text-xs font-mono uppercase tracking-[0.18em] text-muted">
        Você também pode gostar
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {lista.map((p) => (
          <ProductCard key={p.id} produto={p} />
        ))}
      </div>
    </section>
  );
}
