import { db } from "@/lib/db"
import { verifyPassword, createAdminSession } from "@/lib/auth"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { email, password } = body as Record<string, string>

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 })
  }

  const admin = await db.admin.findUnique({ where: { email } })
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 })
  }

  await createAdminSession(admin.id)

  return Response.json({ admin: { id: admin.id, email: admin.email } })
}
