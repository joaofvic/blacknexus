"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import type { ActionState } from "@/lib/admin-actions";
import type { Avaliacao } from "@/lib/database.types";
import { useToast } from "./use-toast";

const inputCls =
  "w-full rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function AvaliacaoForm({
  produtos,
  avaliacao,
  action,
  onSuccess,
}: {
  produtos: { id: string; nome: string }[];
  avaliacao?: Avaliacao;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  onSuccess?: () => void;
}) {
  const { push } = useToast();
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    push({ kind: state.ok ? "success" : "error", message: state.message });
    if (state.ok && !avaliacao) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, push, avaliacao, onSuccess]);

  const dataDefault = avaliacao?.created_at
    ? new Date(avaliacao.created_at).toISOString().slice(0, 16)
    : "";

  return (
    <form ref={formRef} action={dispatch} className="grid gap-3 sm:grid-cols-2">
      {avaliacao && <input type="hidden" name="id" value={avaliacao.id} />}

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">Produto</label>
        <select
          name="produto_id"
          required
          defaultValue={avaliacao?.produto_id ?? ""}
          className={inputCls}
        >
          <option value="">— selecione —</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Nome do autor</label>
        <input
          name="autor_nome"
          required
          defaultValue={avaliacao?.autor_nome ?? ""}
          className={inputCls}
          placeholder="Ex.: João S."
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Nota (1–5)</label>
        <select
          name="nota"
          required
          defaultValue={String(avaliacao?.nota ?? 5)}
          className={inputCls}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} ★</option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">Texto</label>
        <textarea
          name="texto"
          rows={3}
          defaultValue={avaliacao?.texto ?? ""}
          className={inputCls}
          placeholder="Comentário…"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-muted">
          Data (opcional — deixa em branco para usar agora)
        </label>
        <input
          name="created_at"
          type="datetime-local"
          defaultValue={dataDefault}
          className={inputCls}
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : avaliacao ? "Salvar avaliação" : "Criar avaliação"}
        </Button>
      </div>
    </form>
  );
}
