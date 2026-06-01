import { getResumoAvaliacoes } from "@/lib/queries";
import { ShareRow } from "./share-row";

function Estrelas({ media, size = 14 }: { media: number; size?: number }) {
  // 5 estrelas com preenchimento parcial baseado em `media` (0–5).
  return (
    <div className="flex gap-0.5 text-warning" aria-label={`${media} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const pct = Math.max(0, Math.min(1, media - (n - 1))) * 100;
        return (
          <div key={n} className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="absolute inset-0 opacity-30"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${pct}%` }}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export async function ProdutoAside({
  produtoId,
  nome,
}: {
  produtoId: string;
  nome: string;
}) {
  const resumo = await getResumoAvaliacoes(produtoId);
  const temAvaliacoes = resumo.total > 0;

  return (
    <div className="mt-5 flex flex-col gap-3">
      {/* Social proof: rating snapshot ancorado para a seção de avaliações */}
      <a
        href="#avaliacoes"
        className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/50 px-4 py-3 backdrop-blur-md transition hover:border-primary/60"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex flex-col items-center justify-center">
            <span className="font-display text-xl font-extrabold leading-none text-foreground">
              {temAvaliacoes ? resumo.media.toFixed(1) : "—"}
            </span>
            <Estrelas media={resumo.media} size={12} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight">
              {temAvaliacoes ? "Avaliado por clientes" : "Seja o primeiro a avaliar"}
            </div>
            <div className="truncate text-[11px] text-muted">
              {temAvaliacoes
                ? `${resumo.total} ${resumo.total === 1 ? "avaliação" : "avaliações"} verificadas`
                : "Compre e deixe sua avaliação"}
            </div>
          </div>
        </div>
        <span className="shrink-0 text-xs font-semibold text-muted transition group-hover:text-primary">
          Ver →
        </span>
      </a>

      {/* Compartilhar */}
      <div className="rounded-2xl border border-border bg-surface/50 px-4 py-3 backdrop-blur-md">
        <ShareRow nome={nome} />
      </div>
    </div>
  );
}
