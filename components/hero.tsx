import { SearchBar } from "@/components/search-bar";

export function Hero() {
  return (
    <section className="hero-stage relative mt-6 px-4 py-16 sm:py-20 lg:py-24">
      {/* Cards flutuantes decorativos (apenas em telas grandes) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
      >
        <div
          className="float-card"
          style={{ top: "18%", left: "6%", ["--tilt" as never]: "-6deg" } as React.CSSProperties}
        >
          <div className="swatch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 11-3 3-2-2" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">Instagram</div>
            <div className="text-foreground">1.000 seguidores</div>
          </div>
        </div>

        <div
          className="float-card"
          style={{ bottom: "16%", right: "5%", animationDelay: "1.2s", ["--tilt" as never]: "5deg" } as React.CSSProperties}
        >
          <div className="swatch" style={{ background: "linear-gradient(135deg,#e50914,#7a0009)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">Streaming</div>
            <div className="text-foreground">Netflix 30 dias</div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
        <span className="eyebrow-pill">
          <span className="dot" />
          Entrega em minutos · Pagamento via Pix
        </span>

        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl lg:text-[5.5rem]">
          A melhor loja de
          <br />
          <span className="text-primary neon-text">redes sociais</span>
          <span className="text-muted"> e </span>
          streaming
        </h1>

        <p className="max-w-xl text-base text-muted sm:text-lg">
          Seguidores, curtidas, visualizações e assinaturas premium. Entrega
          automática e pagamento via Pix em segundos.
        </p>

        <SearchBar />

        {/* Prova social */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {[
                "linear-gradient(135deg,#ff2230,#7a0009)",
                "linear-gradient(135deg,#22d3ee,#0e7490)",
                "linear-gradient(135deg,#f59e0b,#92400e)",
                "linear-gradient(135deg,#8b5cf6,#4c1d95)",
              ].map((bg, i) => (
                <span
                  key={i}
                  className="h-6 w-6 rounded-full border-2 border-background"
                  style={{ background: bg }}
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">+10 mil pedidos</span>
            <span>entregues</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-warning">★★★★★</span>
            <span className="font-semibold text-foreground">4.9</span>
            <span>avaliação média</span>
          </div>
        </div>
      </div>
    </section>
  );
}
