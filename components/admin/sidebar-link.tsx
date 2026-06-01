"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NavIcon } from "./icons";
import type { NavItem } from "./nav-config";

export function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname() ?? "";
  const active =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-primary/12 text-foreground"
          : "text-muted hover:bg-surface-2 hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
      )}
      <NavIcon name={item.icon} className={cn("shrink-0", active ? "text-primary" : "text-muted group-hover:text-foreground")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
