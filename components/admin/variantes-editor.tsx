import { createAdminClient } from "@/lib/supabase/admin";
import type { ProdutoVariante } from "@/lib/database.types";
import { salvarVariante, excluirVariante } from "@/lib/admin-actions";
import { VarianteForm } from "./variante-form";
import { DeleteForm } from "./delete-form";

async function carregarVariantes(produtoId: string): Promise<ProdutoVariante[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("produto_variantes")
    .select("*")
    .eq("produto_id", produtoId)
    .order("ordem")
    .order("created_at");
  return data ?? [];
}

export async function VariantesEditor({ produtoId }: { produtoId: string }) {
  const variantes = await carregarVariantes(produtoId);

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface-2 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Variantes (planos)
      </div>

      {variantes.length === 0 && (
        <p className="mb-3 text-xs text-muted">
          Nenhuma variante. Sem variantes o preço base do produto é usado.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {variantes.map((v) => (
          <details key={v.id} className="rounded-md border border-border bg-background p-2">
            <summary className="cursor-pointer text-xs">
              <span className="font-semibold">{v.nome}</span>
              <span className="ml-2 text-muted">R$ {Number(v.preco).toFixed(2)}</span>
              {v.duracao && <span className="ml-2 text-muted">• {v.duracao}</span>}
              {!v.ativo && <span className="ml-2 text-danger">(inativa)</span>}
            </summary>
            <div className="mt-2">
              <VarianteForm produtoId={produtoId} variante={v} action={salvarVariante} />
              <div className="mt-2 border-t border-border pt-2">
                <DeleteForm
                  id={v.id}
                  action={excluirVariante}
                  confirmMessage="Excluir esta variante?"
                >
                  Excluir variante
                </DeleteForm>
              </div>
            </div>
          </details>
        ))}

        <details className="rounded-md border border-dashed border-border bg-background p-2">
          <summary className="cursor-pointer text-xs font-semibold text-primary">
            + Nova variante
          </summary>
          <div className="mt-2">
            <VarianteForm produtoId={produtoId} action={salvarVariante} />
          </div>
        </details>
      </div>
    </div>
  );
}
