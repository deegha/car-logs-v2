import Link from "next/link";
import { getSellerSession } from "@/lib/auth";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderAuthButton } from "./HeaderAuthButton";

export async function Header() {
  const session = await getSellerSession();

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background shadow-sm"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-lg font-bold text-primary-600 sm:text-xl">
          PrestigeRides
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground-muted sm:flex">
          <Link href="/cars" className="hover:text-foreground">
            Browse
          </Link>
          <Link href="/sell" className="hover:text-foreground">
            Sell Your Car
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <HeaderSearch />
          <HeaderAuthButton isLoggedIn={!!session} />
        </div>
      </div>
    </header>
  );
}
