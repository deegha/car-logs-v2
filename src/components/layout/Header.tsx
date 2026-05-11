import Link from "next/link";
import { Suspense } from "react";
import { getSellerSession } from "@/lib/auth";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderAuthButton } from "./HeaderAuthButton";
import { CarlogsLogo } from "./CarlogsLogo";

export async function Header() {
  const session = await getSellerSession();

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background shadow-sm"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <CarlogsLogo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground-muted sm:flex">
          <Link href="/cars" className="hover:text-foreground">
            Browse
          </Link>
          <Link href="/sell" className="hover:text-foreground">
            Sell Your Car
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Suspense fallback={<div className="hidden max-w-xs flex-1 sm:block" />}>
            <HeaderSearch />
          </Suspense>
          <HeaderAuthButton isLoggedIn={!!session} />
        </div>
      </div>
    </header>
  );
}
