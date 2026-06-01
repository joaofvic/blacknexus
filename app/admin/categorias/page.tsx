import { createAdminClient } from "@/lib/supabase/admin";
import { salvarCategoria, excluirCategoria } from "@/lib/admin-actions";
import { Button } from "@/components/ui";
import type { Categoria } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const tipos = ["streaming", "social", "variedades"] as const;

function CategoriaForm({ categoria }: { categoria?: Categoria }) {
  return (
    <form action={salvarCategoria} className="grid gap-3 sm:grid-cols-2">
      {categoria && <input type="hidden" name="id" value={categoria.id} />}
      <div>
        <label className="mb-1 block text-xs text-muted">Nome</label>
        <input name="nome" required defaultValue={categoria?.nome}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Slug</label>
        <input name="slug" required defaultValue={categoria?.slug}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Tipo</label>
        <select name="tipo" defaultValue={categoria?.tipo ?? "social"}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm">
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Ícone (emoji)</label>
        <input name="icone" defaultValue={categoria?.icone ?? ""}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Ordem</label>
        <input name="ordem" type="number" defaultValue={categoria?.ordem ?? 0}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="ativo" defaultChecked={categoria?.ativo ?? true} />
        Ativo
      </label>
      <div className="sm:col-span-2">
        <Button type="submit">{categoria ? "Salvar" : "Criar categoria"}</Button>
      </div>
    </form>
  );
}

export default async function AdminCategorias() {
  const admin = createAdminClient();
  const { data: categorias } = await admin.from("categorias").select("*").order("ordem");
  const lista = categorias ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Categorias</h1>

      <details className="card mb-6 p-4">
        <summary className="cursor-pointer font-semibold text-primary">+ Nova categoria</summary>
        <div className="mt-4"><CategoriaForm /></div>
      </details>

      <div className="flex flex-col gap-3">
        {lista.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.icone ?? "✨"}</span>
                <div>
                  <div className="font-semibold">{c.nome}</div>
                  <div className="text-xs text-muted">/{c.slug} • {c.tipo} {c.ativo ? "" : "• inativo"}</div>
                </div>
              </div>
              <form action={excluirCategoria}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs text-muted hover:text-danger">excluir</button>
              </form>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-muted">editar</summary>
              <div className="mt-3"><CategoriaForm categoria={c} /></div>
            </details>
          </div>
        ))}
        {lista.length === 0 && <p className="text-sm text-muted">Nenhuma categoria.</p>}
      </div>
    </div>
  );
}
