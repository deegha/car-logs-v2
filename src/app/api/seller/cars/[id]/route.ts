import { db } from "@/lib/db";
import { getSellerSession } from "@/lib/auth";
import { CarStatus, FuelType, Transmission } from "@/generated/prisma/client";
import { generateCarSlug } from "@/lib/utils";

type Params = Promise<{ id: string }>;

// ── PATCH /api/seller/cars/[id] — edit own PENDING listing ────────

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getSellerSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const carId = Number(id);
  if (isNaN(carId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const car = await db.car.findFirst({ where: { id: carId, sellerId: session.sellerId } });
  if (!car) {
    return Response.json({ error: "Car not found" }, { status: 404 });
  }
  if (car.status !== CarStatus.PENDING) {
    return Response.json({ error: "Only PENDING listings can be edited" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    title,
    make,
    model,
    year,
    price,
    mileage,
    color,
    fuelType,
    transmission,
    bodyType,
    engineSize,
    description,
    images,
  } = body as {
    title?: string;
    make?: string;
    model?: string;
    year?: number;
    price?: number;
    mileage?: number;
    color?: string | null;
    fuelType?: FuelType;
    transmission?: Transmission;
    bodyType?: string | null;
    engineSize?: string | null;
    description?: string | null;
    images?: { url: string; alt?: string; isPrimary?: boolean; order?: number }[];
  };

  const slugMake = make ?? car.make;
  const slugModel = model ?? car.model;
  const slugYear = year ?? car.year;
  const newSlug = generateCarSlug(slugMake, slugModel, slugYear, carId);

  const updated = await db.car.update({
    where: { id: carId },
    data: {
      slug: newSlug,
      ...(title !== undefined && { title }),
      ...(make !== undefined && { make }),
      ...(model !== undefined && { model }),
      ...(year !== undefined && { year }),
      ...(price !== undefined && { price }),
      ...(mileage !== undefined && { mileage }),
      ...(color !== undefined && { color }),
      ...(fuelType !== undefined && { fuelType }),
      ...(transmission !== undefined && { transmission }),
      ...(bodyType !== undefined && { bodyType }),
      ...(engineSize !== undefined && { engineSize }),
      ...(description !== undefined && { description }),
      ...(images !== undefined && {
        images: {
          deleteMany: {},
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt ?? null,
            isPrimary: img.isPrimary ?? i === 0,
            order: img.order ?? i,
          })),
        },
      }),
    },
    include: { images: true },
  });

  return Response.json({ car: updated });
}

// ── DELETE /api/seller/cars/[id] — delete own listing ─────────────

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const session = await getSellerSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const carId = Number(id);
  if (isNaN(carId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const car = await db.car.findFirst({ where: { id: carId, sellerId: session.sellerId } });
  if (!car) {
    return Response.json({ error: "Car not found" }, { status: 404 });
  }

  await db.car.delete({ where: { id: carId } });

  return Response.json({ success: true });
}
