import Link from "next/link";
import { db } from "@/lib/db";
import { CarStatus } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const [pendingCount, availableCount, soldCount, reservedCount, rejectedCount, recentPending] =
    await Promise.all([
      db.car.count({ where: { status: CarStatus.PENDING } }),
      db.car.count({ where: { status: CarStatus.AVAILABLE } }),
      db.car.count({ where: { status: CarStatus.SOLD } }),
      db.car.count({ where: { status: CarStatus.RESERVED } }),
      db.car.count({ where: { status: CarStatus.REJECTED } }),
      db.car.findMany({
        where: { status: CarStatus.PENDING },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          make: true,
          model: true,
          year: true,
          price: true,
          createdAt: true,
        },
      }),
    ]);

  const statCards = [
    { label: "Pending", count: pendingCount, color: "text-yellow-600" },
    { label: "Available", count: availableCount, color: "text-green-600" },
    { label: "Sold", count: soldCount, color: "text-foreground-muted" },
    { label: "Reserved", count: reservedCount, color: "text-primary-600" },
    { label: "Rejected", count: rejectedCount, color: "text-red-600" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Overview</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map(({ label, count, color }) => (
          <div key={label} className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-foreground-muted">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{count.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Pending Listings</h2>
          <Link
            href="/admin/dashboard/listings?status=PENDING"
            className="text-sm text-primary-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentPending.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-foreground-muted">
            No pending listings.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-subtle text-left text-xs font-semibold tracking-wider text-foreground-muted uppercase">
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPending.map((car) => (
                  <tr key={car.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{car.title}</p>
                      <p className="text-xs text-foreground-muted">
                        {car.year} · {car.make} {car.model}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary-600">
                      {formatPrice(Number(car.price))}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {new Date(car.createdAt).toLocaleDateString("en-AU")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/admin/dashboard/listings?status=PENDING"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
