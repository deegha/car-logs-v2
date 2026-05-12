export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarCard } from "@/components/cars/CarCard";
import { db } from "@/lib/db";
import { CarStatus } from "@/generated/prisma/client";
import type { Car } from "@/types";

export default async function HomePage() {
  const [featured, availableCount] = await Promise.all([
    db.car.findMany({
      where: { status: CarStatus.AVAILABLE, featured: true },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    db.car.count({ where: { status: CarStatus.AVAILABLE } }),
  ]);

  let displayCars = featured;
  if (displayCars.length === 0) {
    displayCars = await db.car.findMany({
      where: { status: CarStatus.AVAILABLE },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-background-subtle px-4 py-10 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find Your Perfect <span className="text-primary-600">Used Car</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-foreground-muted sm:mt-4 sm:text-lg">
            Quality pre-owned vehicles from trusted sellers. No hidden fees.
          </p>

          <form
            action="/cars"
            method="GET"
            className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3"
          >
            <input
              name="search"
              type="text"
              placeholder="Search make, model, or title…"
              className="h-14 w-full flex-1 rounded-xl border border-border bg-background px-5 text-base text-foreground shadow-sm placeholder:text-foreground-muted/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            />
            <button
              type="submit"
              className="h-14 rounded-xl bg-primary-600 px-8 text-base font-semibold text-white hover:bg-primary-700 active:bg-primary-800"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border px-4 py-5 text-center sm:px-6 sm:py-6">
          {[
            { value: availableCount.toLocaleString(), label: "Cars Available" },
            { value: "1,800+", label: "Happy Buyers" },
            { value: "98%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="px-2 sm:px-4">
              <p className="text-xl font-bold text-primary-600 sm:text-2xl">{stat.value}</p>
              <p className="mt-0.5 text-xs text-foreground-muted sm:mt-1 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick action cards — mobile only */}
      <div className="grid grid-cols-2 gap-3 bg-background-subtle px-4 pt-5 sm:hidden">
        <Link
          href="/cars"
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 active:bg-background-subtle"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-foreground">Browse Cars</span>
        </Link>
        <Link
          href="/sell"
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 active:bg-background-subtle"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-foreground">Sell Your Car</span>
        </Link>
      </div>

      {/* Listings */}
      <section className="flex-1 bg-background-subtle px-4 py-5 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h2 className="text-lg font-semibold text-foreground sm:text-2xl">
              {featured.length > 0 ? "Featured Listings" : "Latest Listings"}
            </h2>
            <Link href="/cars" className="text-sm font-medium text-primary-600 hover:underline">
              View all →
            </Link>
          </div>

          {displayCars.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {(displayCars as unknown as Car[]).map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-foreground-muted">
              <p>No listings yet. Be the first to list a car!</p>
              <Link href="/sell" className="mt-4 inline-block text-primary-600 hover:underline">
                List your car →
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
