import type { ReactNode } from "react";

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/40 p-2">
      {children}
    </div>
  );
}
