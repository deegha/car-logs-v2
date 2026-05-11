import Link from "next/link";
import { CarlogsLogo } from "./CarlogsLogo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background-subtle py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CarlogsLogo textClassName="text-lg font-bold text-foreground" />
            <p className="mt-1 max-w-xs text-sm text-foreground-muted">
              Connecting buyers and sellers of quality pre-owned vehicles across Sri Lanka.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <nav className="flex flex-col gap-2">
              <p className="font-semibold text-foreground">Browse</p>
              <Link href="/cars" className="text-foreground-muted hover:text-foreground">
                All Cars
              </Link>
              <Link href="/sell" className="text-foreground-muted hover:text-foreground">
                Sell Your Car
              </Link>
            </nav>
            <nav className="flex flex-col gap-2">
              <p className="font-semibold text-foreground">Account</p>
              <Link href="/auth/login" className="text-foreground-muted hover:text-foreground">
                Sign in
              </Link>
              <Link href="/auth/register" className="text-foreground-muted hover:text-foreground">
                Register
              </Link>
              <Link
                href="/seller/dashboard"
                className="text-foreground-muted hover:text-foreground"
              >
                My Listings
              </Link>
            </nav>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-center text-xs text-foreground-muted">
          &copy; {new Date().getFullYear()} carlogs.lk. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
