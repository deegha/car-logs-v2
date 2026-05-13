import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarGrid } from "@/components/cars/CarGrid";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { FilterChips } from "@/components/filters/FilterChips";
import { SearchBar } from "@/components/filters/SearchBar";
import { db } from "@/lib/db";
import { CarStatus, CarCondition } from "@/generated/prisma/client";
import { buildSearchWhere } from "@/lib/carSearch";
import type { Car } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Cars",
  description: "Search and filter new, used and reconditioned cars.",
};

const PAGE_SIZE = 20;

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const search = String(params.search ?? "");
  const make = String(params.make ?? "");
  const model = String(params.model ?? "");
  const bodyType = String(params.bodyType ?? "");
  const conditionParam = String(params.condition ?? "");
  const minYear = Number(params.minYear) || undefined;
  const maxYear = Number(params.maxYear) || undefined;
  const minPrice = Number(params.minPrice) || undefined;
  const maxPrice = Number(params.maxPrice) || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const where = {
    status: CarStatus.AVAILABLE,
    ...(make && { make }),
    ...(model && { model }),
    ...(bodyType && { bodyType }),
    ...(conditionParam &&
      Object.values(CarCondition).includes(conditionParam as CarCondition) && {
        condition: conditionParam as CarCondition,
      }),
    ...((minYear || maxYear) && {
      year: {
        ...(minYear && { gte: minYear }),
        ...(maxYear && { lte: maxYear }),
      },
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      },
    }),
    ...(search && buildSearchWhere(search)),
  };

  const [cars, total] = await Promise.all([
    db.car.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    db.car.count({ where }),
  ]);

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
            {/* Left column: search + filters on mobile; sidebar on desktop */}
            <div className="flex flex-col gap-3 lg:w-64 lg:shrink-0">
              <Suspense>
                <SearchBar className="lg:hidden" />
              </Suspense>
              <aside className="w-full rounded-lg border border-border bg-background p-5">
                <Suspense>
                  <FilterPanel />
                </Suspense>
              </aside>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <Suspense>
                <FilterChips />
              </Suspense>

              <p className="text-sm text-foreground-muted">
                {total.toLocaleString()} {total === 1 ? "listing" : "listings"} found
              </p>

              <CarGrid cars={cars as unknown as Car[]} />

              {pages > 1 && <Pagination page={page} pages={pages} searchParams={params} />}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Pagination({
  page,
  pages,
  searchParams,
}: {
  page: number;
  pages: number;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  function buildUrl(p: number) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== "" && k !== "page") {
        sp.set(k, Array.isArray(v) ? (v[0] ?? "") : v);
      }
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/cars?${qs}` : "/cars";
  }

  function getPageNumbers(): (number | "…")[] {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const nums: (number | "…")[] = [1];
    if (page > 3) nums.push("…");
    const lo = Math.max(2, page - 1);
    const hi = Math.min(pages - 1, page + 1);
    for (let i = lo; i <= hi; i++) nums.push(i);
    if (page < pages - 2) nums.push("…");
    nums.push(pages);
    return nums;
  }

  const btnBase =
    "flex h-9 items-center justify-center rounded-md border border-border bg-background text-sm hover:bg-background-subtle";

  return (
    <nav className="flex items-center justify-center gap-1 pt-4" aria-label="Pagination">
      <Link
        href={buildUrl(page - 1)}
        aria-disabled={page === 1}
        className={`${btnBase} w-9 ${page === 1 ? "pointer-events-none opacity-40" : ""}`}
      >
        ←
      </Link>

      {getPageNumbers().map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-foreground-muted"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            className={`${btnBase} w-9 ${p === page ? "border-primary-600 bg-primary-600 font-semibold text-white hover:bg-primary-700" : ""}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildUrl(page + 1)}
        aria-disabled={page === pages}
        className={`${btnBase} w-9 ${page === pages ? "pointer-events-none opacity-40" : ""}`}
      >
        →
      </Link>
    </nav>
  );
}
