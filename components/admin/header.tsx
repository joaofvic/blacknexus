"use client";

import { Breadcrumbs } from "./breadcrumbs";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <Breadcrumbs />
    </header>
  );
}
