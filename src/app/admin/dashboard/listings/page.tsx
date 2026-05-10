import Link from "next/link"
import { AdminCarTable } from "@/components/admin/AdminCarTable"
import { db } from "@/lib/db"
import { CarStatus } from "@/generated/prisma/client"
import type { Car } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Listings",
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "AVAILABLE", label: "Available" },
  { value: "SOLD", label: "Sold" },
  { value: "RESERVED", label: "Reserved" },
  { value: "REJECTED", label: "Rejected" },
]

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const statusParam = String(params.status ?? "")
  const status = Object.values(CarStatus).includes(statusParam as CarStatus)
    ? (statusParam as CarStatus)
    : null

  const cars = await db.car.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-foreground">Listings</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={
              value
                ? `/admin/dashboard/listings?status=${value}`
                : "/admin/dashboard/listings"
            }
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

      <AdminCarTable initialCars={cars.map((c) => ({ ...c, price: Number(c.price) })) as Car[]} />
    </div>
  )
}
