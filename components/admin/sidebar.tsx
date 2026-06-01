import Link from "next/link";
import { ADMIN_NAV } from "./nav-config";
import { SidebarLink } from "./sidebar-link";
import { SidebarToggle } from "./sidebar-toggle";
import type { SidebarState } from "@/lib/admin-ui-actions";

export function AdminSidebar({
  state,
  email,
}: {
  state: SidebarState;
  email: string | null;
}) {
  const collapsed = state === "collapsed";
  const initial = (email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <aside className="hidden flex-col border-r border-border bg-surface/40 md:flex">
      {/* Logo + toggle */}
      <div className={`flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-extrabold tracking-tight"
            title="Voltar à loja"
          >
            <span className="text-primary neon-text">⬡</span>
            <span className="truncate">
              Black<span className="text-primary">Nexus</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" title="Voltar à loja" className="text-primary neon-text text-lg font-extrabold">
            ⬡
          </Link>
        )}
        <SidebarToggle />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {!collapsed && (
          <div className="mb-1 px-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            Painel
          </div>
        )}
        {ADMIN_NAV.map((n) => (
          <SidebarLink key={n.href} item={n} collapsed={collapsed} />
        ))}
      </nav>

      {/* Usuário + rodapé */}
      <div className="shrink-0 border-t border-border p-3">
        {collapsed ? (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary"
            title={email ?? ""}
          >
            {initial}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] text-muted">{email ?? "—"}</div>
              <div className="flex items-center gap-2 text-[10px] text-muted">
                <span>v3 • Admin</span>
                <span>·</span>
                <Link href="/" className="hover:text-primary">
                  Loja ↗
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
