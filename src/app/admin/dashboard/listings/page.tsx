import Link from "next/link";
import { AdminCarTable } from "@/components/admin/AdminCarTable";
import { db } from "@/lib/db";
import { CarStatus, CarCondition } from "@/generated/prisma/client";
import { buildSearchWhere } from "@/lib/carSearch";
import type { Car } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Listings",
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "AVAILABLE", label: "Available" },
  { value: "SOLD", label: "Sold" },
  { value: "RESERVED", label: "Reserved" },
  { value: "REJECTED", label: "Rejected" },
];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const statusParam = String(params.status ?? "");
  const conditionParam = String(params.condition ?? "");
  const searchParam = String(params.search ?? "").trim();

  const status = Object.values(CarStatus).includes(statusParam as CarStatus)
    ? (statusParam as CarStatus)
    : null;
  const condition = Object.values(CarCondition).includes(conditionParam as CarCondition)
    ? (conditionParam as CarCondition)
    : null;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (condition) where.condition = condition;
  if (searchParam) {
    const searchWhere = buildSearchWhere(searchParam);
    const andClauses = (searchWhere.AND as unknown[]) ?? [searchWhere];
    const existing = (where.AND as unknown[]) ?? [];
    where.AND = [...existing, ...andClauses];
  }

  const cars = await db.car.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  function filterHref(updates: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (statusParam) p.set("status", statusParam);
    if (conditionParam) p.set("condition", conditionParam);
    if (searchParam) p.set("search", searchParam);
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    return `/admin/dashboard/listings${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Listings</h1>
        <Link
          href="/admin/dashboard/listings/new"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          + Add Listing
        </Link>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={filterHref({ status: value || undefined })}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? "") === value
                ? "bg-primary-600 text-white"
                : "border border-border bg-background text-foreground hover:bg-background-subtle"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Search + condition filter */}
      <form method="GET" action="/admin/dashboard/listings" className="mb-4 flex flex-wrap gap-2">
        {statusParam && <input type="hidden" name="status" value={statusParam} />}
        <input
          type="search"
          name="search"
          defaultValue={searchParam}
          placeholder="Search by title, make, model, year…"
          className="h-9 min-w-48 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
        <select
          name="condition"
          defaultValue={conditionParam}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All conditions</option>
          <option value="NEW">Brand New</option>
          <option value="USED">Used</option>
          <option value="RECONDITIONED">Reconditioned</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700"
        >
          Filter
        </button>
        {(searchParam || conditionParam) && (
          <Link
            href={filterHref({ search: undefined, condition: undefined })}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-background-subtle"
          >
            Clear
          </Link>
        )}
      </form>

      <AdminCarTable initialCars={cars.map((c) => ({ ...c, price: Number(c.price) })) as Car[]} />
    </div>
  );
}
