import { createAdminClient } from "@/lib/supabase/admin";
import { salvarProduto, excluirProduto } from "@/lib/admin-actions";
import { Button } from "@/components/ui";
import { formatBRL } from "@/lib/format";
import type { Produto, Categoria } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm";

function ProdutoForm({
  produto,
  categorias,
}: {
  produto?: Produto;
  categorias: Categoria[];
}) {
  return (
    <form action={salvarProduto} className="grid gap-3 sm:grid-cols-2">
      {produto && <input type="hidden" name="id" value={produto.id} />}
      <input type="hidden" name="imagem_url_atual" value={produto?.imagem_url ?? ""} />

      <div>
        <label className="mb-1 block text-xs text-muted">Nome</label>
        <input name="nome" required defaultValue={produto?.nome} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Slug</label>
        <input name="slug" required defaultValue={produto?.slug} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Categoria</label>
        <select name="categoria_id" defaultValue={produto?.categoria_id ?? ""} className={inputCls}>
          <option value="">— sem categoria —</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Tipo</label>
        <select name="tipo" defaultValue={produto?.tipo ?? "servico"} className={inputCls}>
          <option value="servico">Serviço (por quantidade)</option>
          <option value="assinatura">Assinatura (preço fixo)</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">Descrição</label>
        <textarea name="descricao" rows={2} defaultValue={produto?.descricao ?? ""} className={inputCls} />
      </div>

      {/* Campos de serviço */}
      <fieldset className="sm:col-span-2 rounded-lg border border-border p-3">
        <legend className="px-1 text-xs text-muted">Serviço SMM (se tipo = serviço)</legend>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Preço por mil</label>
            <input name="preco_por_mil" type="number" step="0.01" defaultValue={produto?.preco_por_mil ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Qtd mín.</label>
            <input name="qtd_min" type="number" defaultValue={produto?.qtd_min ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Qtd máx.</label>
            <input name="qtd_max" type="number" defaultValue={produto?.qtd_max ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Rede social</label>
            <input name="rede_social" defaultValue={produto?.rede_social ?? ""} className={inputCls} />
          </div>
        </div>
      </fieldset>

      {/* Campos de assinatura */}
      <fieldset className="sm:col-span-2 rounded-lg border border-border p-3">
        <legend className="px-1 text-xs text-muted">Assinatura (se tipo = assinatura)</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Preço</label>
            <input name="preco" type="number" step="0.01" defaultValue={produto?.preco ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Duração</label>
            <input name="duracao" defaultValue={produto?.duracao ?? ""} placeholder="30 dias" className={inputCls} />
          </div>
          <label className="flex items-end gap-2 text-sm">
            <input type="checkbox" name="precisa_link" defaultChecked={produto?.precisa_link ?? false} />
            Exige link/observação
          </label>
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">
          Preço original / &quot;de&quot; (opcional — ativa o selo de desconto)
        </label>
        <input name="preco_original" type="number" step="0.01"
          defaultValue={produto?.preco_original ?? ""} className={inputCls}
          placeholder="Ex.: 49.90 (deixe vazio se não houver promoção)" />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">Imagem (upload — opcional)</label>
        <input name="imagem" type="file" accept="image/*" className={inputCls} />
        {produto?.imagem_url && (
          <p className="mt-1 truncate text-xs text-muted">Atual: {produto.imagem_url}</p>
        )}
      </div>

      <div className="flex items-center gap-4 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="ativo" defaultChecked={produto?.ativo ?? true} /> Ativo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="destaque" defaultChecked={produto?.destaque ?? false} /> Destaque
        </label>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit">{produto ? "Salvar" : "Criar produto"}</Button>
      </div>
    </form>
  );
}

export default async function AdminProdutos() {
  const admin = createAdminClient();
  const [{ data: produtos }, { data: categorias }] = await Promise.all([
    admin.from("produtos").select("*").order("created_at", { ascending: false }),
    admin.from("categorias").select("*").order("ordem"),
  ]);
  const lista = produtos ?? [];
  const cats = categorias ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Produtos</h1>

      <details className="card mb-6 p-4">
        <summary className="cursor-pointer font-semibold text-primary">+ Novo produto</summary>
        <div className="mt-4"><ProdutoForm categorias={cats} /></div>
      </details>

      <div className="flex flex-col gap-3">
        {lista.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.nome}</div>
                <div className="text-xs text-muted">
                  /{p.slug} • {p.tipo} •{" "}
                  {p.tipo === "servico"
                    ? `${formatBRL(p.preco_por_mil ?? 0)}/mil`
                    : formatBRL(p.preco ?? 0)}
                  {p.ativo ? "" : " • inativo"}
                  {p.destaque ? " • ⭐" : ""}
                </div>
              </div>
              <form action={excluirProduto}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-xs text-muted hover:text-danger">excluir</button>
              </form>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-muted">editar</summary>
              <div className="mt-3"><ProdutoForm produto={p} categorias={cats} /></div>
            </details>
          </div>
        ))}
        {lista.length === 0 && <p className="text-sm text-muted">Nenhum produto.</p>}
      </div>
    </div>
  );
}
