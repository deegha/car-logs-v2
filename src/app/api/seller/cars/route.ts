import { db } from "@/lib/db"
import { getSellerSession } from "@/lib/auth"

export async function GET() {
  const session = await getSellerSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cars = await db.car.findMany({
    where: { sellerId: session.sellerId },
    orderBy: { createdAt: "desc" },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  })

  return Response.json({ cars })
}
