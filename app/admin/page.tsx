import { formatBRL } from "@/lib/format";
import {
  getKpis,
  getRevenueLast14Days,
  getUrgentQueue,
  getRecentOrders,
  getTopProducts,
} from "@/lib/admin-queries";
import { PageHeader } from "@/components/admin/page-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { QueueList } from "@/components/admin/queue-list";
import { TopProducts } from "@/components/admin/top-products";
import { OrdersIcon, ProductsIcon, DashboardIcon, UsersIcon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [kpis, chart, urgent, recent, top] = await Promise.all([
    getKpis(),
    getRevenueLast14Days(),
    getUrgentQueue(5),
    getRecentOrders(8),
    getTopProducts(5),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumo"
        description="Visão geral da operação — atualizado em tempo real."
      />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Receita do mês"
          value={formatBRL(kpis.receitaMes)}
          delta={kpis.receitaMesDelta}
          hint="vs. mês anterior"
          icon={<DashboardIcon />}
          accent="primary"
        />
        <KpiCard
          label="Pedidos hoje"
          value={String(kpis.pedidosHoje)}
          delta={kpis.pedidosHojeDelta}
          hint="vs. ontem"
          icon={<OrdersIcon />}
          accent="accent"
        />
        <KpiCard
          label="Na fila"
          value={String(kpis.pendentes)}
          hint="pagos aguardando entrega"
          icon={<ProductsIcon />}
          accent="warning"
        />
        <KpiCard
          label="Ticket médio"
          value={formatBRL(kpis.ticketMedio)}
          delta={kpis.ticketMedioDelta}
          hint="vs. mês anterior"
          icon={<UsersIcon />}
          accent="success"
        />
      </section>

      {/* Chart + Urgent */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={chart} />
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
              Fila urgente
            </h3>
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">
              Pagos
            </span>
          </div>
          <QueueList items={urgent} emptyMessage="Nenhum pedido aguardando entrega. 🎉" />
        </div>
      </section>

      {/* Top products + Recent */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
            Top produtos · 30 dias
          </h3>
          <TopProducts items={top} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">
            Pedidos recentes
          </h3>
          <QueueList items={recent} emptyMessage="Ainda não há pedidos." />
        </div>
      </section>
    </div>
  );
}
