import { requireAdmin } from "@/lib/auth";
import { getSidebarState } from "@/lib/admin-ui-actions";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { Toaster } from "@/components/admin/toaster";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const sidebar = await getSidebarState();
  const collapsed = sidebar === "collapsed";

  return (
    <Toaster>
      <div
        className={`flex min-h-screen ${collapsed ? "md:grid md:grid-cols-[4.25rem_1fr]" : "md:grid md:grid-cols-[16rem_1fr]"}`}
      >
        <AdminSidebar state={sidebar} email={session.email} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </Toaster>
  );
}
