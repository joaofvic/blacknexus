import Link from "next/link";
import type { Produto } from "@/lib/database.types";
import { ProductCard } from "@/components/product-card";

export function ProductShelf({
  titulo,
  href,
  produtos,
  featured = false,
}: {
  titulo: string;
  href?: string;
  produtos: Produto[];
  featured?: boolean;
}) {
  if (produtos.length === 0) return null;
  return (
    <section className="mt-14">
      {featured ? (
        <div className="mb-7 flex flex-col items-center gap-2">
          <span className="section-title-featured text-lg sm:text-2xl">{titulo}</span>
          {href && (
            <Link href={href} className="text-xs font-semibold text-primary hover:underline">
              Ver tudo →
            </Link>
          )}
        </div>
      ) : (
        <div className="mb-6 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-primary to-warning" />
            <h2 className="font-display text-lg font-bold uppercase tracking-[0.18em] sm:text-xl">
              {titulo}
            </h2>
          </div>
          {href && (
            <Link
              href={href}
              className="group inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-primary"
            >
              Ver tudo
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {produtos.map((p) => (
          <ProductCard key={p.id} produto={p} />
        ))}
      </div>
    </section>
  );
}
