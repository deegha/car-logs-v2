import { redirect } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { LoginForm } from "@/components/auth/LoginForm"
import { getSellerSession } from "@/lib/auth"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [session, params] = await Promise.all([getSellerSession(), searchParams])
  if (session) {
    redirect("/seller/dashboard")
  }

  const nextParam = params.next
  const redirectTo = nextParam
    ? String(Array.isArray(nextParam) ? nextParam[0] : nextParam)
    : "/seller/dashboard"

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-background-subtle py-16">
        <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-foreground">Sign In</h1>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
