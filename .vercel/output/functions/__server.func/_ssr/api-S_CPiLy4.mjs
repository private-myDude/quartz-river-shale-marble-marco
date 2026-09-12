import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-B6uX80ec.mjs";
import { f as isTtlMode, i as authMiddleware, s as isDiscovery } from "./types-BaOifboJ.mjs";
import { t as PHONE_HASH_PEPPER } from "./phone-B91MbUMF.mjs";
import { cn as _enum, dn as boolean, gn as object, pn as literal, un as array, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { createHash, randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/api-S_CPiLy4.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function hashPhone(phone) {
	return createHash("sha256").update(`${PHONE_HASH_PEPPER}:${phone}`).digest("hex");
}
function hashHandleValue(handle) {
	const compact = handle.trim().toLowerCase().replace(/^@/, "");
	return createHash("sha256").update(`${PHONE_HASH_PEPPER}:handle:${compact}`).digest("hex");
}
function opaqueHandle(userId) {
	return `h${userId.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 19)}`.slice(0, 20) || "huser";
}
async function stampEmailHash(sql, userId) {
	const email = (await sql.query(`select email from "user" where id = $1 limit 1`, [userId]))[0]?.email?.trim().toLowerCase();
	if (!email || !email.includes("@")) return;
	await sql`update profiles set email_hash = ${hashPhone(email)}, updated_at = now() where user_id = ${userId}`;
}
function newId() {
	return randomBytes(16).toString("hex");
}
function toProfile(row) {
	return {
		userId: row.user_id,
		handle: "",
		displayName: "",
		phoneLast4: null,
		hasPhone: Boolean(row.phone_hash),
		publicKey: row.public_key,
		defaultTtl: isTtlMode(row.default_ttl) ? row.default_ttl : "1d",
		setupComplete: row.setup_complete,
		discovery: isDiscovery(row.discovery ?? "handle") ? row.discovery : "handle",
		allowSave: row.allow_save === true,
		sendReceipts: row.send_receipts !== false,
		totpEnabled: row.totp_enabled === true,
		hasRecoveryEmail: Boolean(row.recovery_email_hash)
	};
}
async function gc(sql) {
	await sql`delete from envelopes where expires_at is not null and expires_at < now()`;
}
var getMyProfile_createServerFn_handler = createServerRpc({
	id: "c864f410842cef6326976c340afea2c02fcd89978f6ec59ca8ae5064430ffdad",
	name: "getMyProfile",
	filename: "src/lib/haven/api.ts"
}, (opts) => getMyProfile.__executeServer(opts));
var getMyProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMyProfile_createServerFn_handler, async ({ context }) => {
	const rows = await (await getSql())`select * from profiles where user_id = ${context.userId} limit 1`;
	return rows[0] ? toProfile(rows[0]) : null;
});
var ensureProfile_createServerFn_handler = createServerRpc({
	id: "ca337694d2c67d70846eca9a5c6ce8d499cb435698e3f6cfb2d93e1638088c39",
	name: "ensureProfile",
	filename: "src/lib/haven/api.ts"
}, (opts) => ensureProfile.__executeServer(opts));
var ensureProfile = createServerFn({ method: "POST" }).validator((data) => object({
	displayName: string().trim().min(1).max(40).optional(),
	publicKey: string().min(16).optional(),
	handleHash: string().length(64).optional(),
	setupComplete: boolean().optional()
}).parse(data)).middleware([authMiddleware]).handler(ensureProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const existing = await sql`select * from profiles where user_id = ${context.userId} limit 1`;
	if (existing[0]) {
		if (data.publicKey && existing[0].public_key !== data.publicKey) {
			await sql`update profiles set public_key = ${data.publicKey}, updated_at = now() where user_id = ${context.userId}`;
			existing[0].public_key = data.publicKey;
		}
		if (data.handleHash) {
			if (((await sql`select count(*)::int as n from profiles where handle_hash = ${data.handleHash} and user_id <> ${context.userId}`)[0]?.n ?? 0) === 0) await sql`update profiles set handle_hash = ${data.handleHash}, handle = ${opaqueHandle(context.userId)}, display_name = ${""}, updated_at = now() where user_id = ${context.userId}`;
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
	const profile = toProfile((await sql`select * from profiles where user_id = ${context.userId} limit 1`)[0]);
	await stampEmailHash(sql, context.userId);
	return profile;
});
var updateProfile_createServerFn_handler = createServerRpc({
	id: "73a37e2a048cee92f79aea61fadb3d0bdc1770d3bde7e90fe00eed2d1ebce435",
	name: "updateProfile",
	filename: "src/lib/haven/api.ts"
}, (opts) => updateProfile.__executeServer(opts));
var updateProfile = createServerFn({ method: "POST" }).validator((data) => object({
	displayName: string().trim().min(1).max(40).optional(),
	handle: string().trim().toLowerCase().regex(/^[a-z0-9]{3,20}$/).optional(),
	defaultTtl: string().optional(),
	setupComplete: boolean().optional(),
	publicKey: string().optional(),
	phone: string().nullable().optional(),
	discovery: _enum(["handle", "anyone"]).optional(),
	allowSave: boolean().optional(),
	sendReceipts: boolean().optional(),
	totpEnabled: boolean().optional(),
	recoveryEmailHash: string().length(64).nullable().optional(),
	handleHash: string().length(64).optional()
}).parse(data)).middleware([authMiddleware]).handler(updateProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const rows = await sql`select * from profiles where user_id = ${context.userId} limit 1`;
	if (!rows[0]) throw new Error("Profile missing");
	const next = rows[0];
	next.display_name = "";
	if (data.handleHash) {
		if (((await sql`select count(*)::int as n from profiles where handle_hash = ${data.handleHash} and user_id <> ${context.userId}`)[0]?.n ?? 0) > 0) throw new Error("That handle is taken");
		next.handle_hash = data.handleHash;
		next.handle = opaqueHandle(context.userId);
	} else if (data.handle) {
		const digest = hashHandleValue(data.handle);
		if (((await sql`select count(*)::int as n from profiles where handle_hash = ${digest} and user_id <> ${context.userId}`)[0]?.n ?? 0) > 0) throw new Error("That handle is taken");
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
		if (((await sql`select count(*)::int as n from profiles where phone_hash = ${hash} and user_id <> ${context.userId}`)[0]?.n ?? 0) > 0) throw new Error("That number is already on another account");
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
var resolvePhoneLogin_createServerFn_handler = createServerRpc({
	id: "8b78b2ce5f6a4fe41aedd2337273e265d4074ab8a79dcb651f48e2c20ce4d9ba",
	name: "resolvePhoneLogin",
	filename: "src/lib/haven/api.ts"
}, (opts) => resolvePhoneLogin.__executeServer(opts));
var resolvePhoneLogin = createServerFn({ method: "POST" }).validator((data) => object({ phone: string().min(8) }).parse(data)).handler(resolvePhoneLogin_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const profiles = await sql`select user_id from profiles where phone_hash = ${hashPhone(data.phone)} limit 1`;
	if (!profiles[0]) return { error: "No account for that number" };
	const users = await sql.query(`select email from "user" where id = $1 limit 1`, [profiles[0].user_id]);
	if (!users[0]?.email) return { error: "No account for that number" };
	return { email: users[0].email };
});
var searchPeople_createServerFn_handler = createServerRpc({
	id: "9a19867c0133714d65793575f6608ae59ad8da6d11e0dd657e498b855bc9aef0",
	name: "searchPeople",
	filename: "src/lib/haven/api.ts"
}, (opts) => searchPeople.__executeServer(opts));
var searchPeople = createServerFn({ method: "POST" }).validator((data) => object({
	handleHash: string().length(64).optional(),
	phoneHash: string().length(64).optional()
}).refine((d) => Boolean(d.handleHash || d.phoneHash)).parse(data)).middleware([authMiddleware]).handler(searchPeople_createServerFn_handler, async ({ context, data }) => {
	return (await (await getSql())`
      select user_id, public_key from profiles
      where user_id <> ${context.userId}
        and (
          (${data.handleHash ?? null}::text is not null and handle_hash = ${data.handleHash ?? null})
          or (${data.phoneHash ?? null}::text is not null and phone_hash = ${data.phoneHash ?? null})
        )
      limit 4
    `).map((row) => ({
		userId: row.user_id,
		publicKey: row.public_key
	}));
});
var matchContacts_createServerFn_handler = createServerRpc({
	id: "ba8b76beee56373f7d8967267e18ae09b8ce78568153aa3e1af7a827aa323bbf",
	name: "matchContacts",
	filename: "src/lib/haven/api.ts"
}, (opts) => matchContacts.__executeServer(opts));
var matchContacts = createServerFn({ method: "POST" }).validator((data) => object({
	phoneHashes: array(string().length(64)).max(200),
	emailHashes: array(string().length(64)).max(200)
}).parse(data)).middleware([authMiddleware]).handler(matchContacts_createServerFn_handler, async ({ context, data }) => {
	const hashes = [...new Set(data.phoneHashes)];
	const emailHashes = [...new Set(data.emailHashes)];
	if (!hashes.length && !emailHashes.length) return [];
	const sql = await getSql();
	const params = [context.userId];
	const clauses = [];
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
	return (await sql.query(`select p.user_id, p.public_key, p.phone_hash, p.email_hash
       from profiles p
       where p.user_id <> $1 and (${clauses.join(" or ")})
       limit 200`, params)).map((row) => ({
		userId: row.user_id,
		publicKey: row.public_key,
		phoneHash: row.phone_hash,
		emailHash: row.email_hash
	}));
});
var listFriends_createServerFn_handler = createServerRpc({
	id: "b6da32308f313759cdec75ed8f56c2bbf8dea307a53392cd569fdd85e3a4a77b",
	name: "listFriends",
	filename: "src/lib/haven/api.ts"
}, (opts) => listFriends.__executeServer(opts));
var listFriends = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listFriends_createServerFn_handler, async () => []);
var sendFriendRequest_createServerFn_handler = createServerRpc({
	id: "232562c0160901cf6d7370fed1083c1c4d6da4f343fbfcd616f1c9b26bbc8552",
	name: "sendFriendRequest",
	filename: "src/lib/haven/api.ts"
}, (opts) => sendFriendRequest.__executeServer(opts));
var sendFriendRequest = createServerFn({ method: "POST" }).validator((data) => object({ userId: string().min(1) }).parse(data)).middleware([authMiddleware]).handler(sendFriendRequest_createServerFn_handler, async ({ context, data }) => {
	if (data.userId === context.userId) throw new Error("You already have you");
	return {
		ok: true,
		already: false
	};
});
var respondFriendRequest_createServerFn_handler = createServerRpc({
	id: "e12bff1add1853646cbec68dc5dc472390ddc73c603e2db4fe46c1a389d7bf96",
	name: "respondFriendRequest",
	filename: "src/lib/haven/api.ts"
}, (opts) => respondFriendRequest.__executeServer(opts));
var respondFriendRequest = createServerFn({ method: "POST" }).validator((data) => object({
	friendshipId: string(),
	accept: boolean()
}).parse(data)).middleware([authMiddleware]).handler(respondFriendRequest_createServerFn_handler, async () => ({ ok: true }));
var envelopeInput = object({
	recipientId: string().min(1),
	ttlMode: string(),
	expiresAt: string().nullable(),
	wrappedKey: string().min(8),
	iv: string().min(8),
	ciphertext: string().min(8),
	poster: string().nullable(),
	groupId: string().nullable().optional()
});
var publishEnvelope_createServerFn_handler = createServerRpc({
	id: "31e71ac27ac8f958b02474f79ed1dfafd9e1693d047befbb4bc9c4744a0369b8",
	name: "publishEnvelope",
	filename: "src/lib/haven/api.ts"
}, (opts) => publishEnvelope.__executeServer(opts));
var publishEnvelope = createServerFn({ method: "POST" }).validator((data) => envelopeInput.parse(data)).middleware([authMiddleware]).handler(publishEnvelope_createServerFn_handler, async ({ data }) => {
	if (!isTtlMode(data.ttlMode)) throw new Error("Invalid lifetime");
	if (data.ciphertext.length > 48e6) throw new Error("Clip is too large");
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
var listInbox_createServerFn_handler = createServerRpc({
	id: "7f7feb6ca0e2bc40f4f4c77139bc84931d3d2e48df48ffa9acb4536e5cd0028b",
	name: "listInbox",
	filename: "src/lib/haven/api.ts"
}, (opts) => listInbox.__executeServer(opts));
var listInbox = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listInbox_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await gc(sql);
	return (await sql`
      select e.id
      from envelopes e
      where e.recipient_id = ${context.userId} and e.delivered_at is null
      order by e.created_at desc
      limit 50
    `).map((row) => ({ id: row.id }));
});
var pickupEnvelope_createServerFn_handler = createServerRpc({
	id: "34e57d611606a7b716f7a6ab2781c7d95ef351e051f9eb625da37868794fbbd9",
	name: "pickupEnvelope",
	filename: "src/lib/haven/api.ts"
}, (opts) => pickupEnvelope.__executeServer(opts));
var pickupEnvelope = createServerFn({ method: "POST" }).validator((data) => object({
	id: string().min(1),
	retain: boolean().optional()
}).parse(data)).middleware([authMiddleware]).handler(pickupEnvelope_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = (await sql`
      select id, sender_id, ttl_mode, created_at::text as created_at,
             wrapped_key, iv, ciphertext, poster, media_kind
      from envelopes
      where id = ${data.id} and recipient_id = ${context.userId} and delivered_at is null
      limit 1
    `)[0];
	if (!row) return null;
	if (data.retain) await sql`update envelopes set delivered_at = now()
        where id = ${data.id} and recipient_id = ${context.userId}`;
	else await sql`delete from envelopes where id = ${data.id} and recipient_id = ${context.userId}`;
	const legacy = row.media_kind !== "sealed";
	return {
		id: row.id,
		ttlMode: isTtlMode(row.ttl_mode) ? row.ttl_mode : "1d",
		createdAt: row.created_at,
		wrappedKey: row.wrapped_key,
		iv: row.iv,
		ciphertext: row.ciphertext,
		poster: row.poster,
		senderId: legacy && row.sender_id ? row.sender_id : void 0
	};
});
var shredEnvelope_createServerFn_handler = createServerRpc({
	id: "c4f0a363de5f254fa0975ec9f6bc27f82caebe6e820ca6e3e3463b575906c9a3",
	name: "shredEnvelope",
	filename: "src/lib/haven/api.ts"
}, (opts) => shredEnvelope.__executeServer(opts));
var shredEnvelope = createServerFn({ method: "POST" }).validator((data) => object({ id: string().min(1) }).parse(data)).middleware([authMiddleware]).handler(shredEnvelope_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`delete from envelopes
      where id = ${data.id}
        and (recipient_id = ${context.userId} or sender_id is null or sender_id = ${context.userId})`;
	return { ok: true };
});
var shredMyEnvelopes_createServerFn_handler = createServerRpc({
	id: "b331b9e44f92c9fa5bb41c6001607382c7ac24655f3a817e4539e5c29951f592",
	name: "shredMyEnvelopes",
	filename: "src/lib/haven/api.ts"
}, (opts) => shredMyEnvelopes.__executeServer(opts));
var shredMyEnvelopes = createServerFn({ method: "POST" }).validator((data) => object({ ids: array(string().min(8).max(80)).max(500).optional() }).parse(data ?? {})).middleware([authMiddleware]).handler(shredMyEnvelopes_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const before = await sql`
      select count(*)::int as n from envelopes
      where recipient_id = ${context.userId}`;
	await sql`delete from envelopes where recipient_id = ${context.userId}`;
	let extra = 0;
	const ids = data.ids ?? [];
	if (ids.length) for (const id of ids) {
		const gone = await sql`delete from envelopes where id = ${id} returning id`;
		extra += gone.length;
	}
	return { removed: (before[0]?.n ?? 0) + extra };
});
var listCircles_createServerFn_handler = createServerRpc({
	id: "fa723475031a6b9093a43c475a1005e865e0e6a8ad1ccc90802881ae39bc62b4",
	name: "listCircles",
	filename: "src/lib/haven/api.ts"
}, (opts) => listCircles.__executeServer(opts));
var listCircles = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCircles_createServerFn_handler, async () => []);
var createCircle_createServerFn_handler = createServerRpc({
	id: "980e7ab8acd3258df5325bc94b42fff1b96ca9892567d4a16c2564da5f576a63",
	name: "createCircle",
	filename: "src/lib/haven/api.ts"
}, (opts) => createCircle.__executeServer(opts));
var createCircle = createServerFn({ method: "POST" }).validator((data) => object({
	name: string().trim().min(1).max(40),
	memberIds: array(string().min(1)).max(49)
}).parse(data)).middleware([authMiddleware]).handler(createCircle_createServerFn_handler, async () => {
	throw new Error("Groups stay on this phone");
});
var leaveCircle_createServerFn_handler = createServerRpc({
	id: "04bf561baf9b01b44086c2bf230562494725191052b34244e3242c6fa9b5978b",
	name: "leaveCircle",
	filename: "src/lib/haven/api.ts"
}, (opts) => leaveCircle.__executeServer(opts));
var leaveCircle = createServerFn({ method: "POST" }).validator((data) => object({ circleId: string().min(1) }).parse(data)).middleware([authMiddleware]).handler(leaveCircle_createServerFn_handler, async () => ({ ok: true }));
var respondCircleInvite_createServerFn_handler = createServerRpc({
	id: "ce8a9f9a1cfc3d3395e9c2cc9ef017ce3d9a79c25b1e31f0ae869d590834d690",
	name: "respondCircleInvite",
	filename: "src/lib/haven/api.ts"
}, (opts) => respondCircleInvite.__executeServer(opts));
var respondCircleInvite = createServerFn({ method: "POST" }).validator((data) => object({
	circleId: string().min(1),
	accept: boolean()
}).parse(data)).middleware([authMiddleware]).handler(respondCircleInvite_createServerFn_handler, async () => ({ ok: true }));
var blockUser_createServerFn_handler = createServerRpc({
	id: "3e1438f81b1bcf8d3728b00c0d008dab04dbe9c0792866a1e58d8d4d6d834cd0",
	name: "blockUser",
	filename: "src/lib/haven/api.ts"
}, (opts) => blockUser.__executeServer(opts));
var blockUser = createServerFn({ method: "POST" }).validator((data) => object({ userId: string().min(1) }).parse(data)).middleware([authMiddleware]).handler(blockUser_createServerFn_handler, async () => ({ ok: true }));
var createInviteLink_createServerFn_handler = createServerRpc({
	id: "dcfdfe47aa8fefd19f30b3efccf26c2f546eefa54164936daf1580b92c9c0ff5",
	name: "createInviteLink",
	filename: "src/lib/haven/api.ts"
}, (opts) => createInviteLink.__executeServer(opts));
var createInviteLink = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createInviteLink_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const token = newId();
	await sql`insert into invites (token, inviter_id) values (${token}, ${context.userId})`;
	return { token };
});
var peekInvite_createServerFn_handler = createServerRpc({
	id: "2062e91e0d15db8a31638d77b0b3118391337b9fdf6113f982ea35ce30bbf387",
	name: "peekInvite",
	filename: "src/lib/haven/api.ts"
}, (opts) => peekInvite.__executeServer(opts));
var peekInvite = createServerFn({ method: "POST" }).validator((data) => object({ token: string().min(8) }).parse(data)).handler(peekInvite_createServerFn_handler, async ({ data }) => {
	const rows = await (await getSql())`
      select p.user_id, p.public_key
      from invites i
      join profiles p on p.user_id = i.inviter_id
      where i.token = ${data.token}
      limit 1`;
	if (!rows[0]) return null;
	return {
		userId: rows[0].user_id,
		publicKey: rows[0].public_key
	};
});
var acceptInviteLink_createServerFn_handler = createServerRpc({
	id: "9a3168d6bbdb385478466cc1ceccc9c6a018f754bfb00aaae9d7b901b6e7413d",
	name: "acceptInviteLink",
	filename: "src/lib/haven/api.ts"
}, (opts) => acceptInviteLink.__executeServer(opts));
var acceptInviteLink = createServerFn({ method: "POST" }).validator((data) => object({ token: string().min(8) }).parse(data)).middleware([authMiddleware]).handler(acceptInviteLink_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const inv = await sql`
      select inviter_id from invites where token = ${data.token} limit 1`;
	if (!inv[0]) throw new Error("Invite expired");
	if (inv[0].inviter_id === context.userId) return {
		userId: inv[0].inviter_id,
		publicKey: null
	};
	const prof = await sql`
      select public_key from profiles where user_id = ${inv[0].inviter_id} limit 1`;
	return {
		userId: inv[0].inviter_id,
		publicKey: prof[0]?.public_key ?? null
	};
});
var putRecoveryBlob_createServerFn_handler = createServerRpc({
	id: "00c1b02f741f4cc6c22ec4c529e46988c61c75e68e78a0b60734634d7828dee4",
	name: "putRecoveryBlob",
	filename: "src/lib/haven/api.ts"
}, (opts) => putRecoveryBlob.__executeServer(opts));
var putRecoveryBlob = createServerFn({ method: "POST" }).validator((data) => object({
	kind: _enum(["email", "emergency"]),
	blob: string().min(8).max(2e4)
}).parse(data)).middleware([authMiddleware]).handler(putRecoveryBlob_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`insert into recovery_blobs (user_id, kind, blob, updated_at)
      values (${context.userId}, ${data.kind}, ${data.blob}, now())
      on conflict (user_id, kind) do update set blob = excluded.blob, updated_at = now()`;
	return { ok: true };
});
var getRecoveryBlob_createServerFn_handler = createServerRpc({
	id: "55bcc78e784a8f482837c24dd2c73bc44768b792c66dec9d7f430df3b9c557e3",
	name: "getRecoveryBlob",
	filename: "src/lib/haven/api.ts"
}, (opts) => getRecoveryBlob.__executeServer(opts));
var getRecoveryBlob = createServerFn({ method: "POST" }).validator((data) => object({ kind: _enum(["email", "emergency"]) }).parse(data)).middleware([authMiddleware]).handler(getRecoveryBlob_createServerFn_handler, async ({ context, data }) => {
	return (await (await getSql())`
      select blob from recovery_blobs where user_id = ${context.userId} and kind = ${data.kind} limit 1`)[0]?.blob ?? null;
});
var deleteAccount_createServerFn_handler = createServerRpc({
	id: "c75177100427a0d0d51456e7471e5e85ebcde22600fa047589bacbf8085d6724",
	name: "deleteAccount",
	filename: "src/lib/haven/api.ts"
}, (opts) => deleteAccount.__executeServer(opts));
var deleteAccount = createServerFn({ method: "POST" }).validator((data) => object({ confirm: literal("DELETE") }).parse(data)).middleware([authMiddleware]).handler(deleteAccount_createServerFn_handler, async ({ context }) => {
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
	return { ok: true };
});
//#endregion
export { acceptInviteLink_createServerFn_handler, blockUser_createServerFn_handler, createCircle_createServerFn_handler, createInviteLink_createServerFn_handler, deleteAccount_createServerFn_handler, ensureProfile_createServerFn_handler, getMyProfile_createServerFn_handler, getRecoveryBlob_createServerFn_handler, leaveCircle_createServerFn_handler, listCircles_createServerFn_handler, listFriends_createServerFn_handler, listInbox_createServerFn_handler, matchContacts_createServerFn_handler, peekInvite_createServerFn_handler, pickupEnvelope_createServerFn_handler, publishEnvelope_createServerFn_handler, putRecoveryBlob_createServerFn_handler, resolvePhoneLogin_createServerFn_handler, respondCircleInvite_createServerFn_handler, respondFriendRequest_createServerFn_handler, searchPeople_createServerFn_handler, sendFriendRequest_createServerFn_handler, shredEnvelope_createServerFn_handler, shredMyEnvelopes_createServerFn_handler, updateProfile_createServerFn_handler };
