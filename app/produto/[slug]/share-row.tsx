"use client";

import { useState } from "react";

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconWhats() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.43 13.92c-.23.65-1.36 1.27-1.86 1.31-.47.04-1.03.06-1.66-.1-.38-.1-.87-.27-1.5-.54-2.65-1.14-4.37-3.8-4.5-3.97-.13-.18-1.08-1.43-1.08-2.73 0-1.3.68-1.94.92-2.21.24-.27.53-.34.7-.34.18 0 .35 0 .5.01.16.01.38-.06.6.46.23.53.77 1.83.84 1.96.07.13.12.28.02.46-.09.18-.14.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.27-.12.53.16.27.7 1.15 1.5 1.86 1.04.93 1.91 1.22 2.18 1.36.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.25.09 1.54.73 1.81.86.27.13.45.2.51.31.07.11.07.62-.16 1.27z"/>
    </svg>
  );
}

function IconTg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 2L2 11l6 2 2 6 4-4 5 4z"/>
    </svg>
  );
}

export function ShareRow({ nome }: { nome: string }) {
  const [copiado, setCopiado] = useState(false);

  function url(): string {
    return typeof window === "undefined" ? "" : window.location.href;
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* noop */
    }
  }

  function openShare(target: "wpp" | "tg") {
    const u = encodeURIComponent(url());
    const t = encodeURIComponent(`Confira: ${nome}`);
    const href =
      target === "wpp"
        ? `https://wa.me/?text=${t}%20${u}`
        : `https://t.me/share/url?url=${u}&text=${t}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-muted transition hover:border-primary hover:text-foreground";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] uppercase tracking-wider text-muted">
        Compartilhar
      </span>
      <button type="button" onClick={copiar} className={btn} aria-label="Copiar link">
        {copiado ? <IconCheck /> : <IconLink />}
        {copiado ? "Copiado" : "Copiar link"}
      </button>
      <button
        type="button"
        onClick={() => openShare("wpp")}
        className={btn}
        aria-label="Compartilhar no WhatsApp"
      >
        <IconWhats />
        WhatsApp
      </button>
      <button
        type="button"
        onClick={() => openShare("tg")}
        className={btn}
        aria-label="Compartilhar no Telegram"
      >
        <IconTg />
        Telegram
      </button>
    </div>
  );
}
