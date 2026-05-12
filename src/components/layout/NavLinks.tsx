"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/cars", label: "Browse" },
  { href: "/sell", label: "Sell Your Car" },
  { href: "/blog", label: "Blog" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              active
                ? "bg-primary-50 text-primary-700"
                : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
