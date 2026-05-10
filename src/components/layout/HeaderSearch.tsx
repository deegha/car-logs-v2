"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function HeaderSearch() {
  const router = useRouter()
  const [value, setValue] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim()) {
      router.push(`/cars?search=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hidden max-w-xs flex-1 sm:flex">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search cars…"
        className="h-9 w-full rounded-md border border-border bg-background-subtle px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    </form>
  )
}
