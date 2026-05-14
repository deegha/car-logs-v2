import { getSellerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSellerSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { subscription } = (await req.json()) as {
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  };

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      sellerId: session.sellerId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      sellerId: session.sellerId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSellerSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = (await req.json()) as { endpoint: string };
  if (!endpoint) return Response.json({ error: "Missing endpoint" }, { status: 400 });

  await db.pushSubscription.deleteMany({
    where: { endpoint, sellerId: session.sellerId },
  });

  return Response.json({ ok: true });
}
