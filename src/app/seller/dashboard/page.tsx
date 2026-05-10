import Link from "next/link";
import { SellerCarTable } from "@/components/seller/SellerCarTable";
import { db } from "@/lib/db";
import { getSellerSession } from "@/lib/auth";
import type { Car } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Listings",
};

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [session, params] = await Promise.all([getSellerSession(), searchParams]);

  const [seller, cars] = await Promise.all([
    db.seller.findUnique({
      where: { id: session!.sellerId },
      select: { firstName: true },
    }),
    db.car.findMany({
      where: { sellerId: session!.sellerId },
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
  ]);

  const submitted = params.submitted === "1";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      {submitted && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Your listing has been submitted and is pending review. We&apos;ll notify you once
          it&apos;s approved.
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {seller?.firstName ?? "Seller"}
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">Manage your car listings below</p>
        </div>
        <Link
          href="/sell"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          + Add Listing
        </Link>
      </div>

      <SellerCarTable initialCars={cars.map((c) => ({ ...c, price: Number(c.price) })) as Car[]} />
    </div>
  );
}
