import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-subtle">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xl font-bold text-primary-600">carlogs.lk</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="mt-1 text-sm text-foreground-muted">Administration panel</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
