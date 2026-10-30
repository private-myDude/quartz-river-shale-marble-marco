import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

/** The server's public push key, or null when push isn't set up. */
export const getPushPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  const { vapidPublicKey } = await import("./push.server");
  return { key: vapidPublicKey() };
});

const subscriptionInput = z.object({
  endpoint: z.string().url().max(2048),
  p256dh: z.string().min(16).max(256),
  auth: z.string().min(8).max(128),
});

export const savePushSubscription = createServerFn({ method: "POST" })
  .validator((data: unknown) => subscriptionInput.parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    // An endpoint belongs to one device; re-saving moves it to whoever is signed in now.
    await sql`insert into push_subscriptions (endpoint, user_id, p256dh, auth)
      values (${data.endpoint}, ${context.userId}, ${data.p256dh}, ${data.auth})
      on conflict (endpoint) do update
        set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`;
    return { ok: true as const };
  });

export const removePushSubscription = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ endpoint: z.string().max(2048) }).parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from push_subscriptions
      where endpoint = ${data.endpoint} and user_id = ${context.userId}`;
    return { ok: true as const };
  });
