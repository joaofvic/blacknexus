import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { formatBRL } from "@/lib/format";
import type { QueueOrder } from "@/lib/admin-queries";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function QueueList({ items, emptyMessage }: { items: QueueOrder[]; emptyMessage: string }) {
  if (!items.length) {
    return <p className="px-1 py-6 text-center text-sm text-muted">{emptyMessage}</p>;
  }
  return (
    <ul className="flex flex-col">
      {items.map((p) => (
        <li key={p.id}>
          <Link
            href={`/admin/pedidos/${p.id}`}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition hover:bg-surface-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {(p.cliente ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {p.cliente ?? <span className="text-muted">Cliente —</span>}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <span className="font-mono">#{p.id.slice(0, 8)}</span>
                  <span>•</span>
                  <span>{relativeTime(p.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={p.status} />
              <span className="font-bold text-primary">{formatBRL(p.total)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
