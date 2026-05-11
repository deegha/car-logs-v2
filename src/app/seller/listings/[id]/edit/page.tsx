import { notFound } from "next/navigation";
import { EditCarForm } from "@/components/seller/EditCarForm";
import { db } from "@/lib/db";
import { getSellerSession } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Listing" };

type Props = { params: Promise<{ id: string }> };

export default async function SellerEditCarPage({ params }: Props) {
  const { id } = await params;
  const carId = Number(id);
  if (isNaN(carId)) notFound();

  const session = await getSellerSession();
  if (!session) notFound();

  const car = await db.car.findFirst({
    where: { id: carId, sellerId: session.sellerId },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!car) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Listing</h1>
        <p className="mt-1 text-sm text-foreground-muted">{car.title}</p>
      </div>
      <EditCarForm
        car={{ ...car, price: Number(car.price) }}
        apiEndpoint={`/api/seller/cars/${carId}`}
        cancelHref="/seller/dashboard"
      />
    </div>
  );
}
