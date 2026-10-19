import webpush from "web-push";

let configured = false;
let configureFailed = false;

/**
 * Best-effort VAPID setup. Returns false when keys are missing/invalid so
 * callers can skip push without throwing — approval/status updates must not
 * depend on notification delivery.
 */
function configure(): boolean {
  if (configured) return true;
  if (configureFailed) return false;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const mailto = process.env.VAPID_MAILTO?.trim() || "noreply@carlogs.lk";

  if (!publicKey || !privateKey) {
    configureFailed = true;
    console.warn(
      "[webPush] VAPID keys not configured — skipping push notifications"
    );
    return false;
  }

  try {
    webpush.setVapidDetails(`mailto:${mailto}`, publicKey, privateKey);
    configured = true;
    return true;
  } catch (err) {
    configureFailed = true;
    console.error("[webPush] Failed to configure VAPID details:", err);
    return false;
  }
}

export async function sendPushToSeller(
  sellerId: number,
  payload: { title: string; body: string; tag?: string; data?: Record<string, string> }
): Promise<void> {
  // Never throw — push is optional side-effect of listing approval.
  try {
    if (!configure()) return;

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
  } catch (err) {
    console.error("[webPush] sendPushToSeller failed (non-fatal):", err);
  }
}
