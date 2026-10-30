import webpush from "web-push";
import type { Sql } from "@/lib/db";

/**
 * Web Push sender (server-only). Needs VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY in
 * the environment; without them push is simply off and nothing is sent.
 */

export function vapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

function configured(): boolean {
  const pub = vapidPublicKey();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT?.trim() || "mailto:owner@haven.invalid", pub, priv);
  return true;
}

/**
 * Wake every device of `userId`. The payload only says a clip arrived — the
 * push service (Apple/Google) never learns who sent it or what it holds.
 * Best-effort: failures never block sending the clip.
 */
export async function sendPushTo(sql: Sql, userId: string): Promise<void> {
  if (!configured()) return;
  const subs = await sql<{ endpoint: string; p256dh: string; auth: string }>`
    select endpoint, p256dh, auth from push_subscriptions where user_id = ${userId}`;
  const payload = JSON.stringify({ type: "clip" });
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 60 * 60 * 24, urgency: "high", timeout: 5000 },
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        // The device unsubscribed or the app was removed — forget it.
        if (status === 404 || status === 410) {
          await sql`delete from push_subscriptions where endpoint = ${sub.endpoint}`;
        }
      }
    }),
  );
}
