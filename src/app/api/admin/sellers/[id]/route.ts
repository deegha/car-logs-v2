import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { SellerStatus, CarStatus } from "@/generated/prisma/client";

type Params = Promise<{ id: string }>;

const SELLER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  phones: { select: { id: true, number: true, isPrimary: true, isWhatsApp: true } },
} as const;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sellerId = Number(id);
  if (isNaN(sellerId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await db.seller.findUnique({ where: { id: sellerId } });
  if (!existing) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    status,
    firstName,
    lastName,
    email,
    phones,
  } = body as {
    status?: SellerStatus;
    firstName?: string;
    lastName?: string;
    email?: string;
    phones?: { id?: number; number: string; isPrimary: boolean; isWhatsApp: boolean }[];
  };

  // ── Status change ──────────────────────────────────────────────────
  if (status !== undefined) {
    if (!Object.values(SellerStatus).includes(status)) {
      return Response.json({ error: "status must be ACTIVE or SUSPENDED" }, { status: 400 });
    }

    const seller = await db.$transaction(async (tx) => {
      await tx.seller.update({ where: { id: sellerId }, data: { status } });

      if (status === SellerStatus.SUSPENDED) {
        // Hide active and pending listings from buyers
        await tx.car.updateMany({
          where: {
            sellerId,
            status: { in: [CarStatus.AVAILABLE, CarStatus.PENDING] },
          },
          data: { status: CarStatus.REJECTED },
        });
      } else if (status === SellerStatus.ACTIVE) {
        // Move rejected listings back to pending review
        await tx.car.updateMany({
          where: { sellerId, status: CarStatus.REJECTED },
          data: { status: CarStatus.PENDING },
        });
      }

      return tx.seller.findUnique({ where: { id: sellerId }, select: SELLER_SELECT });
    });

    return Response.json({ seller });
  }

  // ── User detail update ─────────────────────────────────────────────
  const seller = await db.$transaction(async (tx) => {
    const updates: { firstName?: string; lastName?: string; email?: string } = {};
    if (firstName !== undefined) updates.firstName = firstName.trim();
    if (lastName !== undefined) updates.lastName = lastName.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();

    if (Object.keys(updates).length > 0) {
      await tx.seller.update({ where: { id: sellerId }, data: updates });
    }

    if (Array.isArray(phones)) {
      await tx.sellerPhone.deleteMany({ where: { sellerId } });
      if (phones.length > 0) {
        await tx.sellerPhone.createMany({
          data: phones
            .filter((p) => p.number.trim())
            .map((p) => ({
              sellerId,
              number: p.number.trim(),
              isPrimary: p.isPrimary,
              isWhatsApp: p.isWhatsApp,
            })),
        });
      }
    }

    return tx.seller.findUnique({ where: { id: sellerId }, select: SELLER_SELECT });
  });

  return Response.json({ seller });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sellerId = Number(id);
  if (isNaN(sellerId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await db.seller.findUnique({ where: { id: sellerId } });
  if (!existing) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Cascade delete configured in schema — cars, phones, push subscriptions deleted automatically
  await db.seller.delete({ where: { id: sellerId } });

  return Response.json({ ok: true });
}
