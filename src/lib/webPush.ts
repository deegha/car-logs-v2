import webpush from "web-push";

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_MAILTO}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export async function sendPushToSeller(
  sellerId: number,
  payload: { title: string; body: string; tag?: string; data?: Record<string, string> }
) {
  configure();
  const { db } = await import("@/lib/db");
  const subs = await db.pushSubscription.findMany({ where: { sellerId } });
  if (subs.length === 0) return;

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    tag: payload.tag ?? "carlogs-notification",
    data: payload.data ?? {},
  });

  await Promise.allSettled(
    subs.map(async (sub: { id: number; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification
        );
      } catch (err: unknown) {
        // Remove expired/invalid subscriptions (410 Gone or 404)
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await db.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    })
  );
}
