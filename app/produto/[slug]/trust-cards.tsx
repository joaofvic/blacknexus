import type { ReactNode } from "react";

function Card({
  icon,
  title,
  desc,
  children,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-4 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-lg bg-primary/15 p-1.5 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold">{title}</div>
          <div className="mt-0.5 text-xs text-muted">{desc}</div>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function TrustCards() {
  const discord = process.env.NEXT_PUBLIC_DISCORD_URL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL;

  return (
    <aside className="flex flex-col gap-3">
      <Card
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
            <path d="M12 22V12" />
            <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
          </svg>
        }
        title="Entrega imediata"
        desc="Receba seu produto imediatamente após o pagamento."
      />
      <Card
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        }
        title="Segurança total"
        desc="Seus dados são criptografados de ponta a ponta."
      />
      <Card
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        }
        title="Formas de pagamento"
        desc="Aceitamos Pix com confirmação instantânea."
      >
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
          ⚡ Pix
        </span>
      </Card>
      {(discord || whatsapp) && (
        <Card
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
            </svg>
          }
          title="Precisa de ajuda?"
          desc="Entre em contato pelos nossos canais oficiais."
        >
          <div className="flex flex-col gap-2">
            {discord && (
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                Discord
              </a>
            )}
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                WhatsApp
              </a>
            )}
          </div>
        </Card>
      )}
    </aside>
  );
}

export function ProdutoFeatureRow() {
  const items = [
    { title: "Entrega automática", desc: "Liberado na hora após o Pix" },
    { title: "Pagamento seguro", desc: "Confirmação instantânea" },
    { title: "Suporte dedicado", desc: "Atendimento humanizado" },
    { title: "Atualizações constantes", desc: "Catálogo sempre fresco" },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.title} className="min-w-0">
          <div className="text-[12px] font-semibold">{it.title}</div>
          <div className="truncate text-[11px] text-muted">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
