"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import { salvarCategoria, type ActionState } from "@/lib/admin-actions";
import { useToast } from "./use-toast";
import type { Categoria } from "@/lib/database.types";

const inputCls =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

const tipos = ["streaming", "social", "variedades"] as const;

export function CategoriaFormClient({
  categoria,
  onSuccess,
}: {
  categoria?: Categoria;
  onSuccess?: () => void;
}) {
  const { push } = useToast();
  const [state, action, pending] = useActionState<ActionState, FormData>(salvarCategoria, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    push({ kind: state.ok ? "success" : "error", message: state.message });
    if (state.ok && !categoria && formRef.current) {
      formRef.current.reset();
      onSuccess?.();
    }
  }, [state, push, categoria, onSuccess]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-2">
      {categoria && <input type="hidden" name="id" value={categoria.id} />}
      <div>
        <label className="mb-1 block text-xs text-muted">Nome</label>
        <input name="nome" required defaultValue={categoria?.nome} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Slug</label>
        <input name="slug" required defaultValue={categoria?.slug} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Tipo</label>
        <select name="tipo" defaultValue={categoria?.tipo ?? "social"} className={inputCls}>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Ícone (emoji)</label>
        <input name="icone" defaultValue={categoria?.icone ?? ""} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Ordem</label>
        <input name="ordem" type="number" defaultValue={categoria?.ordem ?? 0} className={inputCls} />
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="ativo" defaultChecked={categoria?.ativo ?? true} /> Ativo
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : categoria ? "Salvar alterações" : "Criar categoria"}
        </Button>
      </div>
    </form>
  );
}
