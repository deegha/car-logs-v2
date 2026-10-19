import { currency } from "@/config/app";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateCarSlug(make: string, model: string, year: number, id: number): string {
  const base = `${make} ${model} ${year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${id}`;
}

export function formatPrice(price: number | string | null | undefined): string {
  // Admin-imported (e.g. Facebook) listings may not have a price yet
  if (price === null || price === undefined || price === "") return "Price on request";
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function formatMileage(km: number | null | undefined): string {
  // Admin-imported listings may not have mileage yet
  if (km === null || km === undefined) return "—";
  return new Intl.NumberFormat("en-AU").format(km) + " km";
}
