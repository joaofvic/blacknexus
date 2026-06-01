import { excluirCategoria } from "@/lib/admin-actions";
import { getCategoriasPaginated } from "@/lib/admin-queries";
import { PageHeader } from "@/components/admin/page-header";
import { Toolbar } from "@/components/admin/toolbar";
import { TableSearch } from "@/components/admin/table-search";
import { TableFilter } from "@/components/admin/table-filter";
import { DataTable, type Column } from "@/components/admin/data-table";
import { CategoriaFormClient } from "@/components/admin/categoria-form-client";
import { DeleteForm } from "@/components/admin/delete-form";
import type { Categoria } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const TIPO_OPTS = [
  { value: "streaming", label: "Streaming" },
  { value: "social", label: "Redes sociais" },
  { value: "variedades", label: "Variedades" },
];

const columns: Column<Categoria>[] = [
  {
    key: "nome",
    header: "Categoria",
    render: (c) => (
      <div className="flex items-center gap-3">
        <span className="text-xl">{c.icone ?? "✨"}</span>
        <div>
          <div className="text-sm font-semibold">{c.nome}</div>
          <div className="text-[11px] text-muted">/{c.slug}</div>
        </div>
      </div>
    ),
  },
  {
    key: "tipo",
    header: "Tipo",
    render: (c) => (
      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase text-muted">
        {c.tipo}
      </span>
    ),
  },
  {
    key: "ordem",
    header: "Ordem",
    align: "center",
    render: (c) => <span className="text-sm text-muted">{c.ordem}</span>,
  },
  {
    key: "ativo",
    header: "Status",
    render: (c) =>
      c.ativo ? (
        <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
          Ativa
        </span>
      ) : (
        <span className="inline-flex rounded-full bg-danger/15 px-2 py-0.5 text-[11px] font-semibold text-danger">
          Inativa
        </span>
      ),
  },
];

export default async function AdminCategorias({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { rows, total, page, pageSize } = await getCategoriasPaginated({
    q: sp.q,
    tipo: sp.tipo,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div>
      <PageHeader
        title="Categorias"
        description={`${total} categoria${total === 1 ? "" : "s"}`}
      />

      <details className="card mb-5 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          + Nova categoria
        </summary>
        <div className="mt-4">
          <CategoriaFormClient />
        </div>
      </details>

      <Toolbar>
        <TableSearch param="q" placeholder="Buscar por nome…" />
        <TableFilter param="tipo" label="Tipo" options={TIPO_OPTS} />
      </Toolbar>

      <DataTable
        rows={rows}
        columns={columns}
        total={total}
        page={page}
        pageSize={pageSize}
        emptyMessage="Nenhuma categoria encontrada."
        rowActions={(c) => (
          <details className="dropdown-menu relative inline-block text-left">
            <summary className="inline-flex h-8 cursor-pointer items-center rounded-md border border-border bg-surface-2 px-2.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-foreground">
              Ações ▾
            </summary>
            <div className="dropdown-panel p-2">
              <details className="mb-1 rounded-md">
                <summary className="cursor-pointer rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-surface-2">
                  Editar
                </summary>
                <div className="mt-2 rounded-md border border-border bg-background p-3">
                  <CategoriaFormClient categoria={c} />
                </div>
              </details>
              <div className="px-2.5 py-1">
                <DeleteForm id={c.id} action={excluirCategoria}>
                  Excluir categoria
                </DeleteForm>
              </div>
            </div>
          </details>
        )}
      />
    </div>
  );
}
