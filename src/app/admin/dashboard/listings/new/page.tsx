import { db } from "@/lib/db";
import { AdminAddCarForm } from "@/components/admin/AdminAddCarForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Listing" };

export default async function AdminNewListingPage() {
  const sellers = await db.seller.findMany({
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Add Listing</h1>
      <AdminAddCarForm sellers={sellers} />
    </div>
  );
}
