import { db } from "@/lib/db";
import { getAdminWithRole, hashPassword } from "@/lib/auth";
import { AdminRole } from "@/generated/prisma/client";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const caller = await getAdminWithRole();
  if (!caller) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (caller.role !== AdminRole.SUPER_ADMIN) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const targetId = Number(id);
  if (isNaN(targetId)) return Response.json({ error: "Invalid id" }, { status: 400 });

  if (targetId === caller.adminId) {
    return Response.json({ error: "Cannot modify your own account" }, { status: 400 });
  }

  const existing = await db.admin.findUnique({ where: { id: targetId } });
  if (!existing) return Response.json({ error: "Admin not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { role, password } = body as { role?: string; password?: string };

  if (!role && !password) {
    return Response.json({ error: "role or password is required" }, { status: 400 });
  }
  if (role && !Object.values(AdminRole).includes(role as AdminRole)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }
  if (password && password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const updated = await db.admin.update({
    where: { id: targetId },
    data: {
      ...(role && { role: role as AdminRole }),
      ...(password && { passwordHash: await hashPassword(password) }),
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return Response.json({ admin: updated });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const caller = await getAdminWithRole();
  if (!caller) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (caller.role !== AdminRole.SUPER_ADMIN) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const targetId = Number(id);
  if (isNaN(targetId)) return Response.json({ error: "Invalid id" }, { status: 400 });

  if (targetId === caller.adminId) {
    return Response.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const existing = await db.admin.findUnique({ where: { id: targetId } });
  if (!existing) return Response.json({ error: "Admin not found" }, { status: 404 });

  await db.admin.delete({ where: { id: targetId } });
  return Response.json({ ok: true });
}
