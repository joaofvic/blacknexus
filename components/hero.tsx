import { LinkButton } from "@/components/ui";
import { TrustPills } from "@/components/trust-pills";
import { StatsBar } from "@/components/stats-bar";

export function Hero() {
  return (
    <section className="hero-grunge rounded-3xl border border-border px-6 py-16 sm:py-20">
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" /> Loja verificada e segura
        </span>

        <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          A <span className="text-primary neon-text">melhor loja</span> de
          <br /> redes sociais e streaming
        </h1>

        <p className="max-w-xl text-muted sm:text-lg">
          Seguidores, curtidas, visualizações e comentários para todas as redes — e assinaturas
          de Netflix, Spotify e mais. Entrega rápida, pagamento via Pix.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton href="#categorias">🚀 Ver serviços</LinkButton>
          <LinkButton href="/cadastro" variant="outline">Criar conta grátis</LinkButton>
        </div>

        <div className="mt-2">
          <TrustPills />
        </div>

        <div className="mt-2 w-full">
          <StatsBar />
        </div>
      </div>
    </section>
  );
}
