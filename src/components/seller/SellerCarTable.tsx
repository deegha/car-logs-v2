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

  async function handleDelete(id: number) {
    const res = await fetch(`/api/seller/cars/${id}`, { method: "DELETE" });
    if (res.ok) setCars((prev) => prev.filter((c) => c.id !== id));
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
    <div className="overflow-x-auto rounded-lg border border-border">
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
                    href={`/cars/${car.id}`}
                    className="font-medium text-foreground hover:text-primary-600"
                  >
                    {car.title}
                  </Link>
                  <p className="text-xs text-foreground-muted">
                    {car.year} · {car.make} {car.model}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-primary-600">{formatPrice(car.price)}</td>
              <td className="px-4 py-3 text-foreground-muted">{formatMileage(car.mileage)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={car.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {car.status === "PENDING" && (
                    <Link
                      href={`/sell?edit=${car.id}`}
                      className="inline-flex h-8 items-center rounded-sm px-3 text-sm font-medium text-foreground hover:bg-background-subtle"
                    >
                      Edit
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={() => handleDelete(car.id)}
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
