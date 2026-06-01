import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Pagination } from "./pagination";

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  total,
  page,
  pageSize,
  emptyMessage = "Nenhum resultado.",
  rowActions,
}: {
  rows: T[];
  columns: Column<T>[];
  total: number;
  page: number;
  pageSize: number;
  emptyMessage?: string;
  rowActions?: (row: T) => ReactNode;
}) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-[11px] uppercase tracking-wider text-muted">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-3 py-2.5 font-semibold",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className
                  )}
                >
                  {c.header}
                </th>
              ))}
              {rowActions && <th className="w-12 px-3 py-2.5" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="px-3 py-10 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="table-row border-t border-border">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-3 align-middle",
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                        c.className
                      )}
                    >
                      {c.render(r)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-2 py-2 text-right align-middle">{rowActions(r)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
