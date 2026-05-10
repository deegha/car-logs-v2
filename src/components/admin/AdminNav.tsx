"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/dashboard/listings", label: "Listings" },
  { href: "/admin/dashboard/sellers", label: "Sellers" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

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
