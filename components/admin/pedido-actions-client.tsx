"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui";
import { atualizarStatusPedido, entregarItem, type ActionState } from "@/lib/admin-actions";
import { useToast } from "./use-toast";
import { formatDate } from "@/lib/format";
import type { PedidoStatus } from "@/lib/database.types";

const STATUS_OPTIONS: { value: PedidoStatus; label: string }[] = [
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "pago", label: "Pago" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

export function StatusForm({
  pedidoId,
  current,
}: {
  pedidoId: string;
  current: PedidoStatus;
}) {
  const { push } = useToast();
  const [state, action, pending] = useActionState<ActionState, FormData>(atualizarStatusPedido, null);

  useEffect(() => {
    if (!state) return;
    push({ kind: state.ok ? "success" : "error", message: state.message });
  }, [state, push]);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="pedido_id" value={pedidoId} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Status do pedido
        </label>
        <select
          name="status"
          defaultValue={current}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Atualizando…" : "Atualizar status"}
      </Button>
    </form>
  );
}

export function DeliveryForm({
  itemId,
  pedidoId,
  initial,
  deliveredAt,
}: {
  itemId: string;
  pedidoId: string;
  initial: string | null;
  deliveredAt: string | null;
}) {
  const { push } = useToast();
  const [state, action, pending] = useActionState<ActionState, FormData>(entregarItem, null);

  useEffect(() => {
    if (!state) return;
    push({ kind: state.ok ? "success" : "error", message: state.message });
  }, [state, push]);

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="item_id" value={itemId} />
      <input type="hidden" name="pedido_id" value={pedidoId} />
      <label className="text-xs font-medium text-muted">
        Conteúdo entregue (login/senha, código ou observação)
      </label>
      <textarea
        name="conteudo_entregue"
        defaultValue={initial ?? ""}
        rows={3}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        placeholder="Ex.: Login: email@x.com | Senha: 1234"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Salvando…" : "Salvar entrega"}
        </Button>
        {deliveredAt && (
          <span className="text-xs text-success">
            ✓ Entregue em {formatDate(deliveredAt)}
          </span>
        )}
      </div>
    </form>
  );
}
