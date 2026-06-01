import { createAdminClient } from "@/lib/supabase/admin";
import { excluirAvaliacao, salvarAvaliacaoFake } from "@/lib/admin-actions";
import { PageHeader } from "@/components/admin/page-header";
import { Toolbar } from "@/components/admin/toolbar";
import { TableSearch } from "@/components/admin/table-search";
import { TableFilter } from "@/components/admin/table-filter";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteForm } from "@/components/admin/delete-form";
import { AvaliacaoForm } from "@/components/admin/avaliacao-form";
import type { Avaliacao } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type AvaliacaoRow = Avaliacao & { produto_nome: string | null };

const PAGE_SIZE = 20;

async function listar(args: {
  q?: string;
  produto?: string;
  fake?: string;
  page?: number;
}): Promise<{
  rows: AvaliacaoRow[];
  total: number;
  page: number;
  pageSize: number;
  produtos: { id: string; nome: string }[];
}> {
  const admin = createAdminClient();
  const page = Math.max(1, args.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("avaliacoes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (args.produto) query = query.eq("produto_id", args.produto);
  if (args.fake === "true") query = query.eq("e_fake", true);
  if (args.fake === "false") query = query.eq("e_fake", false);
  if (args.q?.trim()) query = query.ilike("autor_nome", `%${args.q.trim()}%`);

  const [{ data, count }, { data: prods }] = await Promise.all([
    query.range(from, to),
    admin.from("produtos").select("id, nome").order("nome"),
  ]);

  const produtos = prods ?? [];
  const map = new Map(produtos.map((p) => [p.id, p.nome]));

  return {
    rows: (data ?? []).map((a) => ({ ...a, produto_nome: map.get(a.produto_id) ?? null })),
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    produtos,
  };
}

const columns: Column<AvaliacaoRow>[] = [
  {
    key: "produto",
    header: "Produto",
    render: (a) => (
      <span className="text-sm">{a.produto_nome ?? <span className="text-muted">—</span>}</span>
    ),
  },
  {
    key: "autor",
    header: "Autor",
    render: (a) => <span className="text-sm font-semibold">{a.autor_nome}</span>,
  },
  {
    key: "nota",
    header: "Nota",
    render: (a) => <span className="text-warning">{"★".repeat(a.nota)}</span>,
  },
  {
    key: "texto",
    header: "Comentário",
    render: (a) => (
      <span className="line-clamp-2 max-w-xs text-xs text-muted">{a.texto ?? "—"}</span>
    ),
  },
  {
    key: "fake",
    header: "Tipo",
    render: (a) =>
      a.e_fake ? (
        <span className="inline-flex rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
          Fake
        </span>
      ) : (
        <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
          Real
        </span>
      ),
  },
  {
    key: "data",
    header: "Data",
    render: (a) => (
      <span className="text-xs text-muted">
        {new Date(a.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
    ),
  },
];

const FAKE_OPTS = [
  { value: "false", label: "Reais" },
  { value: "true", label: "Fakes" },
];

export default async function AdminAvaliacoes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; produto?: string; fake?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { rows, total, page, pageSize, produtos } = await listar({
    q: sp.q,
    produto: sp.produto,
    fake: sp.fake,
    page: sp.page ? Number(sp.page) : 1,
  });

  const prodOpts = produtos.map((p) => ({ value: p.id, label: p.nome }));

  return (
    <div>
      <PageHeader
        title="Avaliações"
        description={`${total} avaliação${total === 1 ? "" : "ões"}`}
      />

      <details className="card mb-5 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          + Nova avaliação (fake)
        </summary>
        <div className="mt-4">
          <AvaliacaoForm produtos={produtos} action={salvarAvaliacaoFake} />
        </div>
      </details>

      <Toolbar>
        <TableSearch param="q" placeholder="Buscar por autor…" />
        <TableFilter param="produto" label="Produto" options={prodOpts} />
        <TableFilter param="fake" label="Tipo" options={FAKE_OPTS} />
      </Toolbar>

      <DataTable
        rows={rows}
        columns={columns}
        total={total}
        page={page}
        pageSize={pageSize}
        emptyMessage="Nenhuma avaliação."
        rowActions={(a) => (
          <details className="dropdown-menu relative inline-block text-left">
            <summary className="inline-flex h-8 cursor-pointer items-center rounded-md border border-border bg-surface-2 px-2.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-foreground">
              Ações ▾
            </summary>
            <div className="dropdown-panel p-2">
              {a.e_fake && (
                <details className="mb-1 rounded-md">
                  <summary className="cursor-pointer rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-surface-2">
                    Editar
                  </summary>
                  <div className="mt-2 rounded-md border border-border bg-background p-3">
                    <AvaliacaoForm
                      produtos={produtos}
                      avaliacao={a}
                      action={salvarAvaliacaoFake}
                    />
                  </div>
                </details>
              )}
              <div className="px-2.5 py-1">
                <DeleteForm id={a.id} action={excluirAvaliacao}>
                  Excluir avaliação
                </DeleteForm>
              </div>
            </div>
          </details>
        )}
      />
    </div>
  );
}
