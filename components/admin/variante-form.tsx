"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import type { ActionState } from "@/lib/admin-actions";
import type { ProdutoVariante } from "@/lib/database.types";
import { useToast } from "./use-toast";

const inputCls =
  "w-full rounded-md border border-border bg-surface-2 px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function VarianteForm({
  produtoId,
  variante,
  action,
}: {
  produtoId: string;
  variante?: ProdutoVariante;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const { push } = useToast();
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    push({ kind: state.ok ? "success" : "error", message: state.message });
    if (state.ok && !variante) formRef.current?.reset();
  }, [state, push, variante]);

  return (
    <form ref={formRef} action={dispatch} className="grid gap-2 sm:grid-cols-2">
      <input type="hidden" name="produto_id" value={produtoId} />
      {variante && <input type="hidden" name="id" value={variante.id} />}

      <div>
        <label className="mb-0.5 block text-[10px] text-muted">Nome</label>
        <input name="nome" required defaultValue={variante?.nome} className={inputCls} placeholder="Ex.: 1 mês" />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] text-muted">Duração</label>
        <input name="duracao" defaultValue={variante?.duracao ?? ""} className={inputCls} placeholder="30 dias" />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] text-muted">Preço</label>
        <input
          name="preco"
          type="number"
          step="0.01"
          required
          defaultValue={variante?.preco ?? ""}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] text-muted">Preço original (de)</label>
        <input
          name="preco_original"
          type="number"
          step="0.01"
          defaultValue={variante?.preco_original ?? ""}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] text-muted">Estoque (vazio = ilimitado)</label>
        <input
          name="estoque"
          type="number"
          defaultValue={variante?.estoque ?? ""}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] text-muted">Ordem</label>
        <input
          name="ordem"
          type="number"
          defaultValue={variante?.ordem ?? 0}
          className={inputCls}
        />
      </div>

      <label className="flex items-center gap-2 text-xs sm:col-span-2">
        <input type="checkbox" name="ativo" defaultChecked={variante?.ativo ?? true} />
        Ativa
      </label>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : variante ? "Salvar variante" : "Criar variante"}
        </Button>
      </div>
    </form>
  );
}
