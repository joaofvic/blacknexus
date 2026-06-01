import { formatBRL } from "@/lib/format";
import { excluirProduto } from "@/lib/admin-actions";
import { getProdutosPaginated, type ProdutoRow } from "@/lib/admin-queries";
import { PageHeader } from "@/components/admin/page-header";
import { Toolbar } from "@/components/admin/toolbar";
import { TableSearch } from "@/components/admin/table-search";
import { TableFilter } from "@/components/admin/table-filter";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ProdutoFormClient } from "@/components/admin/produto-form-client";
import { DeleteForm } from "@/components/admin/delete-form";
import type { Categoria } from "@/lib/database.types";

export const dynamic = "force-dynamic";

function buildColumns(categorias: Categoria[]): Column<ProdutoRow>[] {
  return [
    {
      key: "produto",
      header: "Produto",
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.imagem_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.imagem_url}
              alt=""
              className="h-9 w-9 shrink-0 rounded-md border border-border object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-xs text-muted">
              ∅
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              {p.nome}
              {p.destaque && (
                <span className="ml-2 align-middle text-[10px] text-warning">★</span>
              )}
            </div>
            <div className="truncate text-[11px] text-muted">/{p.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: "categoria",
      header: "Categoria",
      render: (p) =>
        p.categoria_nome ?? (
          <span className="text-xs text-muted">—</span>
        ),
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (p) => (
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase text-muted">
          {p.tipo}
        </span>
      ),
    },
    {
      key: "preco",
      header: "Preço",
      align: "right",
      render: (p) => (
        <span className="font-bold text-foreground">
          {p.tipo === "servico"
            ? `${formatBRL(p.preco_por_mil ?? 0)}/mil`
            : formatBRL(p.preco ?? 0)}
        </span>
      ),
    },
    {
      key: "ativo",
      header: "Status",
      render: (p) =>
        p.ativo ? (
          <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
            Ativo
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-danger/15 px-2 py-0.5 text-[11px] font-semibold text-danger">
            Inativo
          </span>
        ),
    },
  ];
  void categorias;
}

const TIPO_OPTS = [
  { value: "servico", label: "Serviço" },
  { value: "assinatura", label: "Assinatura" },
];
const ATIVO_OPTS = [
  { value: "true", label: "Ativos" },
  { value: "false", label: "Inativos" },
];

export default async function AdminProdutos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; tipo?: string; ativo?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { rows, total, page, pageSize, categorias } = await getProdutosPaginated({
    q: sp.q,
    categoria: sp.categoria,
    tipo: sp.tipo,
    ativo: sp.ativo,
    page: sp.page ? Number(sp.page) : 1,
  });

  const catOpts = categorias.map((c) => ({ value: c.id, label: c.nome }));
  const columns = buildColumns(categorias);

  return (
    <div>
      <PageHeader
        title="Produtos"
        description={`${total} produto${total === 1 ? "" : "s"} cadastrado${total === 1 ? "" : "s"}`}
      />

      <details className="card mb-5 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          + Novo produto
        </summary>
        <div className="mt-4">
          <ProdutoFormClient categorias={categorias} />
        </div>
      </details>

      <Toolbar>
        <TableSearch param="q" placeholder="Buscar por nome…" />
        <TableFilter param="categoria" label="Categoria" options={catOpts} />
        <TableFilter param="tipo" label="Tipo" options={TIPO_OPTS} />
        <TableFilter param="ativo" label="Status" options={ATIVO_OPTS} />
      </Toolbar>

      <DataTable
        rows={rows}
        columns={columns}
        total={total}
        page={page}
        pageSize={pageSize}
        emptyMessage="Nenhum produto encontrado."
        rowActions={(p) => (
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
                  <ProdutoFormClient produto={p} categorias={categorias} />
                </div>
              </details>
              <div className="px-2.5 py-1">
                <DeleteForm id={p.id} action={excluirProduto}>
                  Excluir produto
                </DeleteForm>
              </div>
            </div>
          </details>
        )}
      />
    </div>
  );
}
