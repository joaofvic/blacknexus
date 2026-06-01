"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "./icons";
import { BREADCRUMB_LABELS } from "./nav-config";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function labelFor(slug: string): string {
  if (BREADCRUMB_LABELS[slug]) return BREADCRUMB_LABELS[slug];
  if (UUID_RE.test(slug)) return `#${slug.slice(0, 8)}`;
  return slug;
}

export function Breadcrumbs() {
  const pathname = usePathname() ?? "/admin";
  const parts = pathname.split("/").filter(Boolean);

  const crumbs: { href: string; label: string }[] = [];
  let acc = "";
  for (const part of parts) {
    acc += "/" + part;
    crumbs.push({ href: acc, label: labelFor(part) });
  }

  return (
    <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <ChevronRightIcon className="text-muted/50" width={14} height={14} />}
            {isLast ? (
              <span className="truncate font-semibold text-foreground">{c.label}</span>
            ) : (
              <Link href={c.href} className="truncate text-muted transition hover:text-foreground">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
