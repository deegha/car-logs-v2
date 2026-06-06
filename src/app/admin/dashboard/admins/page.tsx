import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminWithRole } from "@/lib/auth";
import { AdminRole } from "@/generated/prisma/client";
import { AdminManagement } from "@/components/admin/AdminManagement";
import type { Admin } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Management" };

export default async function AdminsPage() {
  const caller = await getAdminWithRole();
  if (!caller || caller.role !== AdminRole.SUPER_ADMIN) redirect("/admin/dashboard");

  const admins = await db.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Manage admin accounts and their permission levels.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["SUPER_ADMIN", "MANAGER", "EDITOR"] as const).map((role) => {
          const count = admins.filter((a) => a.role === role).length;
          const labels = { SUPER_ADMIN: "Super Admins", MANAGER: "Managers", EDITOR: "Editors" };
          const colors = { SUPER_ADMIN: "text-primary-600", MANAGER: "text-blue-600", EDITOR: "text-green-600" };
          return (
            <div key={role} className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm text-foreground-muted">{labels[role]}</p>
              <p className={`mt-1 text-2xl font-bold ${colors[role]}`}>{count}</p>
            </div>
          );
        })}
      </div>

      <AdminManagement
        initialAdmins={admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })) as Admin[]}
        currentAdminId={caller.adminId}
      />
    </div>
  );
}
