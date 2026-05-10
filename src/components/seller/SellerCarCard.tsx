"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { StatusBadge } from "@/components/cars/StatusBadge"
import { Button } from "@/components/ui/Button"
import { formatPrice, formatMileage } from "@/lib/utils"
import type { Car } from "@/types"

interface SellerCarCardProps {
  car: Car
  onDelete?: (id: number) => void
}

export function SellerCarCard({ car, onDelete }: SellerCarCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const coverImage = car.images?.find((img) => img.isPrimary) ?? car.images?.[0]

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/seller/cars/${car.id}`, { method: "DELETE" })
      if (res.ok) onDelete?.(car.id)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-md bg-background-subtle">
        {coverImage ? (
          <Image src={coverImage.url} alt={car.title} fill sizes="144px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground-muted">
            <svg className="h-8 w-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/cars/${car.id}`} className="text-sm font-semibold text-foreground hover:text-primary-600">
            {car.title}
          </Link>
          <StatusBadge status={car.status} />
        </div>
        <p className="text-sm font-bold text-primary-600">{formatPrice(car.price)}</p>
        <p className="text-xs text-foreground-muted">
          {car.year} · {car.make} {car.model} · {formatMileage(car.mileage)}
        </p>

        <div className="mt-auto flex gap-2 pt-2">
          {car.status === "PENDING" && (
            <Link
              href={`/sell?edit=${car.id}`}
              className="inline-flex h-8 items-center justify-center rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
            >
              Edit
            </Link>
          )}
          {!confirming ? (
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} className="text-danger">
              Delete
            </Button>
          ) : (
            <>
              <Button variant="danger" size="sm" disabled={deleting} onClick={handleDelete}>
                {deleting ? "Deleting…" : "Confirm delete"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
