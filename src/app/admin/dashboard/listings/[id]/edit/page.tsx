import { notFound } from "next/navigation";
import { EditCarForm } from "@/components/seller/EditCarForm";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Listing — Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditCarPage({ params }: Props) {
  const { id } = await params;
  const carId = Number(id);
  if (isNaN(carId)) notFound();

  const session = await getAdminSession();
  if (!session) notFound();

  const car = await db.car.findUnique({
    where: { id: carId },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!car) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Listing</h1>
        <p className="mt-1 text-sm text-foreground-muted">{car.title}</p>
      </div>
      <EditCarForm
        car={{ ...car, price: Number(car.price) }}
        apiEndpoint={`/api/admin/cars/${carId}`}
        cancelHref="/admin/dashboard/listings"
        isAdmin
      />
    </div>
  );
}
