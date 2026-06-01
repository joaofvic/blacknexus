"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/cart-provider";

interface NavCategoria {
  nome: string;
  slug: string;
}

function IconSearch({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconBag({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconMenu({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-extrabold tracking-tight">
      <span className="relative grid h-8 w-8 place-items-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
          <defs>
            <linearGradient id="hex-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff3343" />
              <stop offset="100%" stopColor="#c70612" />
            </linearGradient>
          </defs>
          <polygon
            points="16,2 28,9 28,23 16,30 4,23 4,9"
            fill="url(#hex-grad)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
          />
          <polygon
            points="16,8 23,12 23,20 16,24 9,20 9,12"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
        </svg>
        <span className="pointer-events-none absolute inset-0 rounded-full blur-md bg-primary/40 -z-10" />
      </span>
      <span className="font-display text-base">
        Black<span className="text-primary">Nexus</span>
      </span>
    </Link>
  );
}

export function Navbar({ categorias }: { categorias: NavCategoria[] }) {
  const { count } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    setIsAdmin(false);
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const termo = q.trim();
    if (!termo) return;
    router.push(`/buscar?q=${encodeURIComponent(termo)}`);
    setQ("");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5">
        <Logo />

        {/* Busca central */}
        <form
          onSubmit={handleSearch}
          className="mx-3 hidden flex-1 items-center gap-2 rounded-xl border border-border/70 bg-surface/50 px-4 py-2 backdrop-blur focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 md:flex"
        >
          <IconSearch className="text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produtos..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          />
          <kbd className="hidden rounded border border-border/70 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted lg:block">
            ⌘K
          </kbd>
        </form>

        {/* Ações direita */}
        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/carrinho"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface/40 text-foreground transition hover:border-primary hover:text-primary"
            aria-label="Carrinho"
          >
            <IconBag />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-lg shadow-primary/40">
                {count}
              </span>
            )}
          </Link>

          {email ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              {isAdmin && (
                <Link href="/admin" className="rounded-lg border border-border/70 px-3 py-2 text-sm font-semibold hover:border-primary">
                  Admin
                </Link>
              )}
              <Link href="/conta" className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                Conta
              </Link>
              <button onClick={logout} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-danger">
                Sair
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn-buy rounded-lg px-4 py-2 text-sm font-bold tracking-tight">
                Criar conta
              </Link>
            </div>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-surface/40 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <IconMenu />
          </button>
        </div>
      </div>

      {/* Mobile: busca + menu */}
      {open && (
        <div className="border-t border-border/60 px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex items-center gap-2 rounded-xl border border-border/70 bg-surface/50 px-4 py-2 backdrop-blur">
            <IconSearch className="text-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
            />
          </form>
          <div className="flex flex-col gap-1">
            {categorias.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
              >
                {c.nome}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {email ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                    Admin
                  </Link>
                )}
                <Link href="/conta" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                  Minha conta
                </Link>
                <button onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm text-danger">
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                  Entrar
                </Link>
                <Link href="/cadastro" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-primary">
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
