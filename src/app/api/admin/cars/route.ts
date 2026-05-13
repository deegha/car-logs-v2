import { db } from "@/lib/db";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { CarStatus, CarCondition, FuelType, Transmission } from "@/generated/prisma/client";
import { generateCarSlug } from "@/lib/utils";

const PAGE_SIZE = 30;

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as CarStatus | null;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

  const where = {
    ...(status && Object.values(CarStatus).includes(status) && { status }),
  };

  const [cars, total] = await Promise.all([
    db.car.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    db.car.count({ where }),
  ]);

  return Response.json({ cars, total, page, pages: Math.ceil(total / PAGE_SIZE) });
}

// ── POST /api/admin/cars — admin creates a listing on behalf of a seller ──

export async function POST(request: Request) {
  const session = await getAdminSession();
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
    sellerId,
    manualContact,
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
    status = CarStatus.AVAILABLE,
    images,
  } = body as {
    sellerId?: number;
    manualContact?: { name: string; phone: string; isWhatsApp: boolean };
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
    condition?: CarCondition;
    isNegotiable?: boolean;
    emissionTestUrl?: string;
    status?: CarStatus;
    images?: { url: string; isPrimary?: boolean; order?: number }[];
  };

  if (!sellerId && !manualContact) {
    return Response.json(
      { error: "Either sellerId or manualContact is required" },
      { status: 400 }
    );
  }

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

  if (manualContact) {
    if (!manualContact.name?.trim()) {
      return Response.json({ error: "Contact name is required" }, { status: 400 });
    }
    if (!/^\d{9}$/.test(manualContact.phone ?? "")) {
      return Response.json({ error: "Phone must be 9 digits (after +94)" }, { status: 400 });
    }
  }

  // Resolve the seller — either existing or auto-created from manual contact
  let resolvedSellerId: number;

  if (sellerId) {
    const seller = await db.seller.findUnique({ where: { id: sellerId } });
    if (!seller) return Response.json({ error: "Seller not found" }, { status: 404 });
    resolvedSellerId = seller.id;
  } else {
    // Auto-create a locked account for manual contact listings
    const contact = manualContact!;
    const nameParts = contact.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "-";
    const uniqueEmail = `noaccount+${Date.now()}+${Math.random().toString(36).slice(2, 8)}@carlogs.internal`;
    const ghostSeller = await db.seller.create({
      data: {
        firstName,
        lastName,
        email: uniqueEmail,
        passwordHash: await hashPassword(crypto.randomUUID()),
        phones: {
          create: {
            number: contact.phone,
            isPrimary: true,
            isWhatsApp: contact.isWhatsApp ?? false,
          },
        },
      },
    });
    resolvedSellerId = ghostSeller.id;
  }

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
      condition: condition ?? CarCondition.USED,
      isNegotiable: isNegotiable ?? false,
      emissionTestUrl: emissionTestUrl ?? null,
      status,
      sellerId: resolvedSellerId,
      ...(images?.length && {
        images: {
          create: images.map((img, i) => ({
            url: img.url,
            alt: null,
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
