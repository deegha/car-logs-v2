"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/types";

const ALL_LINKS = [
  { href: "/admin/dashboard", label: "Overview", roles: ["SUPER_ADMIN", "MANAGER", "EDITOR"] },
  {
    href: "/admin/dashboard/listings",
    label: "Listings",
    roles: ["SUPER_ADMIN", "MANAGER", "EDITOR"],
  },
  { href: "/admin/dashboard/sellers", label: "Users", roles: ["SUPER_ADMIN"] },
  { href: "/admin/dashboard/admins", label: "Admins", roles: ["SUPER_ADMIN"] },
];

export function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = ALL_LINKS.filter((l) => l.roles.includes(role));

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <nav className="flex flex-col gap-1">
      <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-foreground-muted uppercase">
        Admin
      </p>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-primary-50 text-primary-700"
              : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
          )}
        >
          {label}
        </Link>
      ))}

      <div className="mt-4 border-t border-border pt-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-foreground-muted hover:bg-background-subtle hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
