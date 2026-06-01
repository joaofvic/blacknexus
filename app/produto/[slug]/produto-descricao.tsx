// Renderiza a descrição do produto.
// Suporta parágrafos separados por linha em branco e listas com "- " ou "• ".
export function ProdutoDescricao({ texto }: { texto: string | null }) {
  if (!texto?.trim()) {
    return (
      <p className="text-sm text-muted">
        Este produto ainda não possui descrição detalhada.
      </p>
    );
  }

  const blocos = texto.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-foreground">
      {blocos.map((bloco, idx) => {
        const linhas = bloco.split("\n").map((l) => l.trim()).filter(Boolean);
        const ehLista = linhas.every((l) => /^([-•*›✔]|\d+\.)\s+/.test(l));
        if (ehLista) {
          return (
            <ul key={idx} className="ml-4 list-disc space-y-1.5 text-foreground/90">
              {linhas.map((l, i) => (
                <li key={i}>{l.replace(/^([-•*›✔]|\d+\.)\s+/, "")}</li>
              ))}
            </ul>
          );
        }
        const primeira = linhas[0];
        const ehTitulo = /^#{1,3}\s+/.test(primeira);
        if (ehTitulo) {
          const titulo = primeira.replace(/^#{1,3}\s+/, "");
          return (
            <div key={idx}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                {titulo}
              </h3>
              {linhas.slice(1).map((l, i) => (
                <p key={i} className="mt-1.5 text-foreground/90">
                  {l}
                </p>
              ))}
            </div>
          );
        }
        return (
          <p key={idx} className="text-foreground/90">
            {linhas.join(" ")}
          </p>
        );
      })}
    </div>
  );
}
