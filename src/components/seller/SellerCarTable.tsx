"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/cars/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatMileage } from "@/lib/utils";
import type { Car } from "@/types";

interface SellerCarTableProps {
  initialCars: Car[];
}

export function SellerCarTable({ initialCars }: SellerCarTableProps) {
  const [cars, setCars] = useState(initialCars);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/seller/cars/${pendingDelete.id}`, { method: "DELETE" });
    if (res.ok) setCars((prev) => prev.filter((c) => c.id !== pendingDelete.id));
    setDeleting(false);
    setPendingDelete(null);
  }

  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center text-foreground-muted">
        <p>You haven&apos;t listed any cars yet.</p>
        <Link
          href="/sell"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700"
        >
          List your first car
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile card list ───────────────────────────────────────── */}
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border md:hidden">
        {cars.map((car) => (
          <div key={car.id} className="flex flex-col gap-3 p-4">
            {/* Title row + status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/cars/${car.slug ?? car.id}`}
                  className="font-semibold text-foreground hover:text-primary-600"
                >
                  {car.title}
                </Link>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  {car.year} · {car.make} {car.model}
                </p>
              </div>
              <StatusBadge status={car.status} />
            </div>

            {/* Price + mileage */}
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold text-primary-600">{formatPrice(car.price)}</span>
              <span className="text-foreground-muted">{formatMileage(car.mileage)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/seller/listings/${car.id}/edit`}
                className="flex-1 rounded-md border border-border bg-background py-2 text-center text-sm font-medium text-foreground hover:bg-background-subtle"
              >
                Edit
              </Link>
              <button
                onClick={() => setPendingDelete({ id: car.id, title: car.title })}
                className="flex-1 rounded-md border border-red-200 bg-red-50 py-2 text-center text-sm font-medium text-danger hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table ───────────────────────────────────────────── */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-subtle text-left text-xs font-semibold tracking-wider text-foreground-muted uppercase">
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Mileage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr
                key={car.id}
                className="border-b border-border last:border-0 hover:bg-background-subtle"
              >
                <td className="px-4 py-3">
                  <div>
                    <Link
                      href={`/cars/${car.slug ?? car.id}`}
                      className="font-medium text-foreground hover:text-primary-600"
                    >
                      {car.title}
                    </Link>
                    <p className="text-xs text-foreground-muted">
                      {car.year} · {car.make} {car.model}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-primary-600">
                  {formatPrice(car.price)}
                </td>
                <td className="px-4 py-3 text-foreground-muted">{formatMileage(car.mileage)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={car.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/seller/listings/${car.id}/edit`}
                      className="inline-flex h-8 items-center rounded-sm px-3 text-sm font-medium text-foreground hover:bg-background-subtle"
                    >
                      Edit
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      onClick={() => setPendingDelete({ id: car.id, title: car.title })}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg">
            <h2 className="mb-1 text-lg font-semibold text-foreground">Delete listing?</h2>
            <p className="mb-1 text-sm font-medium text-foreground">{pendingDelete.title}</p>
            <p className="mb-6 text-sm text-danger">
              This cannot be undone. The listing will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-danger text-white hover:bg-red-700"
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
