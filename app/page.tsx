import Link from "next/link";
import { getCategorias, getProdutosDestaque } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { Hero } from "@/components/hero";
import { SectionTitle } from "@/components/ui";

export default async function HomePage() {
  const [categorias, destaques] = await Promise.all([
    getCategorias(),
    getProdutosDestaque(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Hero />

      {/* Categorias */}
      <section id="categorias" className="mt-14">
        <SectionTitle>Categorias</SectionTitle>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}`}
              className="card card-hover flex flex-col items-center gap-2 p-6 text-center"
            >
              <span className="text-3xl">{c.icone ?? "✨"}</span>
              <span className="text-sm font-semibold">{c.nome}</span>
            </Link>
          ))}
          {categorias.length === 0 && (
            <p className="col-span-full text-sm text-muted">
              Nenhuma categoria cadastrada ainda. Configure o banco e rode o seed.
            </p>
          )}
        </div>
      </section>

      {/* Destaques */}
      {destaques.length > 0 && (
        <section className="mt-14">
          <SectionTitle>🔥 Mais procurados</SectionTitle>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destaques.map((p) => (
              <ProductCard key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="mt-16">
        <SectionTitle>Como funciona</SectionTitle>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { t: "1. Escolha", d: "Selecione o serviço ou assinatura e adicione ao carrinho." },
            { t: "2. Pague com Pix", d: "Gere o QR Code e pague — confirmação automática." },
            { t: "3. Receba", d: "Acompanhe o pedido na sua conta e receba a entrega." },
          ].map((s) => (
            <div key={s.t} className="card p-6">
              <h3 className="font-bold text-primary">{s.t}</h3>
              <p className="mt-2 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-10" />
    </div>
  );
}
