"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/cars?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="hidden max-w-xs flex-1 sm:flex">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search cars…"
        className="h-9 w-full rounded-l-md border border-border bg-background-subtle px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
      />
      <button
        type="submit"
        className="h-9 rounded-r-md border border-l-0 border-border bg-background-subtle px-3 text-foreground-muted hover:bg-border"
        aria-label="Search"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </button>
    </form>
  );
}
