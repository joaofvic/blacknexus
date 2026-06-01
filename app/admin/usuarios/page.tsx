import { formatDate } from "@/lib/format";
import { getUsuariosPaginated } from "@/lib/admin-queries";
import { PageHeader } from "@/components/admin/page-header";
import { Toolbar } from "@/components/admin/toolbar";
import { TableSearch } from "@/components/admin/table-search";
import { TableFilter } from "@/components/admin/table-filter";
import { DataTable, type Column } from "@/components/admin/data-table";
import type { Profile } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const ROLE_OPTS = [
  { value: "admin", label: "Administradores" },
  { value: "cliente", label: "Clientes" },
];

const columns: Column<Profile>[] = [
  {
    key: "nome",
    header: "Nome",
    render: (u) => (
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {(u.nome ?? u.email ?? "?").charAt(0).toUpperCase()}
        </span>
        <div>
          <div className="text-sm font-semibold">{u.nome ?? "—"}</div>
          <div className="text-[11px] text-muted">{u.email ?? "—"}</div>
        </div>
      </div>
    ),
  },
  {
    key: "whatsapp",
    header: "WhatsApp",
    render: (u) => <span className="text-sm text-muted">{u.whatsapp ?? "—"}</span>,
  },
  {
    key: "role",
    header: "Perfil",
    render: (u) =>
      u.role === "admin" ? (
        <span className="inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
          Admin
        </span>
      ) : (
        <span className="inline-flex rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">
          Cliente
        </span>
      ),
  },
  {
    key: "created",
    header: "Desde",
    render: (u) => <span className="text-xs text-muted">{formatDate(u.created_at)}</span>,
  },
];

export default async function AdminUsuarios({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { rows, total, page, pageSize } = await getUsuariosPaginated({
    q: sp.q,
    role: sp.role,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div>
      <PageHeader
        title="Usuários"
        description={`${total} usuário${total === 1 ? "" : "s"} no total`}
      />
      <Toolbar>
        <TableSearch param="q" placeholder="Buscar por nome ou e-mail…" />
        <TableFilter param="role" label="Perfil" options={ROLE_OPTS} />
      </Toolbar>

      <DataTable
        rows={rows}
        columns={columns}
        total={total}
        page={page}
        pageSize={pageSize}
        emptyMessage="Nenhum usuário encontrado."
      />

      <p className="mt-4 text-xs text-muted">
        Para promover alguém a admin, rode no SQL do Supabase:{" "}
        <code className="ml-1 rounded bg-surface-2 px-1.5 py-0.5">
          update public.profiles set role=&apos;admin&apos; where email=&apos;seu@email.com&apos;;
        </code>
      </p>
    </div>
  );
}
