import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { PHONE_HASH_PEPPER } from "./phone";
import {
  isTtlMode,
  type EnvelopePayload,
  type Friend,
  type Profile,
  type Circle,
  MAX_CIRCLE,
  isDiscovery,
  type Discovery,
} from "./types";

function hashPhone(phone: string): string {
  return createHash("sha256").update(`${PHONE_HASH_PEPPER}:${phone}`).digest("hex");
}

function hashHandleValue(handle: string): string {
  const compact = handle.trim().toLowerCase().replace(/^@/, "");
  return createHash("sha256").update(`${PHONE_HASH_PEPPER}:handle:${compact}`).digest("hex");
}

function opaqueHandle(userId: string): string {
  const compact = userId.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 19);
  return (`h${compact}`).slice(0, 20) || "huser";
}

async function stampEmailHash(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const users = await sql.query<{ email: string | null }>(`select email from "user" where id = $1 limit 1`, [
    userId,
  ]);
  const email = users[0]?.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) return;
  const digest = hashPhone(email);
  await sql`update profiles set email_hash = ${digest}, updated_at = now() where user_id = ${userId}`;
}

function newId(): string {
  return randomBytes(16).toString("hex");
}

type ProfileRow = {
  user_id: string;
  handle: string;
  display_name: string;
  phone_hash: string | null;
  phone_last4: string | null;
  public_key: string | null;
  default_ttl: string;
  setup_complete: boolean;
  discovery?: string;
  allow_save?: boolean;
  send_receipts?: boolean;
  totp_enabled?: boolean;
  recovery_email_hash?: string | null;
  email_hash?: string | null;
  handle_hash?: string | null;
};

function toProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    handle: "",
    displayName: "",
    phoneLast4: null,
    hasPhone: Boolean(row.phone_hash),
    publicKey: row.public_key,
    defaultTtl: isTtlMode(row.default_ttl) ? row.default_ttl : "1d",
    setupComplete: row.setup_complete,
    discovery: isDiscovery(row.discovery ?? "handle") ? (row.discovery as Discovery) : "handle",
    allowSave: row.allow_save === true,
    sendReceipts: row.send_receipts !== false,
    totpEnabled: row.totp_enabled === true,
    hasRecoveryEmail: Boolean(row.recovery_email_hash),
  };
}

async function gc(sql: Awaited<ReturnType<typeof getSql>>) {
  await sql`delete from envelopes where expires_at is not null and expires_at < now()`;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Profile | null> => {
    const sql = await getSql();
    const rows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    return rows[0] ? toProfile(rows[0]) : null;
  });

