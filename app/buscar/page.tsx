import Link from "next/link";
import { searchProdutos } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const termo = q.trim();
  const produtos = termo ? await searchProdutos(termo) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-foreground">Início</Link>
        <span>›</span>
        <span className="text-foreground">Busca</span>
      </nav>

      <div className="mb-10 flex flex-col items-center gap-5 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          {termo ? (
            <>
              Resultados para <span className="text-primary neon-text">&ldquo;{termo}&rdquo;</span>
            </>
          ) : (
            "Buscar produtos"
          )}
        </h1>
        <SearchBar initial={termo} />
      </div>

      {!termo ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-12 text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <p className="text-sm text-muted">
            Digite o que você procura — serviços, redes ou assinaturas.
          </p>
        </div>
      ) : produtos.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-12 text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <p className="text-base font-semibold text-foreground">
            Nenhum produto encontrado
          </p>
          <p className="text-sm text-muted">
            Não achamos nada para &ldquo;{termo}&rdquo;. Tente outro termo ou navegue pelas categorias.
          </p>
          <Link href="/" className="mt-2 text-sm font-semibold text-primary hover:underline">
            ← Voltar para a loja
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm text-muted">
            {produtos.length} {produtos.length === 1 ? "resultado" : "resultados"}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {produtos.map((p) => (
              <ProductCard key={p.id} produto={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
