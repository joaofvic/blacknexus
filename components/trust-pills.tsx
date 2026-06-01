import { TrustPill } from "@/components/ui";

const selos = [
  { icon: "🛡️", label: "100% Seguro" },
  { icon: "⚡", label: "Entrega Rápida" },
  { icon: "✅", label: "Garantia 15D" },
  { icon: "💬", label: "Suporte 24/7" },
];

export function TrustPills() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {selos.map((s) => (
        <TrustPill key={s.label} icon={s.icon}>
          {s.label}
        </TrustPill>
      ))}
    </div>
  );
}
