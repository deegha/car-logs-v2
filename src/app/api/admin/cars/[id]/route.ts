import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { CarStatus, CarCondition, FuelType, Transmission } from "@/generated/prisma/client";
import { generateCarSlug } from "@/lib/utils";

type Params = Promise<{ id: string }>;

// ── PATCH /api/admin/cars/[id] — approve / reject / feature / edit ─

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const carId = Number(id);
  if (isNaN(carId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await db.car.findUnique({ where: { id: carId } });
  if (!existing) {
    return Response.json({ error: "Car not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    status,
    featured,
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
    province,
    district,
    town,
    condition,
    isNegotiable,
    emissionTestUrl,
    images,
  } = body as {
    status?: CarStatus;
    featured?: boolean;
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
    province?: string | null;
    district?: string | null;
    town?: string | null;
    condition?: CarCondition;
    isNegotiable?: boolean;
    emissionTestUrl?: string | null;
    images?: { url: string; alt?: string; isPrimary?: boolean; order?: number }[];
  };

  if (status !== undefined && !Object.values(CarStatus).includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const hasContentChange = [
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
    province,
    district,
    town,
    condition,
    isNegotiable,
    emissionTestUrl,
    images,
  ].some((v) => v !== undefined);

  const slugMake = make ?? existing.make;
  const slugModel = model ?? existing.model;
  const slugYear = year ?? existing.year;
  const newSlug = generateCarSlug(slugMake, slugModel, slugYear, carId);

  const car = await db.car.update({
    where: { id: carId },
    data: {
      ...(hasContentChange && { slug: newSlug }),
      status: status !== undefined ? status : hasContentChange ? CarStatus.PENDING : undefined,
      ...(featured !== undefined && { featured }),
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
      ...(province !== undefined && { province }),
      ...(district !== undefined && { district }),
      ...(town !== undefined && { town }),
      ...(condition !== undefined && { condition }),
      ...(isNegotiable !== undefined && { isNegotiable }),
      ...(emissionTestUrl !== undefined && { emissionTestUrl }),
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
    include: { images: true, seller: { select: { id: true, firstName: true, lastName: true } } },
  });

  return Response.json({ car });
}

// ── DELETE /api/admin/cars/[id] — hard delete ──────────────────────

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const carId = Number(id);
  if (isNaN(carId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await db.car.findUnique({ where: { id: carId } });
  if (!existing) {
    return Response.json({ error: "Car not found" }, { status: 404 });
  }

  await db.car.delete({ where: { id: carId } });

  return Response.json({ success: true });
}