export const ensureProfile = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        displayName: z.string().trim().min(1).max(40).optional(),
        publicKey: z.string().min(16).optional(),
        handleHash: z.string().length(64).optional(),
        setupComplete: z.boolean().optional(),
      })
      .parse(data),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Profile> => {
    const sql = await getSql();
    const existing = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    if (existing[0]) {
      if (data.publicKey && existing[0].public_key !== data.publicKey) {
        await sql`update profiles set public_key = ${data.publicKey}, updated_at = now() where user_id = ${context.userId}`;
        existing[0].public_key = data.publicKey;
      }
      if (data.handleHash) {
        const clash = await sql<{ n: number }>`select count(*)::int as n from profiles where handle_hash = ${data.handleHash} and user_id <> ${context.userId}`;
        if ((clash[0]?.n ?? 0) === 0) {
          await sql`update profiles set handle_hash = ${data.handleHash}, handle = ${opaqueHandle(context.userId)}, display_name = ${""}, updated_at = now() where user_id = ${context.userId}`;
        }
      }
      if (data.setupComplete) {
        await sql`update profiles set setup_complete = true, updated_at = now() where user_id = ${context.userId}`;
        existing[0].setup_complete = true;
      }
      await stampEmailHash(sql, context.userId);
      return toProfile(existing[0]);
    }
    const handle = opaqueHandle(context.userId);
    await sql`insert into profiles (user_id, handle, display_name, public_key, handle_hash, setup_complete)
      values (${context.userId}, ${handle}, ${""}, ${data.publicKey ?? null}, ${data.handleHash ?? null}, ${Boolean(data.setupComplete)})
      on conflict (user_id) do update set
        public_key = coalesce(excluded.public_key, profiles.public_key),
        handle_hash = coalesce(excluded.handle_hash, profiles.handle_hash),
        setup_complete = profiles.setup_complete or excluded.setup_complete,
        updated_at = now()`;
    const rows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    const profile = toProfile(rows[0]!);
    await stampEmailHash(sql, context.userId);
    return profile;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        displayName: z.string().trim().min(1).max(40).optional(),
        handle: z
          .string()
          .trim()
          .toLowerCase()
          .regex(/^[a-z0-9]{3,20}$/)
          .optional(),
        defaultTtl: z.string().optional(),
        setupComplete: z.boolean().optional(),
        publicKey: z.string().optional(),
        phone: z.string().nullable().optional(),
        discovery: z.enum(["handle", "anyone"]).optional(),
        allowSave: z.boolean().optional(),
        sendReceipts: z.boolean().optional(),
        totpEnabled: z.boolean().optional(),
        recoveryEmailHash: z.string().length(64).nullable().optional(),
        handleHash: z.string().length(64).optional(),
      })
      .parse(data),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Profile> => {
    const sql = await getSql();
    const rows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    if (!rows[0]) throw new Error("Profile missing");
    const next = rows[0];
    next.display_name = "";
    if (data.handleHash) {
      const clash = await sql<{ n: number }>`select count(*)::int as n from profiles where handle_hash = ${data.handleHash} and user_id <> ${context.userId}`;
      if ((clash[0]?.n ?? 0) > 0) throw new Error("That handle is taken");
      next.handle_hash = data.handleHash;
      next.handle = opaqueHandle(context.userId);
    } else if (data.handle) {
      const digest = hashHandleValue(data.handle);
      const clash = await sql<{ n: number }>`select count(*)::int as n from profiles where handle_hash = ${digest} and user_id <> ${context.userId}`;
      if ((clash[0]?.n ?? 0) > 0) throw new Error("That handle is taken");
      next.handle_hash = digest;
      next.handle = opaqueHandle(context.userId);
    }
    if (data.defaultTtl && isTtlMode(data.defaultTtl)) next.default_ttl = data.defaultTtl;
    if (data.setupComplete != null) next.setup_complete = data.setupComplete;
    if (data.publicKey) next.public_key = data.publicKey;
    if (data.phone === null) {
      next.phone_hash = null;
      next.phone_last4 = null;
    } else if (data.phone) {
      const hash = hashPhone(data.phone);
      const clash = await sql<{ n: number }>`select count(*)::int as n from profiles where phone_hash = ${hash} and user_id <> ${context.userId}`;
      if ((clash[0]?.n ?? 0) > 0) throw new Error("That number is already on another account");
      next.phone_hash = hash;
      next.phone_last4 = null;
    }
    if (data.discovery) next.discovery = data.discovery;
    if (data.allowSave != null) next.allow_save = data.allowSave;
    if (data.sendReceipts != null) next.send_receipts = data.sendReceipts;
    if (data.totpEnabled != null) next.totp_enabled = data.totpEnabled;
    if (data.recoveryEmailHash === null) next.recovery_email_hash = null;
    else if (data.recoveryEmailHash) next.recovery_email_hash = data.recoveryEmailHash;
    await sql`update profiles
      set display_name = ${""},
          handle = ${next.handle},
          default_ttl = ${next.default_ttl},
          setup_complete = ${next.setup_complete},
          public_key = ${next.public_key},
          phone_hash = ${next.phone_hash},
          phone_last4 = ${next.phone_last4},
          discovery = ${next.discovery ?? "handle"},
          allow_save = ${Boolean(next.allow_save)},
          send_receipts = ${next.send_receipts !== false},
          totp_enabled = ${Boolean(next.totp_enabled)},
          recovery_email_hash = ${next.recovery_email_hash ?? null},
          handle_hash = ${next.handle_hash ?? null},
          updated_at = now()
      where user_id = ${context.userId}`;
    return toProfile(next);
  });

export const resolvePhoneLogin = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ phone: z.string().min(8) }).parse(data))
  .handler(async ({ data }): Promise<{ email: string } | { error: string }> => {
    const sql = await getSql();
    const hash = hashPhone(data.phone);
    const profiles = await sql<{ user_id: string }>`select user_id from profiles where phone_hash = ${hash} limit 1`;
    if (!profiles[0]) return { error: "No account for that number" };
    const users = await sql.query<{ email: string }>(`select email from "user" where id = $1 limit 1`, [
      profiles[0].user_id,
    ]);
    if (!users[0]?.email) return { error: "No account for that number" };
    return { email: users[0].email };
  });

export const searchPeople = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        handleHash: z.string().length(64).optional(),
        phoneHash: z.string().length(64).optional(),
      })
      .refine((d) => Boolean(d.handleHash || d.phoneHash))
      .parse(data),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string; public_key: string | null }>`
      select user_id, public_key from profiles
      where user_id <> ${context.userId}
        and (
          (${data.handleHash ?? null}::text is not null and handle_hash = ${data.handleHash ?? null})
          or (${data.phoneHash ?? null}::text is not null and phone_hash = ${data.phoneHash ?? null})
        )
      limit 4
    `;
    return rows.map((row) => ({
      userId: row.user_id,
      publicKey: row.public_key,
    }));
  });

