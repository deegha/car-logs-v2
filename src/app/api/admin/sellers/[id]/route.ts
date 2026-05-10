import { db } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"
import { SellerStatus } from "@/generated/prisma/client"

type Params = Promise<{ id: string }>

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const sellerId = Number(id)
  if (isNaN(sellerId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 })
  }

  const existing = await db.seller.findUnique({ where: { id: sellerId } })
  if (!existing) {
    return Response.json({ error: "Seller not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { status } = body as { status?: SellerStatus }

  if (!status || !Object.values(SellerStatus).includes(status)) {
    return Response.json({ error: "status must be ACTIVE or SUSPENDED" }, { status: 400 })
  }

  const seller = await db.seller.update({
    where: { id: sellerId },
    data: { status },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true },
  })

  return Response.json({ seller })
}
