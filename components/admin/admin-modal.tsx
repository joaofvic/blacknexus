"use client";

import { useEffect, useRef } from "react";

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "default" | "primary" | "ghost";

const sizeCls: Record<Size, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
};

const triggerCls: Record<Variant, string> = {
  default:
    "inline-flex h-8 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-border bg-surface-2 px-2.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-foreground",
  primary:
    "inline-flex h-9 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-primary/40 bg-primary/15 px-3 text-xs font-bold text-primary transition hover:bg-primary/25",
  ghost:
    "inline-flex h-8 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-foreground",
};

export function AdminModal({
  triggerLabel,
  triggerAriaLabel,
  title,
  size = "lg",
  variant = "default",
  children,
}: {
  triggerLabel: React.ReactNode;
  triggerAriaLabel?: string;
  title: string;
  size?: Size;
  variant?: Variant;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function open() {
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
  }

  // Backdrop click closes the dialog
  function onClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) close();
  }

  // Prevent body scroll while open
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const obs = new MutationObserver(() => {
      document.documentElement.style.overflow = dlg.open ? "hidden" : "";
    });
    obs.observe(dlg, { attributes: true, attributeFilter: ["open"] });
    return () => {
      obs.disconnect();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={triggerCls[variant]}
        aria-label={triggerAriaLabel ?? (typeof triggerLabel === "string" ? triggerLabel : undefined)}
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClick={onClick}
        className={`admin-modal w-full max-w-full h-[100dvh] sm:h-auto sm:max-h-[90dvh] ${sizeCls[size]} rounded-none sm:rounded-xl border border-border bg-surface-1 p-0 text-foreground shadow-2xl backdrop:bg-black/55`}
      >
        <div className="flex h-full flex-col sm:max-h-[90dvh]">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface-1/95 px-5 py-3 backdrop-blur">
            <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </dialog>
    </>
  );
}