export type MatchedPerson = {
  userId: string;
  publicKey: string | null;
  phoneHash: string | null;
  emailHash: string | null;
};

export const matchContacts = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        phoneHashes: z.array(z.string().length(64)).max(200),
        emailHashes: z.array(z.string().length(64)).max(200),
      })
      .parse(data),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<MatchedPerson[]> => {
    const hashes = [...new Set(data.phoneHashes)];
    const emailHashes = [...new Set(data.emailHashes)];
    if (!hashes.length && !emailHashes.length) return [];
    const sql = await getSql();
    const params: unknown[] = [context.userId];
    const clauses: string[] = [];
    if (hashes.length) {
      const start = params.length + 1;
      hashes.forEach((h) => params.push(h));
      const placeholders = hashes.map((_, i) => `$${start + i}`).join(", ");
      clauses.push(`p.phone_hash in (${placeholders})`);
    }
    if (emailHashes.length) {
      const start = params.length + 1;
      emailHashes.forEach((e) => params.push(e));
      const placeholders = emailHashes.map((_, i) => `$${start + i}`).join(", ");
      clauses.push(`p.email_hash in (${placeholders})`);
    }
    const rows = await sql.query<{
      user_id: string;
      public_key: string | null;
      phone_hash: string | null;
      email_hash: string | null;
    }>(
      `select p.user_id, p.public_key, p.phone_hash, p.email_hash
       from profiles p
       where p.user_id <> $1 and (${clauses.join(" or ")})
       limit 200`,
      params,
    );
    return rows.map((row) => ({
      userId: row.user_id,
      publicKey: row.public_key,
      phoneHash: row.phone_hash,
      emailHash: row.email_hash,
    }));
  });

export const listFriends = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<Friend[]> => []);

export const sendFriendRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ userId: z.string().min(1) }).parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (data.userId === context.userId) throw new Error("You already have you");
    return { ok: true as const, already: false };
  });

export const respondFriendRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ friendshipId: z.string(), accept: z.boolean() }).parse(data),
  )
  .middleware([authMiddleware])
  .handler(async () => ({ ok: true as const }));

const envelopeInput = z.object({
  recipientId: z.string().min(1),
  ttlMode: z.string(),
  expiresAt: z.string().nullable(),
  wrappedKey: z.string().min(8),
  iv: z.string().min(8),
  ciphertext: z.string().min(8),
  poster: z.string().nullable(),
  groupId: z.string().nullable().optional(),
});

export const publishEnvelope = createServerFn({ method: "POST" })
  .validator((data: unknown) => envelopeInput.parse(data))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    if (!isTtlMode(data.ttlMode)) throw new Error("Invalid lifetime");
    if (data.ciphertext.length > 48_000_000) throw new Error("Clip is too large");
    const sql = await getSql();
    await gc(sql);
    const id = newId();
    await sql`insert into envelopes
      (id, sender_id, recipient_id, ttl_mode, expires_at, wrapped_key, iv, ciphertext, poster, duration_ms, media_kind, mime_type, group_id, purpose, allow_save, caption)
      values (
        ${id},
        ${null},
        ${data.recipientId},
        ${data.ttlMode},
        ${data.expiresAt},
        ${data.wrappedKey},
        ${data.iv},
        ${data.ciphertext},
        ${data.poster},
        ${0},
        ${"sealed"},
        ${"application/octet-stream"},
        ${null},
        ${"sealed"},
        ${false},
        ${null}
      )`;
    return { id };
  });

export const listInbox = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await gc(sql);
    const rows = await sql<{ id: string }>`
      select e.id
      from envelopes e
      where e.recipient_id = ${context.userId} and e.delivered_at is null
      order by e.created_at desc
      limit 50
    `;
    return rows.map((row) => ({ id: row.id }));
  });

export const pickupEnvelope = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.string().min(1), retain: z.boolean().optional() }).parse(data),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<EnvelopePayload | null> => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      sender_id: string | null;
      ttl_mode: string;
      created_at: string;
      wrapped_key: string;
      iv: string;
      ciphertext: string;
      poster: string | null;
      media_kind: string;
    }>`
      select id, sender_id, ttl_mode, created_at::text as created_at,
             wrapped_key, iv, ciphertext, poster, media_kind
      from envelopes
      where id = ${data.id} and recipient_id = ${context.userId} and delivered_at is null
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    if (data.retain) {
      await sql`update envelopes set delivered_at = now()
        where id = ${data.id} and recipient_id = ${context.userId}`;
    } else {
      await sql`delete from envelopes where id = ${data.id} and recipient_id = ${context.userId}`;
    }
    const legacy = row.media_kind !== "sealed";
    return {
      id: row.id,
      ttlMode: isTtlMode(row.ttl_mode) ? row.ttl_mode : "1d",
      createdAt: row.created_at,
      wrappedKey: row.wrapped_key,
      iv: row.iv,
      ciphertext: row.ciphertext,
      poster: row.poster,
      senderId: legacy && row.sender_id ? row.sender_id : undefined,
    };
  });

export const shredEnvelope = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from envelopes
      where id = ${data.id}
        and (recipient_id = ${context.userId} or sender_id is null or sender_id = ${context.userId})`;
    return { ok: true as const };
  });

