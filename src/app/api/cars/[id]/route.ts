import { db } from "@/lib/db"
import { CarStatus } from "@/generated/prisma/client"

type Params = Promise<{ id: string }>

export async function GET(_req: Request, { params }: { params: Params }) {
  const { id } = await params
  const carId = Number(id)

  if (isNaN(carId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 })
  }

  const car = await db.car.findFirst({
    where: { id: carId, status: CarStatus.AVAILABLE },
    include: {
      images: { orderBy: { order: "asc" } },
      seller: {
        select: { firstName: true, lastName: true, phone: true },
      },
    },
  })

  if (!car) {
    return Response.json({ error: "Car not found" }, { status: 404 })
  }

  return Response.json({ car })
}
