"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export function RegisterForm() {
  const router = useRouter()
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setFields((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Registration failed")
        return
      }
      router.push("/seller/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={fields.firstName}
          onChange={update("firstName")}
          required
          autoComplete="given-name"
        />
        <Input
          label="Last Name"
          value={fields.lastName}
          onChange={update("lastName")}
          required
          autoComplete="family-name"
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={fields.email}
        onChange={update("email")}
        required
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Input
        label="Phone"
        type="tel"
        value={fields.phone}
        onChange={update("phone")}
        required
        autoComplete="tel"
        placeholder="04xx xxx xxx"
      />

      <Input
        label="Password"
        type="password"
        value={fields.password}
        onChange={update("password")}
        required
        autoComplete="new-password"
        placeholder="••••••••"
        helperText="Minimum 8 characters"
      />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
