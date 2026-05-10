import { Suspense } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CarGrid } from "@/components/cars/CarGrid"
import { FilterPanel } from "@/components/filters/FilterPanel"
import { FilterChips } from "@/components/filters/FilterChips"
import { SearchBar } from "@/components/filters/SearchBar"
import { db } from "@/lib/db"
import { CarStatus } from "@/generated/prisma/client"
import type { Car } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Cars",
  description: "Search and filter quality pre-owned vehicles.",
}

const PAGE_SIZE = 20

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const search = String(params.search ?? "")
  const make = String(params.make ?? "")
  const model = String(params.model ?? "")
  const minYear = Number(params.minYear) || undefined
  const maxYear = Number(params.maxYear) || undefined
  const minPrice = Number(params.minPrice) || undefined
  const maxPrice = Number(params.maxPrice) || undefined
  const page = Math.max(1, Number(params.page) || 1)

  const where = {
    status: CarStatus.AVAILABLE,
    ...(make && { make }),
    ...(model && { model }),
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
    ...(search && {
      OR: [
        { title: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
      ],
    }),
  }

  const [cars, total] = await Promise.all([
    db.car.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    db.car.count({ where }),
  ])

  const pages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            <aside className="w-full rounded-lg border border-border bg-background p-5 lg:w-64 lg:shrink-0">
              <Suspense>
                <FilterPanel />
              </Suspense>
            </aside>

            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Suspense>
                  <SearchBar />
                </Suspense>
                <Suspense>
                  <FilterChips />
                </Suspense>
              </div>

              <p className="text-sm text-foreground-muted">
                {total.toLocaleString()} {total === 1 ? "listing" : "listings"} found
              </p>

              <CarGrid cars={cars as unknown as Car[]} />

              {pages > 1 && (
                <Pagination page={page} pages={pages} searchParams={params} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Pagination({
  page,
  pages,
  searchParams,
}: {
  page: number
  pages: number
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  function buildUrl(p: number) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== "" && k !== "page") {
        sp.set(k, Array.isArray(v) ? v[0] ?? "" : v)
      }
    }
    sp.set("page", String(p))
    return `/cars?${sp.toString()}`
  }

  return (
    <nav className="flex items-center justify-center gap-4 pt-4" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1)}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-background-subtle"
        >
          ← Previous
        </Link>
      )}
      <span className="text-sm text-foreground-muted">
        Page {page} of {pages}
      </span>
      {page < pages && (
        <Link
          href={buildUrl(page + 1)}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-background-subtle"
        >
          Next →
        </Link>
      )}
    </nav>
  )
}
