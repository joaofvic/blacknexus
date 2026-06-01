import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { PedidoStatus } from "@/lib/database.types";

type Variant = "primary" | "outline" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "btn-buy",
  outline: "border border-border bg-surface-2 hover:border-primary text-foreground",
  ghost: "hover:bg-surface-2 text-foreground",
  danger: "bg-danger text-white hover:brightness-110",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, variantClasses[variant], className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className,
  href,
  children,
}: {
  variant?: Variant;
  className?: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variantClasses[variant], className)}>
      {children}
    </Link>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-muted", className)}>
      {children}
    </label>
  );
}

const statusInfo: Record<PedidoStatus, { label: string; cls: string }> = {
  aguardando_pagamento: { label: "Aguardando pagamento", cls: "bg-warning/15 text-warning" },
  pago: { label: "Pago", cls: "bg-accent/15 text-accent" },
  em_andamento: { label: "Em andamento", cls: "bg-primary/15 text-primary" },
  concluido: { label: "Concluído", cls: "bg-success/15 text-success" },
  cancelado: { label: "Cancelado", cls: "bg-danger/15 text-danger" },
};

export function StatusBadge({ status }: { status: PedidoStatus }) {
  const info = statusInfo[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        info.cls
      )}
    >
      {info.label}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card p-5", className)}>{children}</div>;
}

// Título de seção no estilo "NOVIDADES" com barra vermelha.
export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("section-title text-lg sm:text-xl", className)}>{children}</h2>;
}

// Selo de confiança (ex.: 100% Seguro).
export function TrustPill({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-2 text-sm font-semibold">
      <span className="text-primary">{icon}</span>
      {children}
    </span>
  );
}

// Etiqueta "À vista no Pix".
export function PixTag({ className }: { className?: string }) {
  return (
    <span className={cn("pix-tag inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold", className)}>
      <span aria-hidden>⚡</span> À vista no Pix
    </span>
  );
}

// Selo de % de desconto.
export function DiscountBadge({ pct, className }: { pct: number; className?: string }) {
  return (
    <span className={cn("discount-badge inline-flex items-center rounded-md px-2 py-0.5 text-xs", className)}>
      -{pct}%
    </span>
  );
}
