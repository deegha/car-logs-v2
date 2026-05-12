"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  className,
  placeholder = "Search by make, model, or title…",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
      sendGAEvent("event", "search_performed", { query: value.trim() });
    } else {
      params.delete("search");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/cars?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-md bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        Search
      </button>
    </form>
  );
}
