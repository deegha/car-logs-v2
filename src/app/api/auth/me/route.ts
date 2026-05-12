import { db } from "@/lib/db";
import { getSellerSession } from "@/lib/auth";

export async function GET() {
  const session = await getSellerSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await db.seller.findUnique({
    where: { id: session.sellerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      phones: {
        select: { id: true, number: true, isPrimary: true, isWhatsApp: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!seller) {
    return Response.json({ error: "Seller not found" }, { status: 404 });
  }

  return Response.json({ seller });
}
