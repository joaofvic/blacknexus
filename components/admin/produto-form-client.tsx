"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { salvarProduto, type ActionState } from "@/lib/admin-actions";
import { useToast } from "./use-toast";
import { createClient } from "@/lib/supabase/client";
import type { Produto, Categoria } from "@/lib/database.types";

const inputCls =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function ProdutoFormClient({
  produto,
  categorias,
  onSuccess,
}: {
  produto?: Produto;
  categorias: Categoria[];
  onSuccess?: () => void;
}) {
  const { push } = useToast();
  const [state, action, pending] = useActionState<ActionState, FormData>(salvarProduto, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!state) return;
    push({ kind: state.ok ? "success" : "error", message: state.message });
    if (state.ok && !produto && formRef.current) {
      formRef.current.reset();
      onSuccess?.();
    }
  }, [state, push, produto, onSuccess]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("imagem") as File | null;
    formData.delete("imagem");

    if (file && file.size > 0) {
      setUploading(true);
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() || "png";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("produtos")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) {
          push({ kind: "error", message: `Falha no upload: ${upErr.message}` });
          setUploading(false);
          return;
        }
        const { data } = supabase.storage.from("produtos").getPublicUrl(path);
        formData.set("imagem_url", data.publicUrl);
      } finally {
        setUploading(false);
      }
    }

    startTransition(() => action(formData));
  }

  const busy = pending || uploading;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
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
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
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

      <fieldset className="sm:col-span-2 rounded-lg border border-border p-3">
        <legend className="px-1 text-xs text-muted">Serviço SMM</legend>
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

      <fieldset className="sm:col-span-2 rounded-lg border border-border p-3">
        <legend className="px-1 text-xs text-muted">Assinatura</legend>
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
          Preço original / &quot;de&quot; (opcional)
        </label>
        <input
          name="preco_original"
          type="number"
          step="0.01"
          defaultValue={produto?.preco_original ?? ""}
          className={inputCls}
          placeholder="Ex.: 49.90"
        />
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
        <Button type="submit" disabled={busy}>
          {uploading
            ? "Enviando imagem…"
            : pending
              ? "Salvando…"
              : produto
                ? "Salvar alterações"
                : "Criar produto"}
        </Button>
      </div>
    </form>
  );
}
