"use client";

import { useCallback, useEffect, useState } from "react";
import { ToastContext, type Toast } from "./use-toast";
import { cn } from "@/lib/cn";

type Active = Toast & { id: string };

const iconFor: Record<Toast["kind"], string> = {
  success: "✓",
  error: "✕",
  info: "ⓘ",
};

export function Toaster({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Active[]>([]);

  const push = useCallback((t: Toast) => {
    const id = t.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Active; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      role="status"
      className={cn(
        "toast pointer-events-auto flex items-start gap-3 px-4 py-3 text-sm",
        toast.kind === "success" && "toast-success",
        toast.kind === "error" && "toast-error",
        toast.kind === "info" && "toast-info"
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          toast.kind === "success" && "bg-success/20 text-success",
          toast.kind === "error" && "bg-danger/20 text-danger",
          toast.kind === "info" && "bg-accent/20 text-accent"
        )}
      >
        {iconFor[toast.kind]}
      </span>
      <div className="flex-1 leading-snug">{toast.message}</div>
      <button
        onClick={onDone}
        className="-mr-1 text-muted transition hover:text-foreground"
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  );
}
