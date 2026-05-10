import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import type { ReactNode } from "react";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background-subtle">
      <aside className="w-56 shrink-0 border-r border-border bg-background p-4">
        <div className="mb-6">
          <p className="text-lg font-bold text-primary-600">PrestigeRides</p>
          <p className="text-xs text-foreground-muted">Admin Panel</p>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
