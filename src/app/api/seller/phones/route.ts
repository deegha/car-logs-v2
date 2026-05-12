import { db } from "@/lib/db";
import { getSellerSession } from "@/lib/auth";

export async function GET() {
  const session = await getSellerSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const phones = await db.sellerPhone.findMany({
    where: { sellerId: session.sellerId },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ phones });
}

export async function POST(request: Request) {
  const session = await getSellerSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { number, isPrimary, isWhatsApp } = body as {
    number?: string;
    isPrimary?: boolean;
    isWhatsApp?: boolean;
  };
  if (!number || !/^\d{9}$/.test(number)) {
    return Response.json(
      { error: "number must be 9 digits (local part after +94)" },
      { status: 400 }
    );
  }

  const count = await db.sellerPhone.count({ where: { sellerId: session.sellerId } });
  if (count >= 5) {
    return Response.json({ error: "Maximum 5 phone numbers allowed" }, { status: 422 });
  }

  const shouldBePrimary = isPrimary ?? count === 0;
  if (shouldBePrimary) {
    await db.sellerPhone.updateMany({
      where: { sellerId: session.sellerId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const phone = await db.sellerPhone.create({
    data: {
      number,
      isPrimary: shouldBePrimary,
      isWhatsApp: isWhatsApp ?? false,
      sellerId: session.sellerId,
    },
  });

  return Response.json({ phone }, { status: 201 });
}
