import { db } from "@/lib/db";
import { getSellerSession } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getSellerSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const phoneId = Number(id);
  if (isNaN(phoneId)) return Response.json({ error: "Invalid id" }, { status: 400 });

  const existing = await db.sellerPhone.findFirst({
    where: { id: phoneId, sellerId: session.sellerId },
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { isPrimary, isWhatsApp } = body as { isPrimary?: boolean; isWhatsApp?: boolean };

  // Setting a new primary: clear existing primary first
  if (isPrimary === true) {
    await db.sellerPhone.updateMany({
      where: { sellerId: session.sellerId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const phone = await db.sellerPhone.update({
    where: { id: phoneId },
    data: {
      ...(isPrimary !== undefined && { isPrimary }),
      ...(isWhatsApp !== undefined && { isWhatsApp }),
    },
  });

  return Response.json({ phone });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const session = await getSellerSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const phoneId = Number(id);
  if (isNaN(phoneId)) return Response.json({ error: "Invalid id" }, { status: 400 });

  const existing = await db.sellerPhone.findFirst({
    where: { id: phoneId, sellerId: session.sellerId },
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const count = await db.sellerPhone.count({ where: { sellerId: session.sellerId } });
  if (count <= 1) {
    return Response.json({ error: "You must keep at least one phone number." }, { status: 422 });
  }

  let promotedId: number | null = null;
  if (existing.isPrimary) {
    const next = await db.sellerPhone.findFirst({
      where: { sellerId: session.sellerId, id: { not: phoneId } },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await db.sellerPhone.update({ where: { id: next.id }, data: { isPrimary: true } });
      promotedId = next.id;
    }
  }

  await db.sellerPhone.delete({ where: { id: phoneId } });

  return Response.json({ deletedId: phoneId, promotedId });
}
