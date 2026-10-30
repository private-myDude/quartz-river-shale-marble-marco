import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";

/**
 * Owner-issued password resets. Haven never sends email, so a family member who
 * forgets their password asks the owner (the first account) for a one-time
 * link. Links last 24 hours, work once, and are stored only as a hash.
 */

const LINK_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function ownerId(sql: Sql): Promise<string | null> {
  const rows = await sql<{ id: string }>`select id from "user" order by "createdAt" asc limit 1`;
  return rows[0]?.id ?? null;
}

export const amIOwner = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return { owner: (await ownerId(sql)) === context.userId };
  });

export const createPasswordResetLink = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ userId: z.string().min(1) }).parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if ((await ownerId(sql)) !== context.userId) throw new Error("Only the owner can reset passwords");
    const exists = await sql`select 1 from "user" where id = ${data.userId} limit 1`;
    if (!exists.length) throw new Error("That account no longer exists");
    const token = randomBytes(24).toString("hex");
    // A new link replaces any earlier one for the same person.
    await sql`delete from password_resets where user_id = ${data.userId}`;
    await sql`insert into password_resets (token_hash, user_id, expires_at)
      values (${hashToken(token)}, ${data.userId}, ${new Date(Date.now() + LINK_TTL_MS).toISOString()})`;
    return { token };
  });

export const checkPasswordResetLink = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string().min(16).max(128) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`select 1 from password_resets
      where token_hash = ${hashToken(data.token)} and expires_at > now() limit 1`;
    return { valid: rows.length > 0 };
  });

export const resetPasswordWithLink = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ token: z.string().min(16).max(128), password: z.string().min(8).max(128) }).parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    // Claim the link atomically so it can only ever be used once.
    const rows = await sql<{ user_id: string }>`delete from password_resets
      where token_hash = ${hashToken(data.token)} and expires_at > now()
      returning user_id`;
    const userId = rows[0]?.user_id;
    if (!userId) throw new Error("This reset link has expired or was already used");
    const { auth } = await import("@/lib/auth/server");
    const ctx = await auth.$context;
    await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(data.password));
    // Sign out every device that used the old password.
    await ctx.internalAdapter.deleteUserSessions(userId);
    return { ok: true as const };
  });
