"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { criarAvaliacao, type AvaliacaoActionState } from "./actions";
import { Button } from "@/components/ui";

function Estrela({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function FormAvaliacao({
  produtoId,
  slug,
}: {
  produtoId: string;
  slug: string;
}) {
  const [state, action, pending] = useActionState<AvaliacaoActionState, FormData>(
    criarAvaliacao,
    null
  );
  const [nota, setNota] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-success">
        {state.message}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-xl border border-border bg-surface-2 p-4"
    >
      <input type="hidden" name="produto_id" value={produtoId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="nota" value={nota} />

      <div className="mb-3">
        <div className="mb-1.5 text-sm font-semibold">Sua nota</div>
        <div className="flex gap-1 text-warning">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setNota(n)}
              aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
              className="transition hover:scale-110"
            >
              <Estrela active={(hover ?? nota) >= n} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="mb-1.5 block text-sm font-semibold">Comentário</label>
        <textarea
          name="texto"
          rows={3}
          maxLength={1000}
          placeholder="Conte como foi sua experiência…"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {state && !state.ok && (
        <p className="mb-3 text-sm text-danger">{state.message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar avaliação"}
      </Button>
    </form>
  );
}
