import { db } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"
import { SellerStatus } from "@/generated/prisma/client"

const PAGE_SIZE = 30

export async function GET(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get("status") as SellerStatus | null
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1)

  const where = {
    ...(status && Object.values(SellerStatus).includes(status) && { status }),
  }

  const [sellers, total] = await Promise.all([
    db.seller.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: { select: { cars: true } },
      },
    }),
    db.seller.count({ where }),
  ])

  return Response.json({ sellers, total, page, pages: Math.ceil(total / PAGE_SIZE) })
}