export const shredMyEnvelopes = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ ids: z.array(z.string().min(8).max(80)).max(500).optional() }).parse(data ?? {}),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const before = await sql<{ n: number }>`
      select count(*)::int as n from envelopes
      where recipient_id = ${context.userId}`;
    await sql`delete from envelopes where recipient_id = ${context.userId}`;
    let extra = 0;
    const ids = data.ids ?? [];
    if (ids.length) {
      for (const id of ids) {
        const gone = await sql`delete from envelopes where id = ${id} returning id`;
        extra += gone.length;
      }
    }
    return { removed: (before[0]?.n ?? 0) + extra };
  });

export const listCircles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<Circle[]> => []);

export const createCircle = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: z.string().trim().min(1).max(40),
        memberIds: z.array(z.string().min(1)).max(MAX_CIRCLE - 1),
      })
      .parse(data),
  )
  .middleware([authMiddleware])
  .handler(async (): Promise<Circle> => {
    throw new Error("Groups stay on this phone");
  });

export const leaveCircle = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ circleId: z.string().min(1) }).parse(data))
  .middleware([authMiddleware])
  .handler(async () => ({ ok: true as const }));

export const respondCircleInvite = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ circleId: z.string().min(1), accept: z.boolean() }).parse(data),
  )
  .middleware([authMiddleware])
  .handler(async () => ({ ok: true as const }));

export const blockUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ userId: z.string().min(1) }).parse(data))
  .middleware([authMiddleware])
  .handler(async () => ({ ok: true as const }));

export const createInviteLink = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const token = newId();
    await sql`insert into invites (token, inviter_id) values (${token}, ${context.userId})`;
    return { token };
  });

export const peekInvite = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string().min(8) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string; public_key: string | null }>`
      select p.user_id, p.public_key
      from invites i
      join profiles p on p.user_id = i.inviter_id
      where i.token = ${data.token}
      limit 1`;
    if (!rows[0]) return null;
    return { userId: rows[0].user_id, publicKey: rows[0].public_key };
  });

export const acceptInviteLink = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string().min(8) }).parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const inv = await sql<{ inviter_id: string }>`
      select inviter_id from invites where token = ${data.token} limit 1`;
    if (!inv[0]) throw new Error("Invite expired");
    if (inv[0].inviter_id === context.userId) return { userId: inv[0].inviter_id, publicKey: null as string | null };
    const prof = await sql<{ public_key: string | null }>`
      select public_key from profiles where user_id = ${inv[0].inviter_id} limit 1`;
    return { userId: inv[0].inviter_id, publicKey: prof[0]?.public_key ?? null };
  });

export const putRecoveryBlob = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ kind: z.enum(["email", "emergency"]), blob: z.string().min(8).max(20000) }).parse(data),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into recovery_blobs (user_id, kind, blob, updated_at)
      values (${context.userId}, ${data.kind}, ${data.blob}, now())
      on conflict (user_id, kind) do update set blob = excluded.blob, updated_at = now()`;
    return { ok: true as const };
  });

export const getRecoveryBlob = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ kind: z.enum(["email", "emergency"]) }).parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ blob: string }>`
      select blob from recovery_blobs where user_id = ${context.userId} and kind = ${data.kind} limit 1`;
    return rows[0]?.blob ?? null;
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ confirm: z.literal("DELETE") }).parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`delete from envelopes where sender_id = ${context.userId} or recipient_id = ${context.userId}`;
    await sql`delete from envelopes where group_id in (
      select id from circles where created_by = ${context.userId}
    )`;
    await sql`delete from circle_members where user_id = ${context.userId}`;
    await sql`delete from circle_members where circle_id in (
      select id from circles where created_by = ${context.userId}
    )`;
    await sql`delete from circles where created_by = ${context.userId}`;
    await sql`delete from friendships where requester_id = ${context.userId} or addressee_id = ${context.userId}`;
    await sql`delete from recovery_blobs where user_id = ${context.userId}`;
    await sql`delete from invites where inviter_id = ${context.userId}`;
    await sql`delete from blocks where blocker_id = ${context.userId} or blocked_id = ${context.userId}`;
    await sql`delete from profiles where user_id = ${context.userId}`;
    await sql.query(`delete from "user" where id = $1`, [context.userId]);
    return { ok: true as const };
  });
