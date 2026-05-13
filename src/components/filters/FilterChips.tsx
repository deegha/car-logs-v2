"use client";

import { useRouter, useSearchParams } from "next/navigation";

const LABELS: Record<string, string> = {
  search: "Search",
  make: "Make",
  model: "Model",
  condition: "Condition",
  bodyType: "Body Type",
  minYear: "Min Year",
  maxYear: "Max Year",
  minPrice: "Min Price",
  maxPrice: "Max Price",
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Brand New",
  USED: "Used",
  RECONDITIONED: "Reconditioned",
};

const FILTER_KEYS = Object.keys(LABELS);

export function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const active = FILTER_KEYS.filter((key) => searchParams.get(key));

  if (active.length === 0) return null;

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(`/cars?${params.toString()}`);
  }

  function clearAll() {
    router.push("/cars");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((key) => (
        <span
          key={key}
          className="flex items-center gap-1 rounded-full border border-border bg-background-subtle px-3 py-1 text-sm text-foreground"
        >
          <span className="text-foreground-muted">{LABELS[key]}:</span>
          <span className="font-medium">
            {key === "condition"
              ? (CONDITION_LABELS[searchParams.get(key)!] ?? searchParams.get(key))
              : searchParams.get(key)}
          </span>
          <button
            onClick={() => removeFilter(key)}
            className="ml-1 rounded-full p-0.5 hover:bg-border"
            aria-label={`Remove ${LABELS[key]} filter`}
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
              <path
                d="M9 3L3 9M3 3l6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </span>
      ))}
      {active.length > 1 && (
        <button
          onClick={clearAll}
          className="text-sm text-foreground-muted underline hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
