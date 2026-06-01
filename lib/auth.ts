import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

// Retorna o usuário logado + profile, ou null.
export async function getSessionProfile(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { userId: user.id, email: user.email ?? null, profile: profile ?? null };
}

// Exige usuário logado; redireciona para /login se não estiver.
export async function requireUser(redirectTo = "/login") {
  const session = await getSessionProfile();
  if (!session) redirect(redirectTo);
  return session;
}

// Exige admin; redireciona caso contrário.
export async function requireAdmin() {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/admin");
  if (session.profile?.role !== "admin") redirect("/");
  return session;
}
