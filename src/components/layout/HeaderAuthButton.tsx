"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

interface HeaderAuthButtonProps {
  isLoggedIn: boolean
}

export function HeaderAuthButton({ isLoggedIn }: HeaderAuthButtonProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "DELETE" })
    router.push("/")
    router.refresh()
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/seller/dashboard"
          className="hidden rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background-subtle sm:inline-flex"
        >
          My Listings
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-md p-1.5 text-foreground-muted hover:text-foreground sm:px-3 sm:py-1.5"
          aria-label="Sign out"
          title="Sign out"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="h-5 w-5 sm:hidden">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden text-sm font-medium sm:inline">Sign out</span>
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/auth/login"
      className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
    >
      Sign in
    </Link>
  )
}
