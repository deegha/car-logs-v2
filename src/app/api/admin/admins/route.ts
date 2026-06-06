import { db } from "@/lib/db";
import { getAdminWithRole, hashPassword } from "@/lib/auth";
import { AdminRole } from "@/generated/prisma/client";

export async function GET() {
  const caller = await getAdminWithRole();
  if (!caller) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (caller.role !== AdminRole.SUPER_ADMIN)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const admins = await db.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  return Response.json({ admins });
}

export async function POST(request: Request) {
  const caller = await getAdminWithRole();
  if (!caller) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (caller.role !== AdminRole.SUPER_ADMIN)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password, role } = body as Record<string, string>;

  if (!email?.trim() || !password || !role) {
    return Response.json({ error: "email, password and role are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!Object.values(AdminRole).includes(role as AdminRole)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await db.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing) return Response.json({ error: "Email already in use" }, { status: 409 });

  const newAdmin = await db.admin.create({
    data: {
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
      role: role as AdminRole,
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return Response.json({ admin: newAdmin }, { status: 201 });
}
