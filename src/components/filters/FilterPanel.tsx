"use client";

import Form from "next/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AutoComplete } from "@/components/ui/AutoComplete";
import { sendGAEvent } from "@next/third-parties/google";
import { currency } from "@/config/app";
import { CAR_MAKES, getModels } from "@/data/carMakes";
import { BODY_TYPES } from "@/data/bodyTypes";

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [make, setMake] = useState(searchParams.get("make") ?? "");
  const [model, setModel] = useState(searchParams.get("model") ?? "");
  const [condition, setCondition] = useState(searchParams.get("condition") ?? "");
  const [bodyType, setBodyType] = useState(searchParams.get("bodyType") ?? "");
  const [minYear, setMinYear] = useState(searchParams.get("minYear") ?? "");
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentSearch = searchParams.get("search") ?? "";

  function resetFilters() {
    sendGAEvent("event", "filter_reset");
    setMake("");
    setModel("");
    setCondition("");
    setBodyType("");
    setMinYear("");
    setMaxYear("");
    setMinPrice("");
    setMaxPrice("");
    router.push(currentSearch ? `/cars?search=${encodeURIComponent(currentSearch)}` : "/cars");
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i));

  return (
    <Form
      action="/cars"
      className="flex flex-col gap-4"
      onSubmit={() =>
        sendGAEvent("event", "filter_applied", {
          make: make || undefined,
          model: model || undefined,
          condition: condition || undefined,
          body_type: bodyType || undefined,
          min_year: minYear || undefined,
          max_year: maxYear || undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
        })
      }
    >
      {/* Hidden inputs serialized into URL on submit — only when non-empty for clean URLs */}
      {currentSearch && <input type="hidden" name="search" value={currentSearch} />}
      {make && <input type="hidden" name="make" value={make} />}
      {model && <input type="hidden" name="model" value={model} />}
      {condition && <input type="hidden" name="condition" value={condition} />}
      {bodyType && <input type="hidden" name="bodyType" value={bodyType} />}
      {minYear && <input type="hidden" name="minYear" value={minYear} />}
      {maxYear && <input type="hidden" name="maxYear" value={maxYear} />}
      {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
      {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}

      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        className="flex w-full items-center justify-between lg:pointer-events-none lg:cursor-default"
        aria-expanded={mobileOpen}
      >
        <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
          Filters
        </h2>
        <svg
          className={`h-4 w-4 text-foreground-muted transition-transform lg:hidden ${mobileOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`flex flex-col gap-4 ${mobileOpen ? "flex" : "hidden"} lg:flex`}>
        <FilterGroup label="Make">
          <AutoComplete
            value={make}
            onChange={(v) => {
              setMake(v);
              setModel("");
            }}
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

        <FilterGroup label="Condition">
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="field-input w-full"
          >
            <option value="">All conditions</option>
            <option value="NEW">Brand New</option>
            <option value="USED">Used</option>
            <option value="RECONDITIONED">Reconditioned</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Body Type">
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="field-input w-full"
          >
            <option value="">All body types</option>
            {BODY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label="Year">
          <div className="flex gap-2">
            <select
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              className="field-input flex-1"
            >
              <option value="">From</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
              className="field-input flex-1"
            >
              <option value="">To</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
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
          <Button type="submit" className="w-full">
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={resetFilters}
            className="w-full text-foreground-muted"
          >
            Reset
          </Button>
        </div>
      </div>
    </Form>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
