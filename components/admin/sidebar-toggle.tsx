"use client";

import { useTransition } from "react";
import { toggleSidebar } from "@/lib/admin-ui-actions";
import { MenuIcon } from "./icons";

export function SidebarToggle() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Alternar menu"
      disabled={pending}
      onClick={() => start(() => toggleSidebar())}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted transition hover:border-primary hover:text-foreground disabled:opacity-60"
    >
      <MenuIcon />
    </button>
  );
}
