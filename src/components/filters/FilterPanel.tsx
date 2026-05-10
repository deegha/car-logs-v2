"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/Button"
import { AutoComplete } from "@/components/ui/AutoComplete"
import { currency } from "@/config/app"
import { CAR_MAKES, getModels } from "@/data/carMakes"

export function FilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [make, setMake] = useState(searchParams.get("make") ?? "")
  const [model, setModel] = useState(searchParams.get("model") ?? "")
  const [minYear, setMinYear] = useState(searchParams.get("minYear") ?? "")
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") ?? "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "")

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    const search = searchParams.get("search")
    if (search) params.set("search", search)
    if (make) params.set("make", make)
    if (model) params.set("model", model)
    if (minYear) params.set("minYear", minYear)
    if (maxYear) params.set("maxYear", maxYear)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    startTransition(() => {
      router.push(`/cars?${params.toString()}`)
    })
  }

  function resetFilters() {
    setMake("")
    setModel("")
    setMinYear("")
    setMaxYear("")
    setMinPrice("")
    setMaxPrice("")
    const params = new URLSearchParams()
    const search = searchParams.get("search")
    if (search) params.set("search", search)
    startTransition(() => {
      router.push(`/cars?${params.toString()}`)
    })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i))

  return (
    <form onSubmit={applyFilters} className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">Filters</h2>

      <FilterGroup label="Make">
        <AutoComplete
          value={make}
          onChange={(v) => { setMake(v); setModel("") }}
          options={CAR_MAKES}
          placeholder="All makes"
        />
      </FilterGroup>

      <FilterGroup label="Model">
        <AutoComplete
          value={model}
          onChange={setModel}
          options={getModels(make)}
          placeholder={make ? "Any model" : "Select a make first"}
          disabled={!make}
        />
      </FilterGroup>

      <FilterGroup label="Year">
        <div className="flex gap-2">
          <select value={minYear} onChange={(e) => setMinYear(e.target.value)} className="field-input flex-1">
            <option value="">From</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={maxYear} onChange={(e) => setMaxYear(e.target.value)} className="field-input flex-1">
            <option value="">To</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </FilterGroup>

      <FilterGroup label={`Price (${currency.code})`}>
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            min={0}
            className="field-input flex-1"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            min={0}
            className="field-input flex-1"
          />
        </div>
      </FilterGroup>

      <div className="flex flex-col gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="w-full">
          Apply Filters
        </Button>
        <Button type="button" variant="ghost" onClick={resetFilters} className="w-full text-foreground-muted">
          Reset
        </Button>
      </div>
    </form>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}
