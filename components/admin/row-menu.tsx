"use client";

import type { ReactNode } from "react";
import { MoreIcon } from "./icons";

export function RowMenu({ children }: { children: ReactNode }) {
  return (
    <details className="dropdown-menu relative">
      <summary className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-foreground">
        <MoreIcon />
      </summary>
      <div className="dropdown-panel p-1.5">{children}</div>
    </details>
  );
}

export function RowMenuItem({
  onClick,
  children,
  danger,
}: {
  onClick?: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
        danger
          ? "text-danger hover:bg-danger/10"
          : "text-foreground hover:bg-surface-2"
      }`}
    >
      {children}
    </button>
  );
}
