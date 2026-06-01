"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const termo = q.trim();
    if (!termo) return;
    router.push(`/buscar?q=${encodeURIComponent(termo)}`);
  }

  return (
    <form
      onSubmit={submit}
      className="search-shell flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-border bg-surface/70 p-1.5 backdrop-blur-md"
    >
      <span className="pl-3 text-muted" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar serviços, redes, assinaturas..."
        className="flex-1 bg-transparent px-1 py-2.5 text-sm text-foreground placeholder:text-muted outline-none sm:text-base"
      />
      <button
        type="submit"
        className="btn-buy rounded-xl px-5 py-2.5 text-sm font-bold"
      >
        Buscar
      </button>
    </form>
  );
}
