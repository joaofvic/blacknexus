import {
  getAvaliacoesByProdutoId,
  getResumoAvaliacoes,
  usuarioPodeAvaliar,
} from "@/lib/queries";
import { FormAvaliacao } from "./form-avaliacao";

function Estrelas({ nota }: { nota: number }) {
  return (
    <div
      className="flex gap-0.5 text-warning"
      aria-label={`${nota} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={n <= nota ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function dataRelativa(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora há pouco";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 30) return `há ${Math.floor(diff / 86400)} d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export async function AvaliacoesSection({
  produtoId,
  slug,
}: {
  produtoId: string;
  slug: string;
}) {
  const [resumo, lista, podeAvaliar] = await Promise.all([
    getResumoAvaliacoes(produtoId),
    getAvaliacoesByProdutoId(produtoId),
    usuarioPodeAvaliar(produtoId),
  ]);

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface/40 p-5 sm:p-6">
      <h2 className="mb-5 text-xs font-mono uppercase tracking-[0.18em] text-muted">
        Avaliações
      </h2>

      {/* Resumo */}
      <div className="mb-6 grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-2 px-6 py-4">
          <div className="text-4xl font-extrabold text-primary">
            {resumo.media.toFixed(1)}
          </div>
          <Estrelas nota={Math.round(resumo.media)} />
          <div className="mt-1 text-xs text-muted">
            {resumo.total} {resumo.total === 1 ? "avaliação" : "avaliações"}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((n) => {
            const q = resumo.distribuicao[n as 1 | 2 | 3 | 4 | 5];
            const pct = resumo.total > 0 ? Math.round((q / resumo.total) * 100) : 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted">{n}</span>
                <span className="text-warning">★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full bg-warning"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted">{q}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <div className="mb-6">
        {podeAvaliar.pode ? (
          <FormAvaliacao produtoId={produtoId} slug={slug} />
        ) : (
          <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs text-muted">
            {podeAvaliar.motivo === "nao_logado" &&
              "Faça login e compre este produto para deixar uma avaliação."}
            {podeAvaliar.motivo === "nao_comprou" &&
              "Apenas quem comprou este produto pode avaliá-lo."}
            {podeAvaliar.motivo === "ja_avaliou" &&
              "Você já avaliou este produto. Obrigado!"}
          </div>
        )}
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhuma avaliação ainda. Seja o primeiro!
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {lista.map((av) => (
            <li
              key={av.id}
              className="rounded-xl border border-border bg-surface-2 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {av.autor_nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{av.autor_nome}</div>
                    <div className="text-[10px] text-muted">
                      {dataRelativa(av.created_at)}
                    </div>
                  </div>
                </div>
                <Estrelas nota={av.nota} />
              </div>
              {av.texto && (
                <p className="text-sm text-foreground/90">{av.texto}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
