import Link from "next/link";
import {
  getCategorias,
  getProdutosDestaque,
  getProdutosByCategoriaSlug,
} from "@/lib/queries";
import { Hero } from "@/components/hero";
import { CategoryChips } from "@/components/category-chips";
import { ProductShelf } from "@/components/product-shelf";
import { TrustPills } from "@/components/trust-pills";
import { LinkButton } from "@/components/ui";

export default async function HomePage() {
  const [categorias, destaques] = await Promise.all([
    getCategorias(),
    getProdutosDestaque(),
  ]);

  const prateleiras = await Promise.all(
    categorias.map(async (c) => ({
      categoria: c,
      produtos: await getProdutosByCategoriaSlug(c.slug, 8),
    }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <Hero />

      {/* Chips de categoria */}
      <div className="mt-10 flex justify-center">
        <CategoryChips categorias={categorias} />
      </div>

      {/* Faixa de garantias */}
      <div className="mt-8 flex justify-center">
        <TrustPills />
      </div>

      <div className="section-divider" />

      {/* Prateleira de destaques */}
      <ProductShelf titulo="DESTAQUES" produtos={destaques} featured />

      {/* Prateleiras por categoria */}
      {prateleiras
        .filter(({ produtos }) => produtos.length > 0)
        .map(({ categoria, produtos }, idx) => (
          <div key={categoria.id}>
            {idx > 0 && <div className="section-divider" />}
            <ProductShelf
              titulo={categoria.nome}
              href={`/categoria/${categoria.slug}`}
              produtos={produtos}
            />
          </div>
        ))}

      {categorias.length === 0 && destaques.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">
          Nenhum produto cadastrado ainda. Configure o banco e rode o seed.
        </p>
      )}

      <div className="section-divider" />

      {/* Como funciona */}
      <section className="mt-14">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="section-title-featured text-base sm:text-lg">Como funciona</span>
          <p className="max-w-md text-sm text-muted">
            Três passos rápidos do clique à entrega — sem fricção.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { n: "01", t: "Escolha", d: "Selecione o serviço e adicione ao carrinho." },
            { n: "02", t: "Pague com Pix", d: "Gere o QR Code e tenha confirmação automática." },
            { n: "03", t: "Receba", d: "Acompanhe o pedido em tempo real e receba a entrega." },
          ].map((s) => (
            <div key={s.n} className="card relative overflow-hidden p-6">
              <span
                aria-hidden
                className="font-display absolute -top-2 right-4 text-7xl font-bold leading-none opacity-15"
                style={{
                  background: "linear-gradient(180deg, #ff3343, #c70612)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.n}
              </span>
              <h3 className="relative font-display text-lg font-bold tracking-tight">{s.t}</h3>
              <p className="relative mt-2 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mb-16 mt-16">
        <div className="glass-panel flex flex-col items-center gap-5 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Pronto pra <span className="text-primary neon-text">turbinar</span> suas redes?
          </h2>
          <p className="max-w-lg text-base text-muted">
            Crie sua conta grátis e acompanhe seus pedidos em tempo real.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href="/cadastro" className="px-6 py-3">Criar conta grátis</LinkButton>
            <Link
              href="#"
              className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-surface-2/60 px-6 py-3 text-sm font-bold backdrop-blur hover:border-primary"
            >
              Ver serviços
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
