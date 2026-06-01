import Link from "next/link";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui";
import { getPedidosPaginated, type PedidoRow } from "@/lib/admin-queries";
import { PageHeader } from "@/components/admin/page-header";
import { Toolbar } from "@/components/admin/toolbar";
import { TableSearch } from "@/components/admin/table-search";
import { TableFilter } from "@/components/admin/table-filter";
import { DataTable, type Column } from "@/components/admin/data-table";

export const dynamic = "force-dynamic";

const STATUS_OPTS = [
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "pago", label: "Pago" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];
const DATE_OPTS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
];

const columns: Column<PedidoRow>[] = [
  {
    key: "id",
    header: "Pedido",
    render: (p) => (
      <Link
        href={`/admin/pedidos/${p.id}`}
        className="font-mono text-sm font-semibold text-primary hover:underline"
      >
        #{p.id.slice(0, 8)}
      </Link>
    ),
  },
  {
    key: "cliente",
    header: "Cliente",
    render: (p) => (
      <span className="text-sm">
        {p.cliente ?? <span className="text-muted">—</span>}
      </span>
    ),
  },
  {
    key: "data",
    header: "Data",
    render: (p) => <span className="text-xs text-muted">{formatDate(p.created_at)}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (p) => <StatusBadge status={p.status} />,
  },
  {
    key: "total",
    header: "Total",
    align: "right",
    render: (p) => <span className="font-bold text-primary">{formatBRL(p.total)}</span>,
  },
];

export default async function AdminPedidos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; dias?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { rows, total, page, pageSize } = await getPedidosPaginated({
    q: sp.q,
    status: sp.status,
    dias: sp.dias,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description={`${total} pedido${total === 1 ? "" : "s"} no total`}
      />
      <Toolbar>
        <TableSearch param="q" placeholder="Buscar por ID do pedido…" />
        <TableFilter param="status" label="Status" options={STATUS_OPTS} />
        <TableFilter param="dias" label="Período" options={DATE_OPTS} />
      </Toolbar>
      <DataTable
        rows={rows}
        columns={columns}
        total={total}
        page={page}
        pageSize={pageSize}
        emptyMessage="Nenhum pedido encontrado com esses filtros."
        rowActions={(p) => (
          <Link
            href={`/admin/pedidos/${p.id}`}
            className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-foreground"
          >
            Abrir →
          </Link>
        )}
      />
    </div>
  );
}
