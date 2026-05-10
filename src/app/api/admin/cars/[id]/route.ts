import { db } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"
import { CarStatus, FuelType, Transmission } from "@/generated/prisma/client"

type Params = Promise<{ id: string }>

// ── PATCH /api/admin/cars/[id] — approve / reject / feature / edit ─

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const carId = Number(id)
  if (isNaN(carId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 })
  }

  const existing = await db.car.findUnique({ where: { id: carId } })
  if (!existing) {
    return Response.json({ error: "Car not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    status,
    featured,
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
  } = body as {
    status?: CarStatus
    featured?: boolean
    title?: string
    make?: string
    model?: string
    year?: number
    price?: number
    mileage?: number
    color?: string | null
    fuelType?: FuelType
    transmission?: Transmission
    bodyType?: string | null
    engineSize?: string | null
    description?: string | null
  }

  if (status !== undefined && !Object.values(CarStatus).includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 })
  }

  const car = await db.car.update({
    where: { id: carId },
    data: {
      ...(status !== undefined && { status }),
      ...(featured !== undefined && { featured }),
      ...(title !== undefined && { title }),
      ...(make !== undefined && { make }),
      ...(model !== undefined && { model }),
      ...(year !== undefined && { year }),
      ...(price !== undefined && { price }),
      ...(mileage !== undefined && { mileage }),
      ...(color !== undefined && { color }),
      ...(fuelType !== undefined && { fuelType }),
      ...(transmission !== undefined && { transmission }),
      ...(bodyType !== undefined && { bodyType }),
      ...(engineSize !== undefined && { engineSize }),
      ...(description !== undefined && { description }),
    },
    include: { images: true, seller: { select: { id: true, firstName: true, lastName: true } } },
  })

  return Response.json({ car })
}

// ── DELETE /api/admin/cars/[id] — hard delete ──────────────────────

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const carId = Number(id)
  if (isNaN(carId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 })
  }

  const existing = await db.car.findUnique({ where: { id: carId } })
  if (!existing) {
    return Response.json({ error: "Car not found" }, { status: 404 })
  }

  await db.car.delete({ where: { id: carId } })

  return Response.json({ success: true })
}
