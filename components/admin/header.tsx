"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "./breadcrumbs";
import { LogoutIcon } from "./icons";

export function AdminHeader() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>
      <button
        onClick={logout}
        title="Sair"
        className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 text-xs font-semibold text-muted transition hover:border-danger/60 hover:text-danger"
      >
        <LogoutIcon width={14} height={14} />
        Sair
      </button>
    </header>
  );
}
