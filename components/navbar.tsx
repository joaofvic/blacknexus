"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/cart-provider";

interface NavCategoria {
  nome: string;
  slug: string;
}

export function Navbar({ categorias }: { categorias: NavCategoria[] }) {
  const { count } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

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

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    setIsAdmin(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="text-primary neon-text">⬡</span>
          <span>
            Black<span className="text-primary">Nexus</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              {c.nome}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/carrinho"
            className="relative rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
          >
            🛒
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          {email ? (
            <div className="hidden items-center gap-2 sm:flex">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-border px-3 py-2 text-sm hover:border-primary"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/conta"
                className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
              >
                Minha conta
              </Link>
              <button
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm text-muted hover:text-danger"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="btn-buy rounded-lg px-3 py-2 text-sm font-bold"
              >
                Criar conta
              </Link>
            </div>
          )}

          <button
            className="rounded-lg px-2 py-2 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 md:hidden">
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
