import { db } from "@/lib/db";
import { getSellerSession } from "@/lib/auth";
import { CarStatus, FuelType, Transmission } from "@/generated/prisma/client";
import { generateCarSlug } from "@/lib/utils";

const PAGE_SIZE = 20;

// ── GET /api/cars — public listing with filters ────────────────────

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const make = url.searchParams.get("make") ?? "";
  const model = url.searchParams.get("model") ?? "";
  const minYear = Number(url.searchParams.get("minYear")) || undefined;
  const maxYear = Number(url.searchParams.get("maxYear")) || undefined;
  const minPrice = Number(url.searchParams.get("minPrice")) || undefined;
  const maxPrice = Number(url.searchParams.get("maxPrice")) || undefined;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

  const where = {
    status: CarStatus.AVAILABLE,
    ...(make && { make }),
    ...(model && { model }),
    ...((minYear || maxYear) && {
      year: {
        ...(minYear && { gte: minYear }),
        ...(maxYear && { lte: maxYear }),
      },
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      },
    }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
      ],
    }),
  };

  const [cars, total] = await Promise.all([
    db.car.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    db.car.count({ where }),
  ]);

  return Response.json({ cars, total, page, pages: Math.ceil(total / PAGE_SIZE) });
}

// ── POST /api/cars — seller submits a new listing ─────────────────

export async function POST(request: Request) {
  const session = await getSellerSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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
    province,
    district,
    town,
    images,
  } = body as {
    title?: string;
    make?: string;
    model?: string;
    year?: number;
    price?: number;
    mileage?: number;
    color?: string;
    fuelType?: FuelType;
    transmission?: Transmission;
    bodyType?: string;
    engineSize?: string;
    description?: string;
    province?: string;
    district?: string;
    town?: string;
    images?: { url: string; alt?: string; isPrimary?: boolean; order?: number }[];
  };

  if (
    !title ||
    !make ||
    !model ||
    !year ||
    price === undefined ||
    mileage === undefined ||
    !fuelType ||
    !transmission
  ) {
    return Response.json(
      { error: "title, make, model, year, price, mileage, fuelType and transmission are required" },
      { status: 400 }
    );
  }

  // create first to get the id, then set the slug
  const car = await db.car.create({
    data: {
      title,
      make,
      model,
      year,
      price,
      mileage,
      color: color ?? null,
      fuelType,
      transmission,
      bodyType: bodyType ?? null,
      engineSize: engineSize ?? null,
      description: description ?? null,
      province: province ?? null,
      district: district ?? null,
      town: town ?? null,
      sellerId: session.sellerId,
      ...(images?.length && {
        images: {
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

  await db.car.update({
    where: { id: car.id },
    data: { slug: generateCarSlug(make, model, year, car.id) },
  });

  return Response.json({ car }, { status: 201 });
}
