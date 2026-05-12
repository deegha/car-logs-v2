import { db } from "@/lib/db";
import { hashPassword, createSellerSession } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, password } = body as Record<string, string>;

  if (!firstName || !lastName || !email || !password) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }
  if (phone !== undefined && phone !== "" && !/^\d{9}$/.test(phone)) {
    return Response.json({ error: "Phone must be 9 digits (after +94)" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await db.seller.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const hasPhone = phone && /^\d{9}$/.test(phone);

  const seller = await db.seller.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash: await hashPassword(password),
      ...(hasPhone && {
        phones: { create: { number: phone, isPrimary: true, isWhatsApp: false } },
      }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      phones: { select: { id: true, number: true, isPrimary: true, isWhatsApp: true } },
    },
  });

  await createSellerSession(seller.id);

  return Response.json({ seller }, { status: 201 });
}
