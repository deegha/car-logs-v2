import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/cars/StatusBadge";
import { AdminUserActions } from "@/components/admin/AdminUserActions";
import { formatPrice, formatMileage } from "@/lib/utils";
import type { Metadata } from "next";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const seller = await db.seller.findUnique({
    where: { id: Number(id) },
    select: { firstName: true, lastName: true },
  });
  return { title: seller ? `${seller.firstName} ${seller.lastName}` : "User" };
}

export default async function AdminUserDetailPage({ params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) notFound();

  const { id } = await params;
  const sellerId = Number(id);
  if (isNaN(sellerId)) notFound();

  const seller = await db.seller.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      phones: {
        select: {
          id: true,
          number: true,
          isPrimary: true,
          isWhatsApp: true,
          sellerId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      cars: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          make: true,
          model: true,
          year: true,
          price: true,
          mileage: true,
          status: true,
          slug: true,
          createdAt: true,
        },
      },
      _count: { select: { cars: true } },
    },
  });

  if (!seller) notFound();

  const primaryPhone = seller.phones.find((p) => p.isPrimary) ?? seller.phones[0] ?? null;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-foreground-muted">
        <Link href="/admin/dashboard/sellers" className="hover:text-foreground">
          Users
        </Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">
          {seller.firstName} {seller.lastName}
        </span>
      </nav>

      {/* User info card */}
      <div className="mb-6 rounded-xl border border-border bg-background p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {seller.firstName} {seller.lastName}
              </h1>
              <Badge variant={seller.status === "ACTIVE" ? "success" : "danger"}>
                {seller.status === "ACTIVE" ? "Active" : "Suspended"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <span className="w-20 shrink-0 text-foreground-muted">Email</span>
                <span className="font-medium text-foreground">{seller.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 shrink-0 text-foreground-muted">Joined</span>
                <span className="text-foreground">
                  {new Date(seller.createdAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {primaryPhone && (
                <div className="flex gap-2">
                  <span className="w-20 shrink-0 text-foreground-muted">Phone</span>
                  <span className="text-foreground">
                    +94 {primaryPhone.number}
                    {primaryPhone.isWhatsApp && (
                      <span className="ml-1.5 text-xs text-green-600">WhatsApp</span>
                    )}
                  </span>
                </div>
              )}
              {seller.phones.length > 1 && (
                <div className="flex gap-2">
                  <span className="w-20 shrink-0 text-foreground-muted" />
                  <span className="text-xs text-foreground-muted">
                    +{seller.phones.length - 1} more number
                    {seller.phones.length > 2 ? "s" : ""}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="w-20 shrink-0 text-foreground-muted">Listings</span>
                <span className="text-foreground">{seller._count.cars}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <AdminUserActions seller={seller} />
        </div>
      </div>

      {/* Listings */}
      <h2 className="mb-3 text-lg font-semibold text-foreground">
        Listings ({seller.cars.length})
      </h2>

      {seller.cars.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-foreground-muted">
          This user has no listings.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-subtle text-left text-xs font-semibold tracking-wider text-foreground-muted uppercase">
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Mileage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {seller.cars.map((car) => (
                <tr
                  key={car.id}
                  className="border-b border-border last:border-0 hover:bg-background-subtle"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{car.title}</p>
                    <p className="text-xs text-foreground-muted">
                      {car.year} · {car.make} {car.model}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary-600">
                    {formatPrice(Number(car.price))}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{formatMileage(car.mileage)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={car.status} />
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {new Date(car.createdAt).toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/dashboard/listings/${car.id}`}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Review
                      </Link>
                      <Link
                        href={`/cars/${car.slug ?? car.id}`}
                        target="_blank"
                        className="text-sm text-foreground-muted hover:text-foreground"
                      >
                        View ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
