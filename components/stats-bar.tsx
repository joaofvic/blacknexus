const stats = [
  { valor: "+5 mil", label: "Pedidos entregues" },
  { valor: "4.9/5", label: "Avaliação média" },
  { valor: "99.8%", label: "Taxa de satisfação" },
];

export function StatsBar() {
  return (
    <div className="mx-auto grid max-w-lg grid-cols-3 gap-2 rounded-2xl border border-border bg-surface/60 p-5">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-2xl font-extrabold text-primary">{s.valor}</div>
          <div className="mt-1 text-xs text-muted">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
