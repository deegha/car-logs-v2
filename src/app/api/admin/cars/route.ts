import { db } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"
import { CarStatus } from "@/generated/prisma/client"

const PAGE_SIZE = 30

export async function GET(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get("status") as CarStatus | null
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1)

  const where = {
    ...(status && Object.values(CarStatus).includes(status) && { status }),
  }

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
  ])

  return Response.json({ cars, total, page, pages: Math.ceil(total / PAGE_SIZE) })
}
