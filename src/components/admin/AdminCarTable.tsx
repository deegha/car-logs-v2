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

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
    if (res.ok) setCars((prev) => prev.filter((c) => c.id !== id));
  }

  if (cars.length === 0) {
    return <p className="py-8 text-center text-foreground-muted">No listings found.</p>;
  }

  return (
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
                  href={`/cars/${car.id}`}
                  className="font-medium text-foreground hover:text-primary-600"
                >
                  {car.title}
                </Link>
                <p className="text-xs text-foreground-muted">
                  {car.year} · {car.make} {car.model}
                </p>
              </td>
              <td className="px-4 py-3 font-semibold text-primary-600">{formatPrice(car.price)}</td>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(car.id)}
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
  );
}
