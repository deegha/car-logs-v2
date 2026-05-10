import { redirect } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { getSellerSession } from "@/lib/auth"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account",
}

export default async function RegisterPage() {
  const session = await getSellerSession()
  if (session) {
    redirect("/seller/dashboard")
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-background-subtle py-16">
        <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-foreground">Create Account</h1>
          <RegisterForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
