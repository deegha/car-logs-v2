import { db } from "@/lib/db";
import { verifyPassword, createSellerSession } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body as Record<string, string>;

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const seller = await db.seller.findUnique({ where: { email } });
  if (!seller || !(await verifyPassword(password, seller.passwordHash))) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (seller.status === "SUSPENDED") {
    return Response.json({ error: "Account suspended" }, { status: 403 });
  }

  await createSellerSession(seller.id);

  return Response.json({
    seller: {
      id: seller.id,
      firstName: seller.firstName,
      lastName: seller.lastName,
      email: seller.email,
      phone: seller.phone,
      status: seller.status,
    },
  });
}
