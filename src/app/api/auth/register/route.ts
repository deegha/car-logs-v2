import { db } from "@/lib/db"
import { hashPassword, createSellerSession } from "@/lib/auth"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { firstName, lastName, email, phone, password } = body as Record<string, string>

  if (!firstName || !lastName || !email || !phone || !password) {
    return Response.json({ error: "All fields are required" }, { status: 400 })
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const existing = await db.seller.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 })
  }

  const seller = await db.seller.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      passwordHash: await hashPassword(password),
    },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true },
  })

  await createSellerSession(seller.id)

  return Response.json({ seller }, { status: 201 })
}
