import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminUsuarios() {
  const admin = createAdminClient();
  const { data: usuarios } = await admin
    .from("profiles")
    .select("id, nome, email, whatsapp, role, created_at")
    .order("created_at", { ascending: false });

  const lista = usuarios ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Usuários</h1>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-muted">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Perfil</th>
              <th className="p-3">Desde</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3">{u.nome ?? "—"}</td>
                <td className="p-3 text-muted">{u.email ?? "—"}</td>
                <td className="p-3 text-muted">{u.whatsapp ?? "—"}</td>
                <td className="p-3">
                  <span className={u.role === "admin" ? "text-primary font-semibold" : "text-muted"}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-muted">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lista.length === 0 && <p className="mt-4 text-sm text-muted">Nenhum usuário.</p>}

      <p className="mt-4 text-xs text-muted">
        Para promover alguém a admin, rode no SQL do Supabase:
        <code className="ml-1 rounded bg-surface-2 px-1.5 py-0.5">
          update public.profiles set role=&apos;admin&apos; where email=&apos;seu@email.com&apos;;
        </code>
      </p>
    </div>
  );
}
