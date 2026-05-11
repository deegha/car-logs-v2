"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/cars/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatMileage } from "@/lib/utils";
import type { Car, CarStatus } from "@/types";

interface AdminCarTableProps {
  initialCars: Car[];
}

export function AdminCarTable({ initialCars }: AdminCarTableProps) {
  const [cars, setCars] = useState(initialCars);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function patch(id: number, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/cars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { car } = await res.json();
      setCars((prev) => prev.map((c) => (c.id === id ? car : c)));
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/cars/${pendingDelete.id}`, { method: "DELETE" });
    if (res.ok) setCars((prev) => prev.filter((c) => c.id !== pendingDelete.id));
    setDeleting(false);
    setPendingDelete(null);
  }

  if (cars.length === 0) {
    return <p className="py-8 text-center text-foreground-muted">No listings found.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-subtle text-left text-xs font-semibold tracking-wider text-foreground-muted uppercase">
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Mileage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
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
                  <Link
                    href={`/cars/${car.slug ?? car.id}`}
                    className="font-medium text-foreground hover:text-primary-600"
                  >
                    {car.title}
                  </Link>
                  <p className="text-xs text-foreground-muted">
                    {car.year} · {car.make} {car.model}
                  </p>
                </td>
                <td className="px-4 py-3 font-semibold text-primary-600">
                  {formatPrice(car.price)}
                </td>
                <td className="px-4 py-3 text-foreground-muted">{formatMileage(car.mileage)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={car.status} />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => patch(car.id, { featured: !car.featured })}
                    className={`text-xs font-medium ${car.featured ? "text-accent-600" : "text-foreground-muted"}`}
                  >
                    {car.featured ? "Yes" : "No"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {car.status === "PENDING" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => patch(car.id, { status: "AVAILABLE" as CarStatus })}
                          className="text-success"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => patch(car.id, { status: "REJECTED" as CarStatus })}
                          className="text-danger"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Link
                      href={`/admin/dashboard/listings/${car.id}/edit`}
                      className="inline-flex h-8 items-center rounded-sm px-3 text-sm font-medium text-foreground hover:bg-background-subtle"
                    >
                      Edit
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete({ id: car.id, title: car.title })}
                      className="text-danger"
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
