import { Skeleton } from "@/components/admin/skeleton";
import { PageHeaderSkeleton } from "@/components/admin/table-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-60 rounded-xl" />
        <Skeleton className="h-60 rounded-xl lg:col-span-2" />
      </section>
    </div>
  );
}
