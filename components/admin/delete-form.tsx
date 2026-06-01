"use client";

import { useActionState, useEffect } from "react";
import { useToast } from "./use-toast";
import type { ActionState } from "@/lib/admin-actions";

type DeleteAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function DeleteForm({
  id,
  action,
  confirmMessage = "Tem certeza? Esta ação não pode ser desfeita.",
  children,
}: {
  id: string;
  action: DeleteAction;
  confirmMessage?: string;
  children?: React.ReactNode;
}) {
  const { push } = useToast();
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(action, null);

  useEffect(() => {
    if (!state) return;
    push({ kind: state.ok ? "success" : "error", message: state.message });
  }, [state, push]);

  return (
    <form
      action={dispatch}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-muted transition hover:text-danger disabled:opacity-50"
      >
        {children ?? (pending ? "Excluindo…" : "Excluir")}
      </button>
    </form>
  );
}
