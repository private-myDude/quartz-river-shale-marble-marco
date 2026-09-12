import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as expiresAtFrom, c as isGroupPeer, d as isReactionEmoji, f as isTtlMode, h as ttlLabel, l as isMediaKind, m as ttlHint, n as SELF_PEER, o as groupPeerId, p as parseGroupId, r as TTL_OPTIONS, t as REACTION_EMOJIS, u as isPlayable } from "./types-BaOifboJ.mjs";
import { i as normalizePhone, n as last4, r as looksLikePhone, t as PHONE_HASH_PEPPER } from "./phone-B91MbUMF.mjs";
import { n as signOut } from "./client-C_SNNFs7.mjs";
import { _ as shredMyEnvelopes, b as useCurrentUserState, c as deleteAccount, d as matchContacts, g as searchPeople, h as putRecoveryBlob, l as ensureProfile, m as publishEnvelope, n as Button, o as cn, p as pickupEnvelope, r as HavenMark, s as createInviteLink, t as Atmosphere, u as listInbox, v as updateProfile } from "./button-DbxQEyOR.mjs";
import { A as saveCircle, B as unlockWithPhrase, C as lockSession, D as rememberOutgoing, E as remainingBackupCodes, F as storeTotpSecret, G as kvDel, H as upsertFriend, I as suggestHandle, J as listVideos, K as kvGet, L as toCircleMembers, M as sealToKv, N as setPasscode, O as removeCircle, P as storeBackupCodes, Q as encryptBuffer, R as unlockWithBiometric, S as loadTotpSecret, T as registerBiometric, U as deleteVideo, V as unsealFromKv, W as getVideo, X as decryptBuffer, Y as putVideo, _ as isBlocked, a as blockLocal, at as asBytes, b as loadFriends, c as clearTotpSecret, d as destroyLocalVault, et as generateAesKey, f as disableBiometric, h as getSessionKeys, i as biometricAvailable, it as wrapVideoKeyForRecipient, j as saveIdentity, k as removeFriend, l as consumeBackupCode, m as getLockConfig, n as RedirectToSignIn, nt as sha256Hex, o as bootstrapVault, ot as b64ToBuf, p as generateBackupCodes, q as kvSet, r as UserButton, rt as unwrapVideoKey, s as clearPasscode, st as bufToB64, tt as importPublicKey, u as consumePendingInvite, v as isUnlocked, w as outgoingIds, x as loadIdentity, y as loadCircles, z as unlockWithPasscode } from "./graph-local-CzAMWcA8.mjs";
import { A as House, B as Ban, C as Play, D as LogOut, E as Mic, F as Copy, I as Cloud, L as ChevronDown, M as Download, N as Delete, O as Link2, P as CornerUpRight, R as Camera, S as Plus, T as NotebookPen, V as ArrowLeft, _ as Send, a as Users, b as RefreshCw, d as Smartphone, f as SkipForward, g as Share2, h as ShieldOff, i as Video, j as EyeOff, k as KeyRound, l as Trash2, m as Shield, n as VolumeX, o as User, p as SkipBack, r as Volume2, s as UserPlus, t as X, u as Square, v as Search, w as Pause, x as QrCode, y as ScanFace, z as BookUser } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as SKIP_OPTIONS, c as readPrefs, d as speedLabel, f as usePrefs, i as RELAY_OPTIONS, l as setPrefs, o as SPEED_OPTIONS, r as CLOUD_OPTIONS, s as THEME_OPTIONS, u as skipLabel } from "./router-BrCfh7Ot.mjs";
import { t as Input } from "./input-BMtP2vSO.mjs";
import { a as persistRecoveryPack, c as setEmergencyContact, d as otpauthUrl, f as randomTotpSecret, i as getRecoveryEmail, l as setRecoveryEmail, n as generatePhrase, o as recoveryFileBody, p as totpValid, r as getEmergencyContact, t as downloadText, u as wrapRecoveryPack } from "./recovery-C8lPkTmQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DzQTBKno.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY$1 = "circle-names";
async function rememberCircleName(id, name) {
	const map = await unsealFromKv(KEY$1) ?? {};
	map[id] = name;
	await sealToKv(KEY$1, map);
}
var MAGIC = [
	72,
	86,
	78,
	49
];
function isPurpose(value) {
	return value === "clip" || value === "receipt" || value === "reaction" || value === "recovery" || value === "circle-meta" || value === "intro" || value === "intro-ack" || value === "shred";
}
function parseMembers(raw) {
	if (!Array.isArray(raw)) return void 0;
	const out = [];
	for (const item of raw.slice(0, 50)) {
		if (!item || typeof item !== "object") continue;
		const rec = item;
		if (typeof rec.userId !== "string") continue;
		out.push({
			userId: rec.userId,
			handle: typeof rec.handle === "string" ? rec.handle : void 0,
			displayName: typeof rec.displayName === "string" ? rec.displayName : void 0,
			publicKey: typeof rec.publicKey === "string" ? rec.publicKey : void 0,
			role: rec.role === "owner" ? "owner" : "member",
			status: rec.status === "invited" ? "invited" : "member"
		});
	}
	return out.length ? out : void 0;
}
function parseHeader(raw) {
	if (!raw || typeof raw !== "object") return null;
	const rec = raw;
	if (!isPurpose(rec.purpose)) return null;
	const kind = typeof rec.kind === "string" && isMediaKind(rec.kind) ? rec.kind : void 0;
	const emoji = typeof rec.emoji === "string" && isReactionEmoji(rec.emoji) ? rec.emoji : void 0;
	const ttlMode = typeof rec.ttlMode === "string" && isTtlMode(rec.ttlMode) ? rec.ttlMode : void 0;
	return {
		v: 1,
		purpose: rec.purpose,
		kind,
		mimeType: typeof rec.mimeType === "string" ? rec.mimeType : void 0,
		durationMs: typeof rec.durationMs === "number" ? rec.durationMs : void 0,
		senderId: typeof rec.senderId === "string" ? rec.senderId : void 0,
		senderHandle: typeof rec.senderHandle === "string" ? rec.senderHandle : void 0,
		senderName: typeof rec.senderName === "string" ? rec.senderName : void 0,
		senderPublicKey: typeof rec.senderPublicKey === "string" ? rec.senderPublicKey : void 0,
		allowSave: rec.allowSave === true,
		groupId: typeof rec.groupId === "string" ? rec.groupId : rec.groupId === null ? null : void 0,
		captions: typeof rec.captions === "string" ? rec.captions : void 0,
		circleName: typeof rec.circleName === "string" ? rec.circleName : void 0,
		createdBy: typeof rec.createdBy === "string" ? rec.createdBy : void 0,
		disbanded: rec.disbanded === true,
		members: parseMembers(rec.members),
		clipId: typeof rec.clipId === "string" ? rec.clipId : void 0,
		at: typeof rec.at === "number" ? rec.at : void 0,
		emoji,
		ttlMode
	};
}
function packPacket(header, media) {
	const headerBytes = new TextEncoder().encode(JSON.stringify(header));
	const body = asBytes(media);
	const out = new Uint8Array(8 + headerBytes.length + body.length);
	out[0] = MAGIC[0];
	out[1] = MAGIC[1];
	out[2] = MAGIC[2];
	out[3] = MAGIC[3];
	new DataView(out.buffer, out.byteOffset, out.byteLength).setUint32(4, headerBytes.length);
	out.set(headerBytes, 8);
	out.set(body, 8 + headerBytes.length);
	return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
}
function unpackPacket(buffer) {
	const bytes = asBytes(buffer);
	if (bytes.length < 8 || bytes[0] !== MAGIC[0] || bytes[1] !== MAGIC[1] || bytes[2] !== MAGIC[2] || bytes[3] !== MAGIC[3]) return {
		header: null,
		media: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
	};
	const headerLen = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4);
	if (headerLen < 2 || 8 + headerLen > bytes.length) return {
		header: null,
		media: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
	};
	try {
		const json = new TextDecoder().decode(bytes.subarray(8, 8 + headerLen));
		const header = parseHeader(JSON.parse(json));
		const media = bytes.subarray(8 + headerLen);
		return {
			header,
			media: media.buffer.slice(media.byteOffset, media.byteOffset + media.byteLength)
		};
	} catch {
		return {
			header: null,
			media: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
		};
	}
}
function normalizeReactions(row) {
	if (row.reactions && typeof row.reactions === "object" && !Array.isArray(row.reactions)) {
		const out = {};
		for (const [key, value] of Object.entries(row.reactions)) if (typeof value === "number" && value > 0) out[key] = value;
		if (Object.keys(out).length) return out;
	}
	const hearts = typeof row.hearts === "number" && row.hearts > 0 ? row.hearts : 0;
	return hearts ? { "❤️": hearts } : {};
}
function normalize(row) {
	const kind = isMediaKind(row.kind) ? row.kind : "video";
	const ttlMode = isTtlMode(row.ttlMode) ? row.ttlMode : "1d";
	const reactions = normalizeReactions(row);
	return {
		...row,
		kind,
		ttlMode,
		mimeType: row.mimeType || (kind === "audio" ? "audio/webm" : "video/webm"),
		groupId: row.groupId ?? null,
		theyViewedAt: row.theyViewedAt ?? null,
		allowSave: row.allowSave === true,
		captions: typeof row.captions === "string" ? row.captions : "",
		reactions,
		hearts: reactions["❤️"] ?? 0,
		expiresAt: row.ttlMode === "forever" ? null : row.expiresAt
	};
}
function clipHeader(opts) {
	return {
		v: 1,
		purpose: "clip",
		clipId: opts.clipId,
		kind: opts.kind,
		mimeType: opts.mimeType,
		durationMs: opts.durationMs,
		senderId: opts.senderId,
		senderHandle: opts.senderHandle,
		senderName: opts.senderName,
		allowSave: opts.allowSave === true,
		groupId: opts.groupId ?? null,
		captions: opts.captions ?? "",
		ttlMode: opts.ttlMode
	};
}
async function encryptAndStoreVideo(opts) {
	const { vaultKey } = getSessionKeys();
	const kind = opts.kind === "audio" ? "audio" : "video";
	const mimeType = opts.mimeType || opts.blob.type || (kind === "audio" ? "audio/webm" : "video/webm");
	const packed = packPacket(clipHeader({
		clipId: opts.id,
		senderId: opts.senderId,
		kind,
		mimeType,
		durationMs: opts.durationMs,
		ttlMode: opts.ttlMode,
		groupId: opts.groupId,
		allowSave: opts.allowSave,
		captions: opts.captions,
		senderHandle: opts.senderHandle,
		senderName: opts.senderName
	}), await opts.blob.arrayBuffer());
	const videoKey = await generateAesKey();
	const sealed = await encryptBuffer(videoKey, packed);
	const rawVideoKey = await crypto.subtle.exportKey("raw", videoKey);
	const wrappedKey = await encryptBuffer(vaultKey, rawVideoKey);
	let posterIv = null;
	let posterCipher = null;
	if (opts.poster) {
		const sealedPoster = await encryptBuffer(videoKey, await opts.poster.arrayBuffer());
		posterIv = sealedPoster.iv;
		posterCipher = sealedPoster.ciphertext;
	}
	const stored = {
		id: opts.id,
		peerId: opts.peerId,
		senderId: opts.senderId,
		recipientId: opts.recipientId,
		createdAt: Date.now(),
		ttlMode: opts.ttlMode,
		expiresAt: null,
		viewedAt: null,
		iv: sealed.iv,
		ciphertext: sealed.ciphertext,
		posterIv,
		posterCipher,
		durationMs: opts.durationMs,
		outgoing: opts.outgoing,
		kind,
		mimeType,
		groupId: opts.groupId ?? null,
		theyViewedAt: null,
		allowSave: opts.allowSave === true,
		captions: opts.captions ?? "",
		hearts: 0,
		reactions: {}
	};
	await putVideo({
		...stored,
		wrappedKey: {
			iv: wrappedKey.iv,
			ciphertext: wrappedKey.ciphertext
		}
	});
	return stored;
}
async function videoKeyFor(row) {
	const { vaultKey } = getSessionKeys();
	const raw = await decryptBuffer(vaultKey, row.wrappedKey.iv, row.wrappedKey.ciphertext);
	return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}
async function decryptVideo(id) {
	const raw = await getVideo(id);
	if (!raw) throw new Error("Clip not found");
	const row = normalize(raw);
	const key = await videoKeyFor(row);
	const unpacked = unpackPacket(await decryptBuffer(key, row.iv, row.ciphertext));
	const mime = unpacked.header?.mimeType || row.mimeType;
	return new Blob([unpacked.media], { type: mime });
}
async function decryptPoster(id) {
	const row = await getVideo(id);
	if (!row?.posterIv || !row?.posterCipher) return null;
	const key = await videoKeyFor(row);
	const plain = await decryptBuffer(key, row.posterIv, row.posterCipher);
	return new Blob([plain], { type: "image/jpeg" });
}
function startLifetime(row, at) {
	if (row.ttlMode === "forever" || row.ttlMode === "view") {
		row.expiresAt = null;
		return;
	}
	row.expiresAt = expiresAtFrom(row.ttlMode, at);
}
async function markViewed(id) {
	const row = await getVideo(id);
	if (!row) return null;
	row.viewedAt = Date.now();
	if (row.ttlMode === "view") {
		await deleteVideo(id);
		return null;
	}
	startLifetime(row, row.viewedAt);
	await putVideo(row);
	return normalize(row);
}
async function destroyVideo(id) {
	await deleteVideo(id);
}
async function sweepExpired() {
	const all = await listVideos();
	const now = Date.now();
	const gone = [];
	for (const raw of all) {
		const row = normalize(raw);
		if (row.ttlMode === "forever" || row.ttlMode === "view") continue;
		const start = row.outgoing ? row.theyViewedAt : row.viewedAt;
		if (!start) continue;
		const exp = expiresAtFrom(row.ttlMode, start);
		if (exp && exp <= now) {
			gone.push(row);
			await deleteVideo(row.id);
		}
	}
	return gone;
}
async function videosForPeer(peerId) {
	return (await listVideos()).filter((row) => row.peerId === peerId).map(normalize).filter((row) => isPlayable(row.kind)).sort((a, b) => a.createdAt - b.createdAt);
}
async function allVideos() {
	return (await listVideos()).map(normalize).filter((row) => isPlayable(row.kind));
}
async function exportVaultRows() {
	return listVideos();
}
async function importVaultRow(row) {
	await putVideo(normalize(row));
}
async function sealClip(opts) {
	const videoKey = await generateAesKey();
	const raw = await opts.blob.arrayBuffer();
	const packed = opts.header ? packPacket(opts.header, raw) : raw;
	const sealed = await encryptBuffer(videoKey, packed);
	let poster = null;
	if (opts.poster) {
		const sealedPoster = await encryptBuffer(videoKey, await opts.poster.arrayBuffer());
		poster = JSON.stringify({
			iv: bufToB64(sealedPoster.iv),
			ciphertext: bufToB64(sealedPoster.ciphertext)
		});
	}
	return {
		videoKey,
		iv: bufToB64(sealed.iv),
		ciphertext: bufToB64(sealed.ciphertext),
		poster,
		wrapFor: async (publicKeyB64) => {
			const recipient = await importPublicKey(publicKeyB64);
			return wrapVideoKeyForRecipient(videoKey, recipient);
		}
	};
}
async function sealJsonMessage(payload, recipientPublicKey, senderId) {
	const header = {
		v: 1,
		purpose: payload.purpose === "reaction" || payload.purpose === "shred" || payload.purpose === "receipt" ? payload.purpose : "receipt",
		senderId,
		clipId: payload.clipId,
		at: payload.at,
		emoji: payload.emoji,
		ttlMode: payload.ttlMode
	};
	const sealed = await sealClip({
		blob: new Blob([]),
		poster: null,
		header
	});
	return {
		wrappedKey: await sealed.wrapFor(recipientPublicKey),
		iv: sealed.iv,
		ciphertext: sealed.ciphertext
	};
}
async function markTheyViewed(clipId, at = Date.now()) {
	const row = await getVideo(clipId);
	if (!row) return;
	row.theyViewedAt = at;
	if (row.ttlMode === "view") {
		await deleteVideo(clipId);
		return;
	}
	startLifetime(row, at);
	await putVideo(row);
}
async function addReaction(clipId, emoji = "❤️") {
	const row = await getVideo(clipId);
	if (!row) return;
	const reactions = normalizeReactions(row);
	reactions[emoji] = (reactions[emoji] ?? 0) + 1;
	row.reactions = reactions;
	row.hearts = reactions["❤️"] ?? 0;
	await putVideo(row);
}
async function ingestIncomingEnvelope(opts) {
	const { privateKey, vaultKey } = getSessionKeys();
	const videoKey = await unwrapVideoKey(opts.wrappedKey, privateKey);
	const plain = await decryptBuffer(videoKey, b64ToBuf(opts.iv), b64ToBuf(opts.ciphertext));
	let header = unpackPacket(plain).header;
	if (!header) try {
		const msg = JSON.parse(new TextDecoder().decode(plain));
		if (msg.clipId) header = {
			v: 1,
			purpose: msg.purpose === "reaction" ? "reaction" : msg.purpose === "shred" ? "shred" : "receipt",
			clipId: msg.clipId,
			at: msg.at,
			emoji: msg.emoji
		};
	} catch {}
	const purpose = header?.purpose ?? "clip";
	const senderId = header?.senderId || opts.senderId;
	if (senderId && await isBlocked(senderId)) return null;
	if (purpose === "receipt") {
		if (header?.clipId) await markTheyViewed(header.clipId, header.at ?? Date.now());
		return null;
	}
	if (purpose === "reaction") {
		if (header?.clipId) await addReaction(header.clipId, header.emoji || "❤️");
		return null;
	}
	if (purpose === "shred") {
		if (header?.clipId) await destroyVideo(header.clipId);
		return null;
	}
	if (purpose === "intro" || purpose === "intro-ack") {
		if (senderId) await upsertFriend({
			userId: senderId,
			handle: header?.senderHandle || "friend",
			displayName: header?.senderName || header?.senderHandle || "Friend",
			publicKey: header?.senderPublicKey ?? null,
			status: purpose === "intro-ack" ? "accepted" : "pending-in",
			friendshipId: crypto.randomUUID()
		});
		return null;
	}
	if (purpose === "circle-meta") {
		if (header?.disbanded && header.groupId) {
			await removeCircle(header.groupId);
			return null;
		}
		if (header?.groupId && header.circleName) {
			await rememberCircleName(header.groupId, header.circleName);
			await saveCircle({
				id: header.groupId,
				name: header.circleName,
				createdBy: header.createdBy || senderId || "",
				members: toCircleMembers(header.members ?? []),
				pending: (header.createdBy || senderId) !== opts.recipientId
			});
		}
		return null;
	}
	if (purpose === "recovery") return null;
	const rawVideoKey = await crypto.subtle.exportKey("raw", videoKey);
	const wrappedLocal = await encryptBuffer(vaultKey, rawVideoKey);
	let posterIv = null;
	let posterCipher = null;
	if (opts.poster) try {
		const parsed = JSON.parse(opts.poster);
		posterIv = b64ToBuf(parsed.iv);
		posterCipher = b64ToBuf(parsed.ciphertext);
	} catch {
		posterIv = null;
		posterCipher = null;
	}
	const kind = header?.kind && isMediaKind(header.kind) ? header.kind : "video";
	const from = senderId || "unknown";
	const groupId = header?.groupId ?? null;
	const ttlMode = header?.ttlMode && isTtlMode(header.ttlMode) ? header.ttlMode : opts.ttlMode;
	const id = header?.clipId || opts.id;
	if (await getVideo(id)) return null;
	const stored = {
		id,
		peerId: groupId ? groupPeerId(groupId) : from,
		senderId: from,
		recipientId: opts.recipientId,
		createdAt: opts.createdAt,
		ttlMode,
		expiresAt: null,
		viewedAt: null,
		theyViewedAt: null,
		iv: b64ToBuf(opts.iv),
		ciphertext: b64ToBuf(opts.ciphertext),
		posterIv,
		posterCipher,
		durationMs: header?.durationMs ?? 0,
		outgoing: false,
		kind,
		mimeType: header?.mimeType || (kind === "audio" ? "audio/webm" : "video/webm"),
		groupId,
		allowSave: header?.allowSave === true,
		captions: header?.captions ?? "",
		hearts: 0,
		reactions: {},
		wrappedKey: wrappedLocal
	};
	await putVideo(stored);
	return stored;
}
/**
* Sealed mailbox adapter.
* Ciphertext only. Haven cannot open envelopes. No plaintext logs.
*/
async function relayPublish(seal) {
	const { groupId: _groupId, ...mailbox } = seal;
	const result = await publishEnvelope({ data: mailbox });
	try {
		await rememberOutgoing(result.id);
	} catch {}
	return result;
}
async function relayPickup(id) {
	const retain = readPrefs().relayMode === "until-expiry";
	return pickupEnvelope({ data: {
		id,
		retain
	} });
}
async function relayShredMine() {
	let ids = [];
	try {
		ids = await outgoingIds();
	} catch {
		ids = [];
	}
	return shredMyEnvelopes({ data: { ids } });
}
var KEY = "haven-outbox";
function onWifi() {
	if (typeof navigator === "undefined") return true;
	const conn = navigator.connection;
	if (!conn) return true;
	if (conn.type === "cellular") return false;
	if (conn.saveData) return false;
	return true;
}
async function readOutbox() {
	return await kvGet(KEY) ?? [];
}
async function queueSeal(seal) {
	const rows = await readOutbox();
	rows.push({
		...seal,
		queuedAt: Date.now(),
		localId: crypto.randomUUID()
	});
	await kvSet(KEY, rows);
}
async function replaceOutbox(rows) {
	await kvSet(KEY, rows);
}
async function canSendNow(wifiOnly) {
	if (typeof navigator !== "undefined" && !navigator.onLine) return {
		ok: false,
		reason: "offline"
	};
	if (wifiOnly && !onWifi()) return {
		ok: false,
		reason: "wifi"
	};
	return { ok: true };
}
async function flushOutbox() {
	if (!(await canSendNow(readPrefs().wifiOnly)).ok) return 0;
	const rows = await readOutbox();
	if (!rows.length) return 0;
	const left = [];
	let sent = 0;
	for (const row of rows) try {
		const { queuedAt: _q, localId: _id, ...seal } = row;
		await relayPublish(seal);
		sent += 1;
	} catch {
		left.push(row);
	}
	await replaceOutbox(left);
	return sent;
}
var CONTACTS_KEY = "phone-contacts";
function contactsApi() {
	if (typeof navigator === "undefined") return null;
	const api = navigator.contacts;
	if (!api || typeof api.select !== "function") return null;
	return api;
}
function contactsPickerAvailable() {
	return contactsApi() != null;
}
async function hashContactPhone(phone) {
	return sha256Hex(`${PHONE_HASH_PEPPER}:${phone}`);
}
async function hashContactEmail(email) {
	return sha256Hex(`${PHONE_HASH_PEPPER}:${email.trim().toLowerCase()}`);
}
async function hashHandle(handle) {
	const compact = handle.trim().toLowerCase().replace(/^@/, "");
	return sha256Hex(`${PHONE_HASH_PEPPER}:handle:${compact}`);
}
async function loadContacts() {
	return await unsealFromKv(CONTACTS_KEY) ?? [];
}
async function persist(contacts) {
	await sealToKv(CONTACTS_KEY, contacts);
}
function mergeContact(existing, incoming) {
	const phoneSet = new Set(incoming.phones);
	const emailSet = new Set(incoming.emails.map((e) => e.toLowerCase()));
	const idx = existing.findIndex((row) => {
		if (row.phones.some((p) => phoneSet.has(p))) return true;
		if (row.emails.some((e) => emailSet.has(e.toLowerCase()))) return true;
		return false;
	});
	if (idx < 0) return [...existing, incoming];
	const prev = existing[idx];
	const next = {
		...prev,
		name: incoming.name || prev.name,
		phones: [.../* @__PURE__ */ new Set([...prev.phones, ...incoming.phones])],
		emails: [.../* @__PURE__ */ new Set([...prev.emails, ...incoming.emails])]
	};
	const copy = existing.slice();
	copy[idx] = next;
	return copy;
}
async function upsertContact(input) {
	const phones = (input.phones ?? []).map((p) => normalizePhone(p)).filter((p) => Boolean(p));
	const emails = (input.emails ?? []).map((e) => e.trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
	if (!phones.length && !emails.length) throw new Error("Add a phone number or email");
	const merged = mergeContact(await loadContacts(), {
		id: crypto.randomUUID(),
		name: input.name.trim() || phones[0] || emails[0] || "Contact",
		phones,
		emails,
		addedAt: Date.now()
	});
	merged.sort((a, b) => a.name.localeCompare(b.name));
	await persist(merged);
	return merged;
}
async function removeContact(id) {
	const next = (await loadContacts()).filter((row) => row.id !== id);
	await persist(next);
	return next;
}
async function pickDeviceContacts() {
	const api = contactsApi();
	if (!api) throw new Error("This phone cannot share its address book with the browser");
	const rows = await api.select([
		"name",
		"tel",
		"email"
	], { multiple: true });
	let all = await loadContacts();
	for (const row of rows) {
		const name = (row.name ?? []).filter(Boolean).join(" ").trim();
		const phones = (row.tel ?? []).map((t) => normalizePhone(t)).filter((t) => Boolean(t));
		const emails = (row.email ?? []).map((e) => e.trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
		if (!name && !phones.length && !emails.length) continue;
		all = mergeContact(all, {
			id: crypto.randomUUID(),
			name: name || phones[0] || emails[0] || "Contact",
			phones,
			emails,
			addedAt: Date.now()
		});
	}
	all.sort((a, b) => a.name.localeCompare(b.name));
	await persist(all);
	return all;
}
function contactSubtitle(contact) {
	if (contact.phones[0]) return `Mobile · ${last4(contact.phones[0])}`;
	if (contact.emails[0]) return contact.emails[0];
	return "Saved on this phone";
}
var FOLDER_KEY = "cloud-folder-handle";
var BACKUP_NAME = "haven-vault.haven";
function folderPickerAvailable() {
	return typeof window !== "undefined" && "showDirectoryPicker" in window;
}
async function getSyncedFolder() {
	return await kvGet(FOLDER_KEY) ?? null;
}
async function clearSyncedFolder() {
	await kvDel(FOLDER_KEY);
}
async function pickSyncedFolder() {
	const picker = window.showDirectoryPicker;
	if (!picker) throw new Error("This browser cannot open a folder. Use a backup file instead.");
	const handle = await picker({
		id: "haven-sync",
		mode: "readwrite"
	});
	await kvSet(FOLDER_KEY, handle);
	await writeBackupToFolder(handle);
	return handle;
}
function serializeRow(row) {
	const out = { ...row };
	for (const key of Object.keys(out)) {
		const value = out[key];
		if (value instanceof ArrayBuffer) out[key] = {
			t: "ab",
			v: bufToB64(value)
		};
		else if (value && typeof value === "object" && !Array.isArray(value)) {
			const nested = value;
			const next = {};
			for (const [k, v] of Object.entries(nested)) next[k] = v instanceof ArrayBuffer ? {
				t: "ab",
				v: bufToB64(v)
			} : v;
			out[key] = next;
		}
	}
	return out;
}
function revive(value) {
	if (!value || typeof value !== "object") return value;
	const rec = value;
	if (rec.t === "ab" && typeof rec.v === "string") return b64ToBuf(rec.v);
	const next = {};
	for (const [k, v] of Object.entries(rec)) next[k] = revive(v);
	return next;
}
async function buildBackupBlob() {
	const { vaultKey } = getSessionKeys();
	const rows = await exportVaultRows();
	const payload = JSON.stringify({
		v: 1,
		exportedAt: Date.now(),
		videos: rows.map((row) => serializeRow(row))
	});
	const sealed = await encryptBuffer(vaultKey, new TextEncoder().encode(payload));
	const pack = JSON.stringify({
		iv: bufToB64(sealed.iv),
		ciphertext: bufToB64(sealed.ciphertext)
	});
	return new Blob([pack], { type: "application/octet-stream" });
}
async function restoreBackupBlob(blob) {
	const { vaultKey } = getSessionKeys();
	const pack = JSON.parse(await blob.text());
	if (!pack.iv || !pack.ciphertext) throw new Error("Not a Haven backup");
	const plain = await decryptBuffer(vaultKey, b64ToBuf(pack.iv), b64ToBuf(pack.ciphertext));
	const parsed = JSON.parse(new TextDecoder().decode(plain));
	let n = 0;
	for (const raw of parsed.videos ?? []) {
		const row = revive(raw);
		if (row?.id) {
			await importVaultRow(row);
			n += 1;
		}
	}
	return n;
}
async function downloadBackupFile() {
	const blob = await buildBackupBlob();
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = BACKUP_NAME;
	a.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
async function writeBackupToFolder(handle) {
	const dir = handle ?? await getSyncedFolder();
	if (!dir) throw new Error("No synced folder yet");
	const perm = await dir.requestPermission?.({ mode: "readwrite" });
	if (perm && perm !== "granted") throw new Error("Folder access was denied");
	const blob = await buildBackupBlob();
	const writable = await (await dir.getFileHandle(BACKUP_NAME, { create: true })).createWritable();
	await writable.write(blob);
	await writable.close();
}
async function restoreFromFolder() {
	const dir = await getSyncedFolder();
	if (!dir) throw new Error("No synced folder yet");
	return restoreBackupBlob(await (await (await dir.getFileHandle(BACKUP_NAME)).getFile()).slice());
}
async function ensureNotifyPermission() {
	if (typeof Notification === "undefined") return false;
	if (Notification.permission === "granted") return true;
	if (Notification.permission === "denied") return false;
	return await Notification.requestPermission() === "granted";
}
async function registerHavenWorker() {
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
	try {
		await navigator.serviceWorker.register("/haven-sw.js");
	} catch {}
}
function inQuietHours(prefs = readPrefs()) {
	if (!prefs.quietHours) return false;
	const now = /* @__PURE__ */ new Date();
	const cur = now.getHours() * 60 + now.getMinutes();
	const [sh, sm] = prefs.quietStart.split(":").map(Number);
	const [eh, em] = prefs.quietEnd.split(":").map(Number);
	const start = (sh ?? 22) * 60 + (sm ?? 0);
	const end = (eh ?? 7) * 60 + (em ?? 0);
	if (start === end) return false;
	if (start < end) return cur >= start && cur < end;
	return cur >= start || cur < end;
}
async function notifyNewClip(label = "New clip in Haven") {
	const prefs = readPrefs();
	if (!prefs.notifications) return;
	if (inQuietHours(prefs)) return;
	if (typeof Notification === "undefined") return;
	if (Notification.permission !== "granted") return;
	try {
		const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
		const body = "Someone sent you a sealed clip.";
		if (reg?.showNotification) await reg.showNotification(label, {
			body,
			icon: "/icon-192.png",
			tag: "haven-inbox",
			silent: false
		});
		else new Notification(label, {
			body,
			tag: "haven-inbox"
		});
	} catch {}
}
async function sendSealedHeader(opts) {
	const ttlMode = opts.ttlMode ?? "6m";
	const sealed = await sealClip({
		blob: new Blob([]),
		poster: null,
		header: opts.header
	});
	const exp = expiresAtFrom(ttlMode);
	await relayPublish({
		recipientId: opts.recipientId,
		ttlMode,
		expiresAt: exp ? new Date(exp).toISOString() : null,
		wrappedKey: await sealed.wrapFor(opts.recipientPublicKey),
		iv: sealed.iv,
		ciphertext: sealed.ciphertext,
		poster: null
	});
}
function keyFor$1(userId, friends, circles) {
	const friend = friends.find((f) => f.userId === userId);
	if (friend?.publicKey) return friend.publicKey;
	for (const circle of circles) {
		const member = circle.members.find((m) => m.userId === userId);
		if (member?.publicKey) return member.publicKey;
	}
	return null;
}
/** Dual-delete: tell the other party this clip is gone. 1:1 only — groups expire per device. */
async function shredPeerCopies(clips, myId) {
	if (!clips.length) return;
	const [friends, circles] = await Promise.all([loadFriends(), loadCircles()]);
	for (const clip of clips) {
		if (clip.groupId || isGroupPeer(clip.peerId) || clip.peerId === "self") continue;
		const otherId = clip.outgoing ? clip.recipientId : clip.senderId;
		if (!otherId || otherId === myId) continue;
		const pub = keyFor$1(otherId, friends, circles);
		if (!pub) continue;
		try {
			await sendSealedHeader({
				recipientId: otherId,
				recipientPublicKey: pub,
				header: {
					v: 1,
					purpose: "shred",
					clipId: clip.id,
					senderId: myId
				},
				ttlMode: "1d"
			});
		} catch {}
	}
}
async function ensureLocalIdentity(fallbackName) {
	let ident = await loadIdentity();
	if (!ident.handle) {
		ident = {
			handle: suggestHandle(fallbackName || "haven"),
			displayName: ident.displayName || fallbackName || "You"
		};
		await saveIdentity(ident);
	} else if (!ident.displayName) {
		ident = {
			...ident,
			displayName: fallbackName || "You"
		};
		await saveIdentity(ident);
	}
	await ensureProfile({ data: { handleHash: await hashHandle(ident.handle) } });
	return ident;
}
function useHavenSession() {
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const [lock, setLock] = (0, import_react.useState)(null);
	const [unlocked, setUnlocked] = (0, import_react.useState)(false);
	const [vaultError, setVaultError] = (0, import_react.useState)(null);
	const [lockKnown, setLockKnown] = (0, import_react.useState)(false);
	const [videos, setVideos] = (0, import_react.useState)([]);
	const [friends, setFriends] = (0, import_react.useState)([]);
	const [circles, setCircles] = (0, import_react.useState)([]);
	const [identity, setIdentity] = (0, import_react.useState)({
		handle: "",
		displayName: ""
	});
	const refreshLock = (0, import_react.useCallback)(async () => {
		try {
			const cfg = await getLockConfig();
			setLock(cfg);
			setUnlocked(isUnlocked());
		} finally {
			setLockKnown(true);
		}
	}, []);
	const refreshVideos = (0, import_react.useCallback)(async () => {
		if (!isUnlocked()) {
			setVideos([]);
			return;
		}
		const gone = await sweepExpired();
		if (gone.length && user?.id) shredPeerCopies(gone, user.id);
		setVideos(await allVideos());
		if (readPrefs().cloudTarget !== "device") writeBackupToFolder().catch(() => void 0);
	}, [user?.id]);
	const refreshGraph = (0, import_react.useCallback)(async () => {
		if (!isUnlocked()) {
			setFriends([]);
			setCircles([]);
			return;
		}
		await consumePendingInvite();
		const [nextFriends, nextCircles, ident] = await Promise.all([
			loadFriends(),
			loadCircles(),
			loadIdentity()
		]);
		setFriends(nextFriends);
		setCircles(nextCircles);
		if (ident.handle) setIdentity(ident);
	}, []);
	(0, import_react.useEffect)(() => {
		refreshLock();
	}, [refreshLock]);
	const profileQuery = useQuery({
		queryKey: [
			"haven",
			"profile",
			user?.id
		],
		enabled: !!user && !isPending,
		queryFn: async () => {
			const publicKey = isUnlocked() ? (await import("./graph-local-CzAMWcA8.mjs").then((n) => n.g).then((n) => n.P)).getSessionKeys().publicKey : void 0;
			return await ensureProfile({ data: {
				publicKey,
				setupComplete: true
			} });
		}
	});
	(0, import_react.useEffect)(() => {
		const p = profileQuery.data;
		if (!p) return;
		setPrefs({
			allowSave: p.allowSave,
			sendReceipts: p.sendReceipts,
			discovery: p.discovery
		});
	}, [profileQuery.data]);
	const inboxQuery = useQuery({
		queryKey: [
			"haven",
			"inbox",
			user?.id
		],
		enabled: !!user && !isPending && unlocked,
		queryFn: () => listInbox(),
		refetchInterval: 8e3
	});
	(0, import_react.useEffect)(() => {
		if (!unlocked || !inboxQuery.data?.length || !user) return;
		let cancelled = false;
		(async () => {
			let newClips = 0;
			for (const item of inboxQuery.data) try {
				const payload = await relayPickup(item.id);
				if (!payload || cancelled) continue;
				const stored = await ingestIncomingEnvelope({
					id: payload.id,
					senderId: payload.senderId,
					recipientId: user.id,
					wrappedKey: payload.wrappedKey,
					iv: payload.iv,
					ciphertext: payload.ciphertext,
					poster: payload.poster,
					ttlMode: payload.ttlMode,
					createdAt: Date.parse(payload.createdAt) || Date.now()
				});
				if (stored && isPlayable(stored.kind)) newClips += 1;
			} catch {}
			if (!cancelled) {
				await refreshVideos();
				await refreshGraph();
				await qc.invalidateQueries({ queryKey: ["haven", "inbox"] });
				if (newClips && typeof document !== "undefined" && document.hidden) notifyNewClip(newClips === 1 ? "New clip in Haven" : `${newClips} new clips in Haven`);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		inboxQuery.data,
		unlocked,
		user,
		refreshVideos,
		refreshGraph,
		qc
	]);
	(0, import_react.useEffect)(() => {
		if (!unlocked) return;
		refreshVideos();
		refreshGraph();
	}, [
		unlocked,
		refreshVideos,
		refreshGraph
	]);
	(0, import_react.useEffect)(() => {
		if (!unlocked) return;
		if (readPrefs().notifications) registerHavenWorker();
		flushOutbox();
		const onOnline = () => void flushOutbox();
		window.addEventListener("online", onOnline);
		return () => window.removeEventListener("online", onOnline);
	}, [unlocked]);
	(0, import_react.useEffect)(() => {
		let timer;
		const onVis = () => {
			if (!(lock?.hasPasscode || lock?.hasBiometric)) return;
			if (document.visibilityState === "hidden") timer = window.setTimeout(() => {
				lockSession();
				setUnlocked(false);
			}, 15e3);
			else if (timer) window.clearTimeout(timer);
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			document.removeEventListener("visibilitychange", onVis);
			if (timer) window.clearTimeout(timer);
		};
	}, [lock]);
	const openVault = (0, import_react.useCallback)(async () => {
		setVaultError(null);
		try {
			const publicKey = await bootstrapVault();
			setUnlocked(true);
			const ident = await ensureLocalIdentity("You");
			setIdentity(ident);
			await ensureProfile({ data: {
				publicKey,
				handleHash: await hashHandle(ident.handle)
			} });
			await qc.invalidateQueries({ queryKey: ["haven", "profile"] });
			await refreshVideos();
			await refreshGraph();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not open vault";
			if (message === "LOCKED") {
				setUnlocked(false);
				return;
			}
			setVaultError(message);
		}
	}, [
		profileQuery.data,
		qc,
		refreshVideos,
		refreshGraph,
		user
	]);
	(0, import_react.useEffect)(() => {
		if (!user || isPending) return;
		if (lock?.hasPasscode || lock?.hasBiometric) return;
		openVault();
	}, [
		user,
		isPending,
		lock,
		openVault
	]);
	const latest = (0, import_react.useMemo)(() => {
		const map = {};
		for (const row of videos) {
			const prev = map[row.peerId];
			if (!prev || row.createdAt > prev.createdAt) map[row.peerId] = row;
		}
		return map;
	}, [videos]);
	const profile = (0, import_react.useMemo)(() => {
		const p = profileQuery.data;
		if (!p) return void 0;
		return {
			...p,
			handle: identity.handle || p.handle || "you",
			displayName: identity.displayName || p.displayName || "You"
		};
	}, [profileQuery.data, identity]);
	const needsLock = Boolean(lock?.hasPasscode || lock?.hasBiometric) && !unlocked;
	return {
		user,
		isPending,
		profile,
		profileLoading: profileQuery.isPending,
		friends,
		friendsLoading: false,
		circles,
		inbox: inboxQuery.data ?? [],
		lock,
		lockKnown,
		needsLock,
		unlocked,
		vaultError,
		videos,
		latest,
		latestByPeer: latest,
		refreshLock,
		refreshVideos,
		openVault,
		setUnlocked,
		invalidate: () => {
			qc.invalidateQueries({ queryKey: ["haven"] });
			refreshGraph();
		}
	};
}
function VideoOrb({ name, subtitle, video, unread, self, group, onClick }) {
	const [src, setSrc] = (0, import_react.useState)(null);
	const [poster, setPoster] = (0, import_react.useState)(null);
	const isAudio = video?.kind === "audio";
	(0, import_react.useEffect)(() => {
		let url = null;
		let posterUrl = null;
		let cancelled = false;
		if (!video || isAudio) {
			setSrc(null);
			setPoster(null);
			return;
		}
		(async () => {
			try {
				const [clip, still] = await Promise.all([decryptVideo(video.id).catch(() => null), decryptPoster(video.id)]);
				if (cancelled) return;
				if (still) {
					posterUrl = URL.createObjectURL(still);
					setPoster(posterUrl);
				}
				if (clip) {
					url = URL.createObjectURL(clip);
					setSrc(url);
				}
			} catch {
				if (!cancelled) setSrc(null);
			}
		})();
		return () => {
			cancelled = true;
			if (url) URL.revokeObjectURL(url);
			if (posterUrl) URL.revokeObjectURL(posterUrl);
		};
	}, [video?.id, isAudio]);
	const initial = name.slice(0, 1).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "group flex flex-col items-center gap-2.5 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "relative size-36 sm:size-40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("absolute inset-0 overflow-hidden rounded-full orb-ring bg-ink-2", "transition-transform duration-200 group-active:scale-[0.96]"),
					children: src && !isAudio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						src,
						poster: poster ?? void 0,
						className: "size-full object-cover",
						muted: true,
						playsInline: true,
						loop: true,
						autoPlay: true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-full items-center justify-center spec text-3xl font-medium text-mist",
						children: self ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-10 text-fog/80" }) : isAudio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-10 text-fog/80" }) : group ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-10 text-fog/80" }) : initial
					})
				}), unread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute right-1 top-2 grid min-w-6 place-items-center rounded-full bg-fog px-1.5 py-0.5 text-[11px] font-semibold text-accent-fg tabular-nums",
					children: unread
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium text-fog",
				children: name
			}),
			subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-mute",
				children: subtitle
			}) : null
		]
	});
}
function HomeScreen({ meName, friends, circles, latest, videos, myId: _myId, onOpen, onRecordSelf }) {
	const accepted = friends.filter((f) => f.status === "accepted");
	const unreadFor = (peerId) => videos.filter((v) => v.peerId === peerId && !v.outgoing && !v.viewedAt).length;
	const waiting = (() => {
		const byPeer = /* @__PURE__ */ new Map();
		for (const v of videos) {
			if (v.outgoing || v.viewedAt) continue;
			const list = byPeer.get(v.peerId) ?? [];
			list.push(v);
			byPeer.set(v.peerId, list);
		}
		return [...byPeer.entries()].sort((a, b) => Math.max(...b[1].map((c) => c.createdAt)) - Math.max(...a[1].map((c) => c.createdAt)));
	})();
	function nameFor(peerId) {
		if (peerId === "self") return "You";
		const circle = circles.find((c) => groupPeerId(c.id) === peerId);
		if (circle) return circle.name;
		return friends.find((f) => f.userId === peerId)?.displayName ?? "Someone";
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-28 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "mb-6 flex items-end justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl italic leading-none text-fog",
					children: "Haven"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-mute",
					children: [meName, " · encrypted on this device"]
				})] })
			}),
			waiting.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs uppercase tracking-[0.16em] text-mute",
					children: "New"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-3 overflow-x-auto pb-1",
					children: waiting.map(([peerId, clips]) => {
						const name = nameFor(peerId);
						const hasAudio = clips.some((c) => c.kind === "audio");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onOpen(peerId),
							className: "glass flex min-w-40 shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 shrink-0 place-items-center rounded-full bg-fog text-sm font-medium text-accent-fg",
								children: name.slice(0, 1).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-medium",
									children: name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 text-xs text-mute",
									children: [
										hasAudio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3" }) : null,
										clips.length,
										" new"
									]
								})]
							})]
						}, peerId);
					})
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-x-4 gap-y-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOrb, {
						name: "You",
						subtitle: latest["self"] ? "Your latest" : "Tap to record",
						video: latest[SELF_PEER],
						self: !latest[SELF_PEER],
						unread: unreadFor(SELF_PEER),
						onClick: () => latest["self"] ? onOpen(SELF_PEER) : onRecordSelf()
					}),
					circles.filter((c) => !c.pending).map((c) => {
						const peer = groupPeerId(c.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOrb, {
							name: c.name,
							subtitle: `${c.members.length} people`,
							video: latest[peer],
							unread: unreadFor(peer),
							group: true,
							onClick: () => onOpen(peer)
						}, c.id);
					}),
					accepted.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOrb, {
						name: f.displayName,
						subtitle: `@${f.handle}`,
						video: latest[f.userId],
						unread: unreadFor(f.userId),
						onClick: () => onOpen(f.userId)
					}, f.userId))
				]
			}),
			accepted.length === 0 && circles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-10 text-center text-sm text-mute"),
				children: "Add family in People. Until then, record a private clip to yourself."
			}) : null
		]
	});
}
var KEYS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"",
	"0",
	"del"
];
function PinPad({ value, onChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-3",
			"aria-label": "Passcode dots",
			children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-3 rounded-full transition-colors duration-150", i < value.length ? "bg-fog" : "bg-fog/20") }, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-3",
			children: KEYS.map((key, i) => {
				if (key === "") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}, `empty-${i}`);
				const isDel = key === "del";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled,
					onClick: () => {
						if (isDel) onChange(value.slice(0, -1));
						else if (value.length < 6) onChange(value + key);
					},
					className: cn("size-[72px] rounded-full text-2xl font-medium text-fog", "glass-tight transition-transform duration-150 active:scale-[0.96]", "flex items-center justify-center"),
					children: isDel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, { className: "size-6" }) : key
				}, `key-${key}`);
			})
		})]
	});
}
function LockScreen({ onUnlocked }) {
	const [pin, setPin] = (0, import_react.useState)("");
	const [totpPin, setTotpPin] = (0, import_react.useState)("");
	const [phrase, setPhrase] = (0, import_react.useState)("");
	const [backup, setBackup] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hasPasscode, setHasPasscode] = (0, import_react.useState)(true);
	const [hasBio, setHasBio] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)("lock");
	const [totpSecret, setTotpSecret] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getLockConfig().then((cfg) => {
			setHasPasscode(Boolean(cfg?.hasPasscode));
			setHasBio(Boolean(cfg?.hasBiometric));
		});
		loadTotpSecret().then((v) => v && setTotpSecret(v));
	}, []);
	async function finishUnlock() {
		const secret = totpSecret ?? await loadTotpSecret();
		if (secret) {
			setTotpSecret(secret);
			setStep("totp");
			setTotpPin("");
			return;
		}
		onUnlocked();
	}
	(0, import_react.useEffect)(() => {
		if (step !== "lock" || pin.length !== 6) return;
		let cancelled = false;
		(async () => {
			setBusy(true);
			setError(null);
			try {
				await unlockWithPasscode(pin);
				if (!cancelled) await finishUnlock();
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Wrong passcode");
					setPin("");
				}
			} finally {
				if (!cancelled) setBusy(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [pin, step]);
	(0, import_react.useEffect)(() => {
		if (step !== "totp" || totpPin.length !== 6 || !totpSecret) return;
		let cancelled = false;
		(async () => {
			setBusy(true);
			setError(null);
			try {
				if (!await totpValid(totpSecret, totpPin)) throw new Error("Wrong authenticator code");
				if (!cancelled) onUnlocked();
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Wrong authenticator code");
					setTotpPin("");
				}
			} finally {
				if (!cancelled) setBusy(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		totpPin,
		step,
		totpSecret,
		onUnlocked
	]);
	async function bio() {
		setBusy(true);
		setError(null);
		try {
			await unlockWithBiometric();
			await finishUnlock();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Face ID failed");
		} finally {
			setBusy(false);
		}
	}
	async function recover() {
		setBusy(true);
		setError(null);
		try {
			await unlockWithPhrase(phrase);
			await finishUnlock();
		} catch (err) {
			setError(err instanceof Error ? err.message : "That recovery secret does not match");
		} finally {
			setBusy(false);
		}
	}
	async function useBackup() {
		setBusy(true);
		setError(null);
		try {
			if (!await consumeBackupCode(backup)) throw new Error("That backup code does not match");
			onUnlocked();
		} catch (err) {
			setError(err instanceof Error ? err.message : "That backup code does not match");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-between px-6 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-5xl italic text-fog",
					children: "Haven"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-mute",
					children: step === "totp" ? "Authenticator code" : step === "backup" ? "Backup code" : step === "recover" ? "Recover this device" : "Locked on this device"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full max-w-sm flex-col items-center gap-8",
				children: [
					step === "lock" && hasPasscode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinPad, {
						value: pin,
						onChange: setPin,
						disabled: busy
					}) : null,
					step === "totp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinPad, {
						value: totpPin,
						onChange: setTotpPin,
						disabled: busy
					}) : null,
					step === "backup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: backup,
								onChange: (e) => setBackup(e.target.value.toUpperCase()),
								placeholder: "XXXX-XXXX",
								className: "font-mono"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								disabled: busy || backup.trim().length < 8,
								onClick: () => void useBackup(),
								children: "Unlock with backup code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setStep("totp"),
								children: "Back"
							})
						]
					}) : null,
					step === "recover" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: phrase,
								onChange: (e) => setPhrase(e.target.value),
								rows: 4,
								placeholder: "Phrase, passkey, or email code",
								className: "w-full rounded-xl bg-glass px-4 py-3 text-sm text-fog placeholder:text-mute"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								disabled: busy || !phrase.trim(),
								onClick: () => void recover(),
								children: "Unlock with recovery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setStep("lock"),
								children: "Back"
							})
						]
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					step === "lock" && hasBio && biometricAvailable() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "glass",
						size: "pill",
						onClick: () => void bio(),
						disabled: busy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-5" }), "Unlock with Face ID"]
					}) : null,
					step === "totp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs text-mute",
						onClick: () => setStep("backup"),
						children: "Use a backup code"
					}) : null,
					step === "lock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs text-mute",
						onClick: () => setStep("recover"),
						children: "Forgot passcode? Use recovery"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pb-4 text-center text-xs text-mute",
				children: "Videos stay encrypted until you unlock."
			})
		]
	});
}
function CircleSheet({ friends, myId, me, open, onClose, onCreated }) {
	const accepted = friends.filter((f) => f.status === "accepted");
	const [name, setName] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const maxOthers = 49;
	if (!open) return null;
	function toggle(id) {
		setPicked((cur) => {
			if (cur.includes(id)) return cur.filter((x) => x !== id);
			if (cur.length >= maxOthers) {
				toast(`Groups hold up to 50 people`);
				return cur;
			}
			return [...cur, id];
		});
	}
	async function create() {
		if (!name.trim()) {
			toast("Name this group");
			return;
		}
		if (!picked.length) {
			toast("Add at least one person");
			return;
		}
		setBusy(true);
		try {
			const label = name.trim();
			const id = crypto.randomUUID();
			const mine = getSessionKeys();
			const members = [{
				userId: myId,
				handle: me.handle,
				displayName: me.displayName,
				publicKey: mine.publicKey,
				role: "owner",
				status: "member"
			}, ...picked.flatMap((uid) => {
				const friend = accepted.find((f) => f.userId === uid);
				if (!friend) return [];
				return [{
					userId: friend.userId,
					handle: friend.handle,
					displayName: friend.displayName,
					publicKey: friend.publicKey,
					role: "member",
					status: "invited"
				}];
			})];
			await saveCircle({
				id,
				name: label,
				createdBy: myId,
				members,
				pending: false
			});
			for (const member of members) {
				if (member.userId === myId || !member.publicKey) continue;
				try {
					await sendSealedHeader({
						recipientId: member.userId,
						recipientPublicKey: member.publicKey,
						header: {
							v: 1,
							purpose: "circle-meta",
							groupId: id,
							circleName: label,
							createdBy: myId,
							senderId: myId,
							senderHandle: me.handle,
							senderName: me.displayName,
							members: members.map((m) => ({
								userId: m.userId,
								handle: m.handle,
								displayName: m.displayName,
								publicKey: m.publicKey ?? void 0,
								role: m.role,
								status: m.status
							}))
						}
					});
				} catch {}
			}
			toast("Invites sent. They join after they accept.");
			setName("");
			setPicked([]);
			onCreated();
			onClose();
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not create group");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-3xl p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-medium",
						children: "New group"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-mute",
						children: [
							"Up to ",
							50,
							" people. They join only after they accept."
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: onClose,
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Family, cousins…",
					maxLength: 40
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-xs uppercase tracking-[0.16em] text-mute",
					children: [
						picked.length,
						"/",
						maxOthers,
						" invited"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 space-y-2",
					children: accepted.length ? accepted.map((f) => {
						const on = picked.includes(f.userId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => toggle(f.userId),
							className: cn("flex w-full items-center justify-between rounded-xl px-4 py-3 text-left", on ? "bg-fog text-accent-fg" : "bg-glass"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium",
								children: f.displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("text-xs", on ? "text-accent-fg/70" : "text-mute"),
								children: ["@", f.handle]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium",
								children: on ? "Added" : "Add"
							})]
						}, f.userId);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mute",
						children: "Add friends first, then group them."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5 w-full",
					disabled: busy,
					onClick: () => void create(),
					children: "Create group"
				})
			]
		})
	});
}
function claimFragment(name, handle) {
	try {
		return btoa(JSON.stringify({
			n: name,
			h: handle
		}));
	} catch {
		return "";
	}
}
function PeopleScreen({ friends, circles, myId, me, onOpen, onChanged }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)(null);
	const [contacts, setContacts] = (0, import_react.useState)([]);
	const [matches, setMatches] = (0, import_react.useState)([]);
	const [manualName, setManualName] = (0, import_react.useState)("");
	const [manualPhone, setManualPhone] = (0, import_react.useState)("");
	const [showManual, setShowManual] = (0, import_react.useState)(false);
	const [showGroup, setShowGroup] = (0, import_react.useState)(false);
	const incoming = friends.filter((f) => f.status === "pending-in");
	const outgoing = friends.filter((f) => f.status === "pending-out");
	const accepted = friends.filter((f) => f.status === "accepted");
	const canPick = contactsPickerAvailable();
	const pendingGroups = circles.filter((c) => c.pending);
	const joinedGroups = circles.filter((c) => !c.pending);
	async function shareInvite(label) {
		setBusy(true);
		try {
			const { token } = await createInviteLink();
			const frag = claimFragment(me.displayName, me.handle);
			const url = `${window.location.origin}/invite/${token}${frag ? `#${frag}` : ""}`;
			const text = label ? `${label}, join me on Haven.` : "Private video, just us.";
			const nav = navigator;
			try {
				if (nav.share) await nav.share({
					title: "Join me on Haven",
					text,
					url
				});
				else if (navigator.clipboard?.writeText) {
					await navigator.clipboard.writeText(url);
					toast("Invite link copied");
				} else toast(url);
			} catch (shareErr) {
				const message = shareErr instanceof Error ? shareErr.message : "";
				if (/abort|cancel/i.test(message)) return;
				toast(url);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not create invite";
			if (!/abort|cancel/i.test(message)) toast(message);
		} finally {
			setBusy(false);
		}
	}
	async function sendIntro(userId, publicKey, handle, displayName, status) {
		const mine = getSessionKeys();
		await upsertFriend({
			userId,
			handle,
			displayName,
			publicKey,
			status,
			friendshipId: crypto.randomUUID()
		});
		await sendSealedHeader({
			recipientId: userId,
			recipientPublicKey: publicKey,
			header: {
				v: 1,
				purpose: status === "accepted" ? "intro-ack" : "intro",
				senderId: myId,
				senderHandle: me.handle,
				senderName: me.displayName,
				senderPublicKey: mine.publicKey
			}
		});
		onChanged();
	}
	async function addPerson(row) {
		if (!row.publicKey) {
			toast("They have not opened Haven on a device yet");
			return;
		}
		setBusy(true);
		try {
			await sendIntro(row.userId, row.publicKey, row.handle, row.displayName, "pending-out");
			setNote("Request sent. They join after they accept.");
			toast("Request sent");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not add");
		} finally {
			setBusy(false);
		}
	}
	async function refreshMatches(rows) {
		const phoneHashes = (await Promise.all(rows.flatMap((c) => c.phones.map((p) => hashContactPhone(p))))).slice(0, 200);
		const emailHashes = (await Promise.all(rows.flatMap((c) => c.emails.map((e) => hashContactEmail(e))))).slice(0, 200);
		if (!phoneHashes.length && !emailHashes.length) {
			setMatches([]);
			return;
		}
		const found = await matchContacts({ data: {
			phoneHashes,
			emailHashes
		} });
		setMatches(found);
	}
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		loadContacts().then(async (rows) => {
			if (cancelled) return;
			setContacts(rows);
			await refreshMatches(rows);
		}).catch(() => void 0);
		return () => {
			cancelled = true;
		};
	}, []);
	async function search() {
		const q = query.trim();
		if (!q) return;
		setBusy(true);
		setNote(null);
		try {
			const phone = looksLikePhone(q) ? normalizePhone(q) : null;
			const handle = q.replace(/^@/, "").toLowerCase();
			const rows = await searchPeople({ data: phone ? { phoneHash: await hashContactPhone(phone) } : { handleHash: await hashHandle(handle) } });
			setResults(rows.map((row) => ({
				userId: row.userId,
				publicKey: row.publicKey,
				handle: phone ? handle : handle,
				displayName: phone ? q : `@${handle}`
			})));
			if (!rows.length) setNote("No one matched. Ask them for their Haven handle.");
		} catch (err) {
			setNote(err instanceof Error ? err.message : "Search failed");
		} finally {
			setBusy(false);
		}
	}
	async function syncContacts() {
		setBusy(true);
		try {
			const rows = await pickDeviceContacts();
			setContacts(rows);
			await refreshMatches(rows);
			toast(rows.length ? `Saved ${rows.length} contacts on this phone` : "No contacts selected");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not sync contacts";
			if (!/cancel|abort/i.test(message)) toast(message);
		} finally {
			setBusy(false);
		}
	}
	async function addManual() {
		const phone = normalizePhone(manualPhone);
		if (!phone) {
			toast("Enter a valid mobile number");
			return;
		}
		setBusy(true);
		try {
			const rows = await upsertContact({
				name: manualName,
				phones: [phone]
			});
			setContacts(rows);
			await refreshMatches(rows);
			setManualName("");
			setManualPhone("");
			setShowManual(false);
			toast("Saved and encrypted on this phone");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not save contact");
		} finally {
			setBusy(false);
		}
	}
	async function matchedFor(contact) {
		const hashes = await Promise.all(contact.phones.map((p) => hashContactPhone(p)));
		const emailHashes = await Promise.all(contact.emails.map((e) => hashContactEmail(e)));
		const hashSet = new Set(hashes);
		const emailSet = new Set(emailHashes);
		return matches.find((row) => row.phoneHash && hashSet.has(row.phoneHash) || row.emailHash && emailSet.has(row.emailHash));
	}
	const [resolved, setResolved] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		Promise.all(contacts.map(async (c) => [c.id, await matchedFor(c)])).then((pairs) => {
			if (cancelled) return;
			setResolved(Object.fromEntries(pairs));
		});
		return () => {
			cancelled = true;
		};
	}, [contacts, matches]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6 px-5 pb-28 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "People"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-mute",
				children: "Add family by handle or phone. Groups hold up to 50. Names stay on this phone."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "glass",
					className: "flex-1",
					onClick: () => setShowGroup(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), "New group"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "glass",
					className: "flex-1",
					disabled: busy,
					onClick: () => void shareInvite(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }), "Share invite"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					search();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search @handle or number",
					"aria-label": "Search people"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "glass",
					size: "icon",
					disabled: busy,
					"aria-label": "Search",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
				})]
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mute",
				children: note
			}) : null,
			results.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "space-y-2",
				children: results.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass flex items-center justify-between rounded-xl px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: row.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-mute",
						children: ["@", row.handle]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "glass",
						disabled: busy,
						onClick: () => void addPerson(row),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), "Add"]
					})]
				}, row.userId))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-start justify-between gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xs uppercase tracking-[0.16em] text-mute",
							children: "Contacts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-mute",
							children: "Encrypted at rest on this phone. Haven never stores the book."
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [canPick ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "glass",
							className: "flex-1",
							disabled: busy,
							onClick: () => void syncContacts(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookUser, { className: "size-4" }), "Sync from phone"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "glass",
							className: "flex-1",
							onClick: () => setShowManual(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookUser, { className: "size-4" }), "Add from phone"]
						}), canPick ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "glass",
							size: "icon",
							onClick: () => setShowManual((v) => !v),
							"aria-label": "Add contact",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" })
						}) : null]
					}),
					!canPick ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-mute",
						children: "This browser cannot open your address book. Add people by name and number — they still stay encrypted here."
					}) : null,
					showManual ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass space-y-2 rounded-2xl p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: manualName,
								onChange: (e) => setManualName(e.target.value),
								placeholder: "Name",
								maxLength: 60
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: manualPhone,
								onChange: (e) => setManualPhone(e.target.value),
								placeholder: "Mobile number",
								inputMode: "tel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								disabled: busy,
								onClick: () => void addManual(),
								children: "Save encrypted"
							})
						]
					}) : null,
					contacts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: contacts.map((contact) => {
							const match = resolved[contact.id];
							const friend = match ? friends.find((f) => f.userId === match.userId) : void 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "glass flex items-center justify-between gap-3 rounded-xl px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "min-w-0 flex-1 text-left",
									onClick: () => {
										if (friend?.status === "accepted" && match) onOpen(match.userId);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-medium",
										children: contact.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-mute",
										children: match ? "On Haven" : contactSubtitle(contact)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 items-center gap-1",
									children: [
										match && friend?.status !== "accepted" && friend?.status !== "pending-out" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "glass",
											disabled: busy,
											onClick: () => void addPerson({
												userId: match.userId,
												publicKey: match.publicKey,
												handle: contact.name,
												displayName: contact.name
											}),
											children: "Add"
										}) : null,
										!match ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "glass",
											disabled: busy,
											onClick: () => void shareInvite(contact.name),
											children: "Invite"
										}) : null,
										friend?.status === "pending-out" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-mute",
											children: "Waiting"
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "size-9",
											"aria-label": `Remove ${contact.name}`,
											onClick: () => void removeContact(contact.id).then((rows) => {
												setContacts(rows);
												refreshMatches(rows);
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
										})
									]
								})]
							}, contact.id);
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mute",
						children: "No contacts on this device yet."
					})
				]
			}),
			incoming.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xs uppercase tracking-[0.16em] text-mute",
				children: "Requests"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: incoming.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass flex items-center justify-between rounded-xl px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: f.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-mute",
						children: ["@", f.handle]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => {
								if (!f.publicKey) {
									toast("They have not opened Haven yet");
									return;
								}
								sendIntro(f.userId, f.publicKey, f.handle, f.displayName, "accepted").then(() => toast(`Connected with ${f.displayName}`));
							},
							children: "Accept"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void removeFriend(f.userId).then(onChanged),
							children: "Ignore"
						})]
					})]
				}, f.friendshipId))
			})] }) : null,
			outgoing.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xs uppercase tracking-[0.16em] text-mute",
				children: "Waiting"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: outgoing.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass rounded-xl px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: f.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-mute",
						children: ["Invite pending · @", f.handle]
					})]
				}, f.friendshipId))
			})] }) : null,
			pendingGroups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xs uppercase tracking-[0.16em] text-mute",
				children: "Group invites"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: pendingGroups.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass flex items-center justify-between rounded-xl px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-mute",
						children: [
							"Accept to join · ",
							c.members.length,
							" people"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => void saveCircle({
								...c,
								pending: false,
								members: c.members.map((m) => m.userId === myId ? {
									...m,
									status: "member"
								} : m)
							}).then(onChanged),
							children: "Join"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void removeCircle(c.id).then(onChanged),
							children: "Decline"
						})]
					})]
				}, c.id))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xs uppercase tracking-[0.16em] text-mute",
				children: "Groups"
			}), joinedGroups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: joinedGroups.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onOpen(groupPeerId(c.id)),
					className: "glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-left",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-mute",
						children: [c.members.length, " people"]
					})] })
				}, c.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mute",
				children: "No groups yet. Up to 50 people, video or voice. They must accept the invite."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xs uppercase tracking-[0.16em] text-mute",
				children: "Family"
			}), accepted.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: accepted.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onOpen(f.userId),
					className: "glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-left",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: f.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-mute",
						children: ["@", f.handle]
					})] })
				}, f.userId))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mute",
				children: "Haven stays quiet until you add someone you trust."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleSheet, {
				friends,
				myId,
				me,
				open: showGroup,
				onClose: () => setShowGroup(false),
				onCreated: onChanged
			})
		]
	});
}
function formatRecTime(seconds) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = seconds % 60;
	if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	return `${m}:${String(s).padStart(2, "0")}`;
}
function pickMime(kind = "video") {
	const candidates = kind === "audio" ? [
		"audio/webm;codecs=opus",
		"audio/webm",
		"audio/mp4"
	] : [
		"video/webm;codecs=vp9,opus",
		"video/webm;codecs=vp8,opus",
		"video/webm",
		"video/mp4"
	];
	if (typeof MediaRecorder === "undefined") return kind === "audio" ? "audio/webm" : "video/webm";
	return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? candidates[candidates.length - 1];
}
async function openCamera(facing) {
	return navigator.mediaDevices.getUserMedia({
		audio: {
			echoCancellation: true,
			noiseSuppression: true
		},
		video: {
			facingMode: { ideal: facing },
			width: {
				ideal: 720,
				max: 1280
			},
			height: {
				ideal: 1280,
				max: 1920
			},
			frameRate: {
				ideal: 24,
				max: 30
			}
		}
	});
}
async function openMic() {
	return navigator.mediaDevices.getUserMedia({
		audio: {
			echoCancellation: true,
			noiseSuppression: true
		},
		video: false
	});
}
async function capturePoster(video) {
	try {
		const canvas = document.createElement("canvas");
		const w = video.videoWidth || 360;
		const h = video.videoHeight || 480;
		canvas.width = 360;
		canvas.height = Math.round(360 * h / w);
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", .72));
	} catch {
		return null;
	}
}
function mimeOf(blob, kind) {
	if (blob.type) return blob.type;
	return kind === "audio" ? "audio/webm" : "video/webm";
}
async function durationOf(blob) {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(blob);
		const el = document.createElement(blob.type.startsWith("audio/") ? "audio" : "video");
		el.preload = "metadata";
		const done = (ms) => {
			URL.revokeObjectURL(url);
			resolve(ms);
		};
		el.onloadedmetadata = () => {
			const d = el.duration;
			done(Number.isFinite(d) && d > 0 ? Math.round(d * 1e3) : 0);
		};
		el.onerror = () => done(0);
		window.setTimeout(() => done(0), 4e3);
		el.src = url;
	});
}
function listenCaptions(onText) {
	const w = window;
	const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
	if (!Ctor) return () => void 0;
	const rec = new Ctor();
	rec.continuous = true;
	rec.interimResults = true;
	rec.onresult = (ev) => {
		let text = "";
		for (let i = 0; i < ev.results.length; i += 1) text += ev.results[i][0].transcript + " ";
		onText(text.trim());
	};
	try {
		rec.start();
	} catch {
		return () => void 0;
	}
	return () => {
		try {
			rec.stop();
		} catch {}
	};
}
var Textarea = (0, import_react.forwardRef)(function Textarea({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref,
		className: cn("min-h-28 w-full rounded-lg bg-glass px-4 py-3 text-base text-fog outline-none", "shadow-[0_0_0_1px_var(--color-ring)] placeholder:text-mute", "focus:shadow-[0_0_0_1.5px_var(--color-ring-focus)]", className),
		...props
	});
});
var NOTES_KEY = "thread-notes";
async function loadAll() {
	return await unsealFromKv(NOTES_KEY) ?? {};
}
async function getNote(peerId) {
	return (await loadAll())[peerId] ?? null;
}
async function saveNote(peerId, text) {
	const all = await loadAll();
	const note = {
		peerId,
		text,
		updatedAt: Date.now()
	};
	if (!text.trim()) delete all[peerId];
	else all[peerId] = note;
	await sealToKv(NOTES_KEY, all);
	return note;
}
async function clearNote(peerId) {
	const all = await loadAll();
	if (!(peerId in all)) return;
	delete all[peerId];
	await sealToKv(NOTES_KEY, all);
}
function useThreadNote(peerId) {
	const [text, setText] = (0, import_react.useState)("");
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setLoaded(false);
		if (!peerId) {
			setText("");
			setLoaded(true);
			return;
		}
		getNote(peerId).then((note) => {
			if (cancelled) return;
			setText(note?.text ?? "");
			setLoaded(true);
		}).catch(() => {
			if (cancelled) return;
			setText("");
			setLoaded(true);
		});
		return () => {
			cancelled = true;
		};
	}, [peerId]);
	(0, import_react.useEffect)(() => {
		if (!peerId || !loaded) return;
		const handle = window.setTimeout(() => {
			saveNote(peerId, text).catch(() => void 0);
		}, 280);
		return () => window.clearTimeout(handle);
	}, [
		peerId,
		text,
		loaded
	]);
	return {
		text,
		setText,
		loaded
	};
}
function NotesSheet({ open, text, onChange, onClose, onClear, peerId }) {
	const areaRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (open) areaRef.current?.focus();
	}, [open]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass rounded-[28px] p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookPen, { className: "size-4 text-mist" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Notes for your reply"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-9",
						onClick: onClose,
						"aria-label": "Close notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					ref: areaRef,
					value: text,
					onChange: (e) => onChange(e.target.value),
					placeholder: "Tally what you want to remember…",
					className: "mt-3 min-h-32 bg-ink/40",
					maxLength: 2e3
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-mute",
						children: "Stays on this phone, encrypted."
					}), text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs text-mute underline-offset-4 hover:underline",
						onClick: () => {
							onChange("");
							clearNote(peerId);
							onClear();
						},
						children: "Clear"
					}) : null]
				})
			]
		})
	});
}
function NotesChip({ text, className }) {
	if (!text.trim()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("glass max-h-28 overflow-auto rounded-2xl px-4 py-3 text-left", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.16em] text-mute",
			children: "Your notes"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 whitespace-pre-wrap text-sm text-fog",
			children: text
		})]
	});
}
function Recorder({ toName, peerId, defaultTtl, onCancel, onSend }) {
	const videoRef = (0, import_react.useRef)(null);
	const playbackRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const recorderRef = (0, import_react.useRef)(null);
	const chunksRef = (0, import_react.useRef)([]);
	const startedAtRef = (0, import_react.useRef)(0);
	const captionsRef = (0, import_react.useRef)("");
	const stopCaptionsRef = (0, import_react.useRef)(null);
	const [facing, setFacing] = (0, import_react.useState)("user");
	const [kind, setKind] = (0, import_react.useState)("video");
	const [live, setLive] = (0, import_react.useState)(false);
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [seconds, setSeconds] = (0, import_react.useState)(0);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(null);
	const [ttl, setTtl] = (0, import_react.useState)(defaultTtl);
	const [error, setError] = (0, import_react.useState)(null);
	const [sending, setSending] = (0, import_react.useState)(false);
	const [ttlOpen, setTtlOpen] = (0, import_react.useState)(false);
	const [liveCaption, setLiveCaption] = (0, import_react.useState)("");
	const notes = useThreadNote(peerId);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			try {
				const stream = kind === "audio" ? await openMic() : await openCamera(facing);
				if (cancelled) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}
				streamRef.current?.getTracks().forEach((t) => t.stop());
				streamRef.current = stream;
				if (videoRef.current && kind === "video") {
					videoRef.current.srcObject = stream;
					await videoRef.current.play().catch(() => void 0);
				}
				setLive(true);
				setError(null);
			} catch {
				if (!cancelled) setError(kind === "audio" ? "Microphone is blocked." : "Camera is blocked. You can still choose a clip.");
			}
		})();
		return () => {
			cancelled = true;
			streamRef.current?.getTracks().forEach((t) => t.stop());
			streamRef.current = null;
		};
	}, [facing, kind]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);
	(0, import_react.useEffect)(() => {
		if (!recording) return;
		const started = startedAtRef.current || Date.now();
		const tick = window.setInterval(() => {
			const s = Math.floor((Date.now() - started) / 1e3);
			setSeconds(s);
		}, 200);
		return () => window.clearInterval(tick);
	}, [recording]);
	(0, import_react.useEffect)(() => {
		if (kind !== "audio" || !live || preview) return;
		const stream = streamRef.current;
		const canvas = canvasRef.current;
		if (!stream || !canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const audioCtx = new AudioContext();
		const source = audioCtx.createMediaStreamSource(stream);
		const analyser = audioCtx.createAnalyser();
		analyser.fftSize = 64;
		source.connect(analyser);
		const data = new Uint8Array(analyser.frequencyBinCount);
		let raf = 0;
		const draw = () => {
			analyser.getByteFrequencyData(data);
			const { width, height } = canvas;
			ctx.clearRect(0, 0, width, height);
			const barW = width / data.length;
			for (let i = 0; i < data.length; i += 1) {
				const h = data[i] / 255 * height;
				ctx.fillStyle = "rgba(244,245,248,0.85)";
				ctx.fillRect(i * barW + 2, height - h, Math.max(2, barW - 4), h);
			}
			raf = requestAnimationFrame(draw);
		};
		draw();
		return () => {
			cancelAnimationFrame(raf);
			audioCtx.close();
		};
	}, [
		kind,
		live,
		preview
	]);
	function start() {
		const stream = streamRef.current;
		if (!stream) return;
		chunksRef.current = [];
		const mime = pickMime(kind === "audio" ? "audio" : "video");
		const rec = new MediaRecorder(stream, {
			mimeType: mime,
			...kind === "video" ? { videoBitsPerSecond: 65e4 } : { audioBitsPerSecond: 48e3 }
		});
		rec.ondataavailable = (ev) => {
			if (ev.data.size) chunksRef.current.push(ev.data);
		};
		rec.onstop = () => {
			const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime });
			setPreview(blob);
			setPreviewUrl(URL.createObjectURL(blob));
		};
		recorderRef.current = rec;
		rec.start(200);
		startedAtRef.current = Date.now();
		captionsRef.current = "";
		setLiveCaption("");
		stopCaptionsRef.current?.();
		if (readPrefs().captions) stopCaptionsRef.current = listenCaptions((text) => {
			captionsRef.current = text;
			setLiveCaption(text);
		});
		setRecording(true);
		setSeconds(0);
	}
	function stop() {
		stopCaptionsRef.current?.();
		stopCaptionsRef.current = null;
		if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
		setRecording(false);
	}
	async function send() {
		if (!preview) return;
		setSending(true);
		try {
			let poster = null;
			if (kind === "video" && playbackRef.current) poster = await capturePoster(playbackRef.current);
			const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : seconds * 1e3;
			const fromEl = playbackRef.current?.duration;
			const fromBlob = await durationOf(preview);
			const durationMs = (fromEl && Number.isFinite(fromEl) ? Math.round(fromEl * 1e3) : 0) || fromBlob || elapsed || 1e3;
			await onSend({
				blob: preview,
				poster,
				durationMs,
				ttl,
				kind,
				mimeType: mimeOf(preview, kind === "audio" ? "audio" : "video"),
				captions: captionsRef.current
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not send");
			setSending(false);
		}
	}
	function onFile(file) {
		const fileKind = file.type.startsWith("audio/") ? "audio" : "video";
		setKind(fileKind);
		setPreview(file);
		setPreviewUrl(URL.createObjectURL(file));
		startedAtRef.current = 0;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "player-screen relative flex min-h-dvh flex-col",
		children: [
			kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				className: cn("absolute inset-0 size-full object-cover", preview ? "hidden" : "block", facing === "user" && "-scale-x-100"),
				muted: true,
				playsInline: true,
				autoPlay: true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 spec" }),
			previewUrl && kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: playbackRef,
				src: previewUrl,
				className: "absolute inset-0 size-full object-cover",
				playsInline: true,
				loop: true,
				autoPlay: true,
				muted: true
			}) : null,
			kind === "audio" && !preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-24 place-items-center rounded-full glass",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-10 text-fog" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						width: 280,
						height: 64,
						className: "w-64"
					})]
				})
			}) : null,
			kind === "audio" && previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 grid place-items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
					src: previewUrl,
					autoPlay: true,
					loop: true,
					className: "hidden"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mist",
					children: "Voice note ready"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/70" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "glass",
						size: "icon",
						onClick: onCancel,
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: ["To ", toName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTtlOpen((v) => !v),
						className: "glass-tight rounded-full px-3 py-2 text-xs font-medium",
						children: ttlLabel(ttl)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto mt-4 flex rounded-full glass p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setKind("video");
						setPreview(null);
						setPreviewUrl(null);
					},
					className: cn("flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium", kind === "video" ? "bg-fog text-accent-fg" : "text-mist"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }), "Video"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setKind("audio");
						setPreview(null);
						setPreviewUrl(null);
					},
					className: cn("flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium", kind === "audio" ? "bg-fog text-accent-fg" : "text-mist"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }), "Voice"]
				})]
			}),
			ttlOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-4 mt-3 rounded-xl glass p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 px-1 text-xs text-mute",
					children: "Timer starts after they watch. Unwatched stays."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: TTL_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setTtl(opt.id);
							setTtlOpen(false);
						},
						className: cn("rounded-md px-3 py-2 text-left text-sm", ttl === opt.id ? "bg-fog text-accent-fg" : "text-fog"),
						children: opt.label
					}, opt.id))
				})]
			}) : null,
			recording && liveCaption ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative z-10 mx-5 mt-auto rounded-xl bg-ink/55 px-4 py-2 text-center text-sm text-fog",
				children: liveCaption
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mt-auto flex flex-col items-center gap-5 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesChip, {
						text: notes.text,
						className: "w-full"
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "glass rounded-full px-4 py-2 text-center text-sm text-fog",
						children: error
					}) : null,
					recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular-nums text-sm text-fog",
						children: formatRecTime(seconds)
					}) : null,
					!preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full items-center justify-between",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid size-11 place-items-center rounded-full glass-tight",
								children: [kind === "audio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: kind === "audio" ? "audio/*" : "video/*",
									className: "hidden",
									onChange: (e) => {
										const file = e.target.files?.[0];
										if (file) onFile(file);
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !live,
								onClick: () => recording ? stop() : start(),
								className: cn("relative grid size-[84px] place-items-center rounded-full", "shadow-[0_0_0_6px_rgb(255_255_255/0.18)] bg-fog", "active:scale-[0.96] transition-transform", !live && "opacity-40"),
								"aria-label": recording ? "Stop" : "Record",
								children: recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-7 fill-record text-record" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-16 rounded-full bg-record" })
							}),
							kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "glass",
								size: "icon",
								onClick: () => setFacing((f) => f === "user" ? "environment" : "user"),
								"aria-label": "Flip camera",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-5" })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-11" })
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "glass",
							size: "pill",
							onClick: () => {
								setPreview(null);
								setPreviewUrl(null);
							},
							children: "Retake"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "pill",
							disabled: sending,
							onClick: () => void send(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), "Send"]
						})]
					})
				]
			})
		]
	});
}
function PrefSelect({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("relative inline-flex h-11 w-40 shrink-0 items-center", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			className: "h-11 w-full appearance-none rounded-lg bg-glass py-2 pl-3 pr-9 text-sm text-fog outline-none shadow-[0_0_0_1px_var(--color-ring)] focus:shadow-[0_0_0_1.5px_var(--color-ring-focus)]",
			...props,
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "pointer-events-none absolute right-2.5 size-4 text-mute" })]
	});
}
function SetupFlow({ displayName, handle, onDone }) {
	const [step, setStep] = (0, import_react.useState)(0);
	const [name, setName] = (0, import_react.useState)(displayName);
	const [pin, setPin] = (0, import_react.useState)("");
	const [pin2, setPin2] = (0, import_react.useState)("");
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [ttl, setTtl] = (0, import_react.useState)("1d");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function finish(extra) {
		setBusy(true);
		setError(null);
		try {
			const display = name.trim() || displayName;
			await saveIdentity({
				handle,
				displayName: display
			});
			await updateProfile({ data: {
				defaultTtl: ttl,
				setupComplete: true,
				phone: extra?.phone ?? (phone ? normalizePhone(phone) : null),
				handleHash: await hashHandle(handle)
			} });
			onDone();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col px-6 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-4xl italic text-fog",
				children: "Haven"
			}),
			step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-medium tracking-tight",
						children: "Private video for the people you love."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-8 space-y-4 text-sm text-mist",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "glass rounded-xl p-4",
								children: "Clips are encrypted on this device. Haven never holds the keys."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "glass rounded-xl p-4",
								children: "In transit they stay sealed. At rest they stay sealed. After the timer, they vanish."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "glass rounded-xl p-4",
								children: "You can lock Haven with a passcode, Face ID, or both."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto pt-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-xs uppercase tracking-[0.18em] text-mute",
								children: "Your name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								onChange: (e) => setName(e.target.value),
								maxLength: 40
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-mute",
								children: [
									"Handle @",
									handle,
									" — you can change it later."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-6 w-full",
								size: "lg",
								onClick: () => setStep(1),
								children: "Continue"
							})
						]
					})
				]
			}) : null,
			step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-1 flex-col items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-8 text-mist" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-xl font-medium",
						children: "Device lock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xs text-center text-sm text-mute",
						children: "A 6-digit passcode encrypts your vault. Face ID can unlock it on this phone."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinPad, {
							value: confirming ? pin2 : pin,
							onChange: (next) => {
								if (confirming) setPin2(next);
								else setPin(next);
							}
						})
					}),
					pin.length === 6 && !confirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-6",
						size: "pill",
						onClick: () => setConfirming(true),
						children: "Confirm passcode"
					}) : null,
					confirming && pin2.length === 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-6",
						size: "pill",
						disabled: busy,
						onClick: () => {
							if (pin !== pin2) {
								setError("Passcodes did not match");
								setPin("");
								setPin2("");
								setConfirming(false);
								return;
							}
							setBusy(true);
							setPasscode(pin).then(() => setStep(2)).catch((err) => setError(err instanceof Error ? err.message : "Could not set passcode")).finally(() => setBusy(false));
						},
						children: "Save lock"
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-auto pt-8 text-sm text-mute underline-offset-4 hover:underline",
						onClick: () => setStep(2),
						children: "Skip for now"
					})
				]
			}) : null,
			step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-8 text-mist" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-xl font-medium",
						children: "Face ID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "Use your phone’s Face ID, Touch ID, or Windows Hello as a second lock."
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex flex-col gap-3",
						children: [biometricAvailable() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							disabled: busy,
							onClick: () => {
								setBusy(true);
								setError(null);
								registerBiometric().then(() => setStep(3)).catch((err) => setError(err instanceof Error ? err.message : "Could not enable Face ID")).finally(() => setBusy(false));
							},
							children: "Enable Face ID"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-mute",
							children: "This browser cannot use device biometrics."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "glass",
							size: "lg",
							onClick: () => setStep(3),
							children: "Not now"
						})]
					})
				]
			}) : null,
			step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-8 text-mist" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-xl font-medium",
						children: "Findable by phone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "Optional. Family can add you by number. We store a one-way hash, never the number itself."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-6",
						inputMode: "tel",
						placeholder: "Mobile number",
						value: phone,
						onChange: (e) => setPhone(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-xs uppercase tracking-[0.18em] text-mute",
						children: "Clip lifetime"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefSelect, {
							className: "w-full",
							"aria-label": "Default lifetime",
							value: ttl,
							onChange: (e) => setTtl(e.target.value),
							children: TTL_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: opt.id,
								children: [
									opt.label,
									" — ",
									opt.hint
								]
							}, opt.id))
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex flex-col gap-3 pt-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							disabled: busy,
							onClick: () => {
								if (phone && !normalizePhone(phone)) {
									setError("Enter a valid mobile number");
									return;
								}
								finish({ phone: phone ? normalizePhone(phone) : null });
							},
							children: "Enter Haven"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => void finish({ phone: null }),
							children: "Skip phone"
						})]
					})
				]
			}) : null
		]
	});
}
function TabBar({ tab, onTab, onCamera, inboxCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto relative flex w-full max-w-md items-center rounded-full glass px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
						active: tab === "home",
						label: "Home",
						onClick: () => onTab("home"),
						badge: inboxCount,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
						active: tab === "people",
						label: "People",
						onClick: () => onTab("people"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-16 shrink-0",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-1 items-center justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
						active: tab === "you",
						label: "You",
						onClick: () => onTab("you"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-5" })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onCamera,
					"aria-label": "Record",
					className: "absolute left-1/2 top-0 grid size-16 -translate-x-1/2 -translate-y-5 place-items-center rounded-full bg-fog text-accent-fg shadow-[0_0_0_6px_var(--color-ring)] transition-transform active:scale-[0.96]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-7" })
				})
			]
		})
	});
}
function TabBtn({ active, label, onClick, badge, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		"aria-label": label,
		className: cn("relative flex size-11 flex-col items-center justify-center rounded-full transition-colors", active ? "text-fog" : "text-mute"),
		children: [children, badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute right-0.5 top-0.5 min-w-4 rounded-full bg-fog px-1 text-[10px] font-semibold leading-4 text-accent-fg tabular-nums",
			children: badge > 9 ? "9+" : badge
		}) : null]
	});
}
async function safetyNumber(myKey, theirKey) {
	const [a, b] = [myKey, theirKey].sort();
	const digits = (await sha256Hex(`${a}:${b}`)).replace(/[a-f]/g, (ch) => String((ch.charCodeAt(0) - 87) % 10)).slice(0, 36);
	const parts = [];
	for (let i = 0; i < 36; i += 4) parts.push(digits.slice(i, i + 4));
	return parts.join(" ");
}
function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${String(s).padStart(2, "0")}`;
}
function nextSpeed(current) {
	const i = SPEED_OPTIONS.indexOf(current);
	return SPEED_OPTIONS[(i + 1) % SPEED_OPTIONS.length] ?? 1;
}
function initialIndex(clips) {
	const unread = clips.findIndex((v) => !v.outgoing && !v.viewedAt);
	if (unread >= 0) return unread;
	return clips.length ? clips.length - 1 : 0;
}
function keyFor(userId, friends, circles) {
	const friend = friends.find((f) => f.userId === userId);
	if (friend?.publicKey) return friend.publicKey;
	for (const circle of circles) {
		const member = circle.members.find((m) => m.userId === userId);
		if (member?.publicKey) return member.publicKey;
	}
	return null;
}
function ThreadView({ peerId, name, videos, friends, circles, myId, me, onBack, onReply, onChanged }) {
	const clips = videos;
	const [index, setIndex] = (0, import_react.useState)(() => initialIndex(clips));
	const current = clips[index];
	const [src, setSrc] = (0, import_react.useState)(null);
	const [gone, setGone] = (0, import_react.useState)(false);
	const mediaRef = (0, import_react.useRef)(null);
	const railRef = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(true);
	const [currentTime, setCurrentTime] = (0, import_react.useState)(0);
	const [duration, setDuration] = (0, import_react.useState)(0);
	const [notesOpen, setNotesOpen] = (0, import_react.useState)(false);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [skipFlash, setSkipFlash] = (0, import_react.useState)(null);
	const [shielded, setShielded] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [safety, setSafety] = (0, import_react.useState)(null);
	const [reactOpen, setReactOpen] = (0, import_react.useState)(false);
	const [burnOpen, setBurnOpen] = (0, import_react.useState)(false);
	const [forwardOpen, setForwardOpen] = (0, import_react.useState)(false);
	const lastTap = (0, import_react.useRef)(null);
	const prefs = usePrefs();
	const notes = useThreadNote(peerId);
	const isAudio = current?.kind === "audio";
	const canSave = Boolean(current?.allowSave);
	const canForward = canSave && prefs.allowForward;
	const groupId = parseGroupId(peerId);
	const circle = groupId ? circles.find((c) => c.id === groupId) : null;
	const friend = !groupId ? friends.find((f) => f.userId === peerId) : null;
	const reactions = current?.reactions ?? (current?.hearts ? { "❤️": current.hearts } : {});
	const reactionEntries = Object.entries(reactions).filter(([, n]) => n > 0);
	(0, import_react.useEffect)(() => {
		setIndex(initialIndex(clips));
	}, [clips.length]);
	(0, import_react.useEffect)(() => {
		setMuted(prefs.startMuted);
	}, [prefs.startMuted, current?.id]);
	(0, import_react.useEffect)(() => {
		const el = mediaRef.current;
		if (el) el.muted = muted;
	}, [muted, src]);
	(0, import_react.useEffect)(() => {
		let url = null;
		let cancelled = false;
		if (!current) {
			setSrc(null);
			return;
		}
		decryptVideo(current.id).then((blob) => {
			if (cancelled) return;
			url = URL.createObjectURL(blob);
			setSrc(url);
			setGone(false);
			setCurrentTime(0);
		});
		return () => {
			cancelled = true;
			if (url) URL.revokeObjectURL(url);
		};
	}, [current?.id]);
	(0, import_react.useEffect)(() => {
		const el = mediaRef.current;
		if (!el) return;
		el.playbackRate = prefs.playbackRate;
	}, [prefs.playbackRate, src]);
	(0, import_react.useEffect)(() => {
		(railRef.current?.querySelector(`[data-clip-index="${index}"]`))?.scrollIntoView({
			inline: "center",
			block: "nearest",
			behavior: "smooth"
		});
	}, [index]);
	(0, import_react.useEffect)(() => {
		if (!friend?.publicKey) {
			setSafety(null);
			return;
		}
		try {
			const mine = getSessionKeys().publicKey;
			safetyNumber(mine, friend.publicKey).then(setSafety);
		} catch {
			setSafety(null);
		}
	}, [friend?.publicKey]);
	(0, import_react.useEffect)(() => {
		if (!prefs.shieldClips) {
			setShielded(false);
			return;
		}
		const hide = () => {
			setShielded(true);
			mediaRef.current?.pause();
		};
		const show = () => {
			if (document.visibilityState === "visible") setShielded(false);
		};
		const block = (e) => e.preventDefault();
		const onKey = (e) => {
			if (e.key === "PrintScreen") hide();
		};
		const onVis = () => document.hidden ? hide() : show();
		document.addEventListener("visibilitychange", onVis);
		window.addEventListener("blur", hide);
		window.addEventListener("focus", show);
		window.addEventListener("keyup", onKey);
		document.addEventListener("contextmenu", block);
		document.addEventListener("copy", block);
		return () => {
			document.removeEventListener("visibilitychange", onVis);
			window.removeEventListener("blur", hide);
			window.removeEventListener("focus", show);
			window.removeEventListener("keyup", onKey);
			document.removeEventListener("contextmenu", block);
			document.removeEventListener("copy", block);
		};
	}, [prefs.shieldClips]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (notesOpen && e.key !== "Escape") return;
			if (e.key === " ") {
				e.preventDefault();
				togglePlay();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				skip(1);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				skip(-1);
			} else if (e.key === "Escape") {
				setNotesOpen(false);
				setMenuOpen(false);
				setReactOpen(false);
				setBurnOpen(false);
				setForwardOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	async function sendControl(kind, clip, extra) {
		const targets = [];
		if (circle) for (const member of circle.members) {
			if (member.userId === myId || !member.publicKey) continue;
			if (kind !== "shred" && member.userId !== clip.senderId) continue;
			targets.push({
				id: member.userId,
				pub: member.publicKey
			});
		}
		else {
			const otherId = clip.outgoing ? clip.recipientId : clip.senderId;
			const pub = keyFor(otherId, friends, circles);
			if (otherId && pub && otherId !== myId) targets.push({
				id: otherId,
				pub
			});
		}
		for (const target of targets) try {
			const sealed = await sealJsonMessage({
				clipId: clip.id,
				at: Date.now(),
				purpose: kind,
				emoji: extra?.emoji,
				ttlMode: clip.ttlMode
			}, target.pub, myId);
			await relayPublish({
				recipientId: target.id,
				ttlMode: "1d",
				expiresAt: new Date(Date.now() + 864e5).toISOString(),
				...sealed,
				poster: null
			});
		} catch {}
	}
	async function finished() {
		if (!current || current.outgoing) return;
		const remaining = await markViewed(current.id);
		if (prefs.sendReceipts) sendControl("receipt", current);
		if (current.ttlMode === "view") sendControl("shred", current);
		if (!remaining) {
			setGone(true);
			setSrc(null);
		}
		onChanged();
	}
	async function burn(everyone) {
		if (!current) return;
		if (everyone) await sendControl("shred", current);
		await destroyVideo(current.id);
		setGone(true);
		setSrc(null);
		setBurnOpen(false);
		onChanged();
	}
	async function react(emoji) {
		if (!current || current.outgoing) return;
		await addReaction(current.id, emoji);
		sendControl("reaction", current, { emoji });
		setReactOpen(false);
		onChanged();
	}
	async function forwardTo(to) {
		if (!current || !canForward || !to.publicKey) return;
		try {
			const blob = await decryptVideo(current.id);
			const poster = await decryptPoster(current.id);
			const id = crypto.randomUUID();
			await encryptAndStoreVideo({
				id,
				peerId: to.userId,
				senderId: myId,
				recipientId: to.userId,
				blob,
				poster,
				ttlMode: current.ttlMode,
				durationMs: current.durationMs,
				outgoing: true,
				kind: current.kind,
				mimeType: current.mimeType,
				allowSave: current.allowSave,
				captions: current.captions,
				senderHandle: me.handle,
				senderName: me.displayName
			});
			const sealed = await sealClip({
				blob,
				poster,
				header: {
					v: 1,
					purpose: "clip",
					clipId: id,
					kind: current.kind,
					mimeType: current.mimeType,
					durationMs: current.durationMs,
					senderId: myId,
					senderHandle: me.handle,
					senderName: me.displayName,
					allowSave: current.allowSave,
					captions: current.captions,
					ttlMode: current.ttlMode
				}
			});
			await relayPublish({
				recipientId: to.userId,
				ttlMode: current.ttlMode,
				expiresAt: null,
				wrappedKey: await sealed.wrapFor(to.publicKey),
				iv: sealed.iv,
				ciphertext: sealed.ciphertext,
				poster: sealed.poster
			});
			toast(`Forwarded to ${to.displayName}`);
			setForwardOpen(false);
			onChanged();
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not forward");
		}
	}
	async function shareClip() {
		if (!current || !canSave) return;
		try {
			const blob = await decryptVideo(current.id);
			const file = new File([blob], current.kind === "audio" ? "haven.webm" : "haven.webm", { type: blob.type });
			const nav = navigator;
			if (nav.share && navigator.canShare?.({ files: [file] })) await nav.share({
				files: [file],
				title: "Haven clip"
			});
			else toast("Sharing is blocked for this clip");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not share");
		}
	}
	async function downloadClip() {
		if (!current || !canSave) return;
		const blob = await decryptVideo(current.id);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = current.kind === "audio" ? "haven-voice.webm" : "haven-clip.webm";
		a.click();
		window.setTimeout(() => URL.revokeObjectURL(url), 1500);
	}
	function togglePlay() {
		const el = mediaRef.current;
		if (!el) return;
		if (el.paused) {
			el.play();
			setPlaying(true);
		} else {
			el.pause();
			setPlaying(false);
		}
	}
	function skip(dir) {
		const el = mediaRef.current;
		if (!el) return;
		const next = Math.max(0, Math.min(el.duration || 0, el.currentTime + dir * prefs.skipSeconds));
		el.currentTime = next;
		setCurrentTime(next);
		setSkipFlash(`${dir > 0 ? "+" : "−"}${prefs.skipSeconds}s`);
		window.setTimeout(() => setSkipFlash(null), 700);
	}
	function onStagePointer(e) {
		if (notesOpen || menuOpen || reactOpen || burnOpen || forwardOpen) return;
		const now = Date.now();
		const x = e.clientX;
		const prev = lastTap.current;
		lastTap.current = {
			at: now,
			x
		};
		if (prev && now - prev.at < 280) {
			const rect = e.currentTarget.getBoundingClientRect();
			skip(x < rect.left + rect.width / 2 ? -1 : 1);
			return;
		}
		window.setTimeout(() => {
			const latest = lastTap.current;
			if (!latest || latest.at !== now) return;
			togglePlay();
		}, 260);
	}
	function seekTo(ratio) {
		const el = mediaRef.current;
		if (!el || !el.duration) return;
		const next = Math.max(0, Math.min(el.duration, ratio * el.duration));
		el.currentTime = next;
		setCurrentTime(next);
	}
	const forwardTargets = friends.filter((f) => f.status === "accepted" && f.publicKey && f.userId !== peerId && f.userId !== current?.senderId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("player-screen relative flex min-h-dvh flex-col", (prefs.shieldClips || !canSave) && "shield-clips"),
		children: [
			src && !gone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: mediaRef,
				src,
				className: cn("absolute inset-0 size-full object-cover", isAudio && "opacity-0"),
				playsInline: true,
				autoPlay: true,
				muted,
				controls: false,
				disablePictureInPicture: true,
				controlsList: "nodownload noplaybackrate noremoteplayback",
				onContextMenu: (e) => e.preventDefault(),
				onEnded: () => {
					setPlaying(false);
					finished();
				},
				onPlay: () => setPlaying(true),
				onPause: () => setPlaying(false),
				onTimeUpdate: (e) => setCurrentTime(e.currentTarget.currentTime),
				onLoadedMetadata: (e) => {
					setDuration(e.currentTarget.duration || 0);
					e.currentTarget.playbackRate = prefs.playbackRate;
					e.currentTarget.muted = muted;
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 spec" }),
			isAudio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 spec" }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-transparent to-ink/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-[1]",
				onPointerDown: onStagePointer,
				"aria-hidden": "true"
			}),
			isAudio && src && !gone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 z-[2] grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-28 place-items-center rounded-full glass",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-12 text-fog" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-mist",
						children: ["Voice note · ", speedLabel(prefs.playbackRate)]
					})]
				})
			}) : null,
			current?.captions && src && !gone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pointer-events-none absolute inset-x-6 bottom-48 z-[3] rounded-xl bg-ink/55 px-4 py-2 text-center text-sm text-fog",
				children: current.captions
			}) : null,
			skipFlash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 z-[2] grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-ink/55 px-4 py-2 text-sm font-medium tabular-nums text-fog",
					children: skipFlash
				})
			}) : null,
			shielded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-40 grid place-items-center bg-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-8 text-center text-sm text-mist",
					children: "Clip hidden while Haven is in the background."
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "glass",
						size: "icon",
						onClick: onBack,
						"aria-label": "Back",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "text-center",
						onClick: () => setMenuOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: name
						}), current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-mist",
							children: [current.outgoing ? current.theyViewedAt ? "Seen · " : "Sent · " : current.viewedAt ? "Watched · " : "New · ", current.ttlMode === "forever" ? "Keep forever" : current.ttlMode === "view" ? "After viewing" : `${ttlLabel(current.ttlMode)} after watch`]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "glass",
						size: "icon",
						onClick: () => setNotesOpen((v) => !v),
						"aria-label": "Notes",
						className: cn(notes.text.trim() && "shadow-[0_0_0_1.5px_rgb(215_221_230/0.7)]"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookPen, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mt-auto flex flex-col items-center gap-4 px-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
				children: [
					gone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass mx-5 rounded-xl px-5 py-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "mx-auto size-6 text-mist" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: "This clip destroyed itself."
						})]
					}) : null,
					!current && !gone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mist",
						children: "No clips yet. Send the first one."
					}) : null,
					src && !gone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full flex-col gap-3 px-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-[11px] tabular-nums text-mist",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(currentTime) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 0,
									max: 1e3,
									value: duration ? Math.min(1e3, currentTime / duration * 1e3) : 0,
									onChange: (e) => seekTo(Number(e.target.value) / 1e3),
									className: "h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-fog/25 accent-fog",
									"aria-label": "Seek"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(duration) })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "glass",
									size: "icon",
									onClick: () => skip(-1),
									"aria-label": `Skip back ${prefs.skipSeconds} seconds`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "glass",
									size: "icon",
									onClick: togglePlay,
									"aria-label": playing ? "Pause" : "Play",
									children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "glass",
									size: "icon",
									onClick: () => skip(1),
									"aria-label": `Skip forward ${prefs.skipSeconds} seconds`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "glass",
									size: "icon",
									onClick: () => setMuted((m) => !m),
									"aria-label": muted ? "Unmute" : "Mute",
									children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setPrefs({ playbackRate: nextSpeed(prefs.playbackRate) }),
									className: "glass-tight min-h-11 min-w-14 rounded-full px-3 text-sm font-medium tabular-nums",
									"aria-label": "Playback speed",
									children: speedLabel(prefs.playbackRate)
								})
							]
						})]
					}) : null,
					reactionEntries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2 text-sm text-mist",
						children: reactionEntries.map(([emoji, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "glass-tight rounded-full px-2 py-1",
							children: [emoji, n > 1 ? ` ${n}` : ""]
						}, emoji))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full items-center justify-center gap-3 px-5",
						children: [
							current && !current.outgoing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "glass",
								size: "icon",
								onClick: () => setReactOpen((v) => !v),
								"aria-label": "React",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg leading-none",
									children: reactionEntries[0]?.[0] ?? "❤️"
								})
							}) : null,
							current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "glass",
								size: "pill",
								onClick: () => setBurnOpen(true),
								children: "Destroy"
							}) : null,
							canForward ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "glass",
								size: "icon",
								onClick: () => setForwardOpen(true),
								"aria-label": "Forward",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerUpRight, { className: "size-5" })
							}) : null,
							canSave ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "glass",
								size: "icon",
								onClick: () => void shareClip(),
								"aria-label": "Share",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "glass",
								size: "icon",
								onClick: () => void downloadClip(),
								"aria-label": "Save",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" })
							})] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "pill",
								onClick: onReply,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" }), "Reply"]
							})
						]
					}),
					clips.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: railRef,
						className: "clip-rail flex w-full gap-3 overflow-x-auto px-5 pt-1",
						"aria-label": "Clips in this thread",
						children: clips.map((clip, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipThumb, {
							clip,
							index: i,
							active: i === index,
							onPick: () => {
								setIndex(i);
								setGone(false);
							}
						}, clip.id))
					}) : null
				]
			}),
			reactOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass w-full max-w-md rounded-3xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "React"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid grid-cols-6 gap-2",
							children: REACTION_EMOJIS.map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void react(emoji),
								className: "grid h-12 place-items-center rounded-xl bg-glass text-2xl",
								"aria-label": `React ${emoji}`,
								children: emoji
							}, emoji))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							variant: "ghost",
							onClick: () => setReactOpen(false),
							children: "Cancel"
						})
					]
				})
			}) : null,
			burnOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass w-full max-w-md rounded-3xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-medium",
							children: "Destroy this clip"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-mute",
							children: "Just this phone, or send a sealed shred so it vanishes for both of you."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							variant: "glass",
							onClick: () => void burn(false),
							children: "Just on this phone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-2 w-full",
							variant: "danger",
							onClick: () => void burn(true),
							children: "Delete for everyone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-2 w-full",
							variant: "ghost",
							onClick: () => setBurnOpen(false),
							children: "Cancel"
						})
					]
				})
			}) : null,
			forwardOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-3xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-medium",
							children: "Forward"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-mute",
							children: "Re-seals the clip for someone else. They still cannot save it if the sender turned that off."
						}),
						forwardTargets.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-2",
							children: forwardTargets.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void forwardTo(f),
								className: "flex w-full items-center gap-3 rounded-xl bg-glass px-3 py-3 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-10 place-items-center rounded-full bg-fog text-sm font-medium text-accent-fg",
									children: f.displayName.slice(0, 1).toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: f.displayName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-mute",
									children: ["@", f.handle]
								})] })]
							}, f.userId))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-mute",
							children: "No one else to forward to yet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							variant: "ghost",
							onClick: () => setForwardOpen(false),
							children: "Cancel"
						})
					]
				})
			}) : null,
			menuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-3xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-medium",
							children: name
						}),
						safety ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs uppercase tracking-[0.16em] text-mute",
									children: "Safety number"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-mono text-sm leading-6 text-fog",
									children: safety
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-mute",
									children: "Match this with them in person so you know it’s their phone."
								})
							]
						}) : null,
						circle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-xs text-mute",
							children: [
								circle.members.filter((m) => m.status === "member").length,
								" in this group",
								circle.members.some((m) => m.status === "invited") ? ` · ${circle.members.filter((m) => m.status === "invited").length} invited` : ""
							]
						}) : null,
						circle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-4 w-full",
							variant: "glass",
							onClick: () => {
								(async () => {
									if (circle.createdBy === myId) for (const member of circle.members) {
										if (member.userId === myId || !member.publicKey) continue;
										try {
											await sendSealedHeader({
												recipientId: member.userId,
												recipientPublicKey: member.publicKey,
												header: {
													v: 1,
													purpose: "circle-meta",
													groupId: circle.id,
													circleName: circle.name,
													createdBy: myId,
													disbanded: true
												}
											});
										} catch {}
									}
									await removeCircle(circle.id);
									toast(circle.createdBy === myId ? "Group deleted" : "You left the group");
									setMenuOpen(false);
									onBack();
									onChanged();
								})().catch((err) => toast(err instanceof Error ? err.message : "Could not leave"));
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), circle.createdBy === myId ? "Delete group" : "Leave group"]
						}) : null,
						friend ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-4 w-full",
							variant: "danger",
							onClick: () => {
								blockLocal(friend.userId).then(() => {
									toast(`Blocked ${friend.displayName}`);
									setMenuOpen(false);
									onBack();
									onChanged();
								}).catch((err) => toast(err instanceof Error ? err.message : "Could not block"));
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "size-4" }), "Block"]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3 w-full",
							variant: "ghost",
							onClick: () => setMenuOpen(false),
							children: "Close"
						})
					]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesSheet, {
				open: notesOpen,
				text: notes.text,
				onChange: notes.setText,
				onClose: () => setNotesOpen(false),
				onClear: () => void 0,
				peerId
			})
		]
	});
}
function ClipThumb({ clip, index, active, onPick }) {
	const [poster, setPoster] = (0, import_react.useState)(null);
	const isNew = !clip.outgoing && !clip.viewedAt;
	const label = isNew ? "New" : clip.outgoing ? clip.theyViewedAt ? "Seen" : "Sent" : "Watched";
	(0, import_react.useEffect)(() => {
		let url = null;
		let cancelled = false;
		if (clip.kind === "audio") return;
		decryptPoster(clip.id).then((blob) => {
			if (cancelled || !blob) return;
			url = URL.createObjectURL(blob);
			setPoster(url);
		});
		return () => {
			cancelled = true;
			if (url) URL.revokeObjectURL(url);
		};
	}, [clip.id, clip.kind]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-clip-index": index,
		onClick: onPick,
		className: "flex shrink-0 flex-col items-center gap-1",
		"aria-label": `${label} clip ${index + 1}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("relative size-14 overflow-hidden rounded-full bg-ink-2", active ? "orb-ring scale-105" : "opacity-80", isNew && "shadow-[0_0_0_2px_var(--color-fog)]"),
			children: poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: poster,
				alt: "",
				className: "size-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-full items-center justify-center text-mist",
				children: clip.kind === "audio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-5" }) : clip.outgoing ? "You" : ""
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-[10px] font-medium", isNew ? "text-fog" : "text-mute"),
			children: label
		})]
	});
}
function Toggle({ on, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": on,
		onClick,
		className: cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-fog" : "bg-glass"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-1 size-5 rounded-full transition-transform", on ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-fog") })
	});
}
function PrivacyPanel({ profile, onChanged }) {
	const prefs = usePrefs();
	async function syncProfile(partial) {
		await updateProfile({ data: partial });
		onChanged();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass divide-y divide-line overflow-hidden rounded-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Who can find you"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Only someone who already knows your handle or number. We never match on your name."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefSelect, {
					"aria-label": "Discovery",
					value: "handle",
					onChange: () => {
						setPrefs({ discovery: "handle" });
						syncProfile({ discovery: "handle" });
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "handle",
						children: "Handle or number"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Allow saving or sharing my clips"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Off = no download, no share, no forward. Still possible to film the screen."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: prefs.allowSave,
					onClick: () => {
						const allowSave = !prefs.allowSave;
						setPrefs({
							allowSave,
							shieldClips: allowSave ? prefs.shieldClips : true,
							allowForward: allowSave ? prefs.allowForward : false
						});
						syncProfile({ allowSave });
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Allow forwarding"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Forward a clip to someone else only if the sender also allowed saving."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: prefs.allowForward,
					onClick: () => setPrefs({ allowForward: !prefs.allowForward })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Watched receipts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Tell them when you finish a clip. Opt out anytime."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: prefs.sendReceipts,
					onClick: () => {
						const sendReceipts = !prefs.sendReceipts;
						setPrefs({ sendReceipts });
						syncProfile({ sendReceipts });
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Notifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Alert when a new sealed clip arrives."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: prefs.notifications,
					onClick: () => {
						const next = !prefs.notifications;
						setPrefs({ notifications: next });
						if (next) ensureNotifyPermission().then((ok) => {
							if (ok) registerHavenWorker();
							else toast("Notifications are blocked on this phone");
						});
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Quiet hours"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Silence alerts overnight."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: prefs.quietHours,
					onClick: () => setPrefs({ quietHours: !prefs.quietHours })
				})]
			}),
			prefs.quietHours ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputTime, {
					label: "From",
					value: prefs.quietStart,
					onChange: (quietStart) => setPrefs({ quietStart })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputTime, {
					label: "To",
					value: prefs.quietEnd,
					onChange: (quietEnd) => setPrefs({ quietEnd })
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Captions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Live transcript while you record, shown when they watch."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: prefs.captions,
					onClick: () => setPrefs({ captions: !prefs.captions })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Start muted"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Watch at work without sound until you unmute."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: prefs.startMuted,
					onClick: () => setPrefs({ startMuted: !prefs.startMuted })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: "Wi-Fi only upload"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-mute",
					children: "Queue clips until you are on Wi-Fi."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: prefs.wifiOnly,
					onClick: () => setPrefs({ wifiOnly: !prefs.wifiOnly })
				})]
			})
		]
	});
}
function InputTime({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-1 flex-col gap-1 text-xs text-mute",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "time",
			value,
			onChange: (e) => onChange(e.target.value),
			className: "h-11 rounded-lg bg-glass px-3 text-sm text-fog"
		})]
	});
}
/** Compact QR (byte mode, ECC L) for otpauth URLs. */
var GF_EXP = /* @__PURE__ */ new Uint8Array(512);
var GF_LOG = /* @__PURE__ */ new Uint8Array(256);
(function initGf() {
	let x = 1;
	for (let i = 0; i < 255; i += 1) {
		GF_EXP[i] = x;
		GF_LOG[x] = i;
		x <<= 1;
		if (x & 256) x ^= 285;
	}
	for (let i = 255; i < 512; i += 1) GF_EXP[i] = GF_EXP[i - 255];
})();
function gfMul(a, b) {
	if (!a || !b) return 0;
	return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}
function rsGenerator(ec) {
	let poly = new Uint8Array([1]);
	for (let i = 0; i < ec; i += 1) {
		const next = new Uint8Array(poly.length + 1);
		for (let j = 0; j < poly.length; j += 1) {
			next[j] ^= gfMul(poly[j], GF_EXP[i]);
			next[j + 1] ^= poly[j];
		}
		poly = next;
	}
	return poly;
}
function rsEncode(data, ec) {
	const gen = rsGenerator(ec);
	const res = new Uint8Array(data.length + ec);
	res.set(data);
	for (let i = 0; i < data.length; i += 1) {
		const coef = res[i];
		if (!coef) continue;
		for (let j = 0; j < gen.length; j += 1) res[i + j] ^= gfMul(gen[j], coef);
	}
	return res.slice(data.length);
}
var VERSIONS = [
	{
		v: 2,
		modules: 25,
		data: 32,
		ec: 10
	},
	{
		v: 3,
		modules: 29,
		data: 44,
		ec: 15
	},
	{
		v: 4,
		modules: 33,
		data: 64,
		ec: 20
	},
	{
		v: 5,
		modules: 37,
		data: 86,
		ec: 26
	},
	{
		v: 6,
		modules: 41,
		data: 108,
		ec: 18
	},
	{
		v: 7,
		modules: 45,
		data: 124,
		ec: 20
	}
];
function bitPush(bits, val, len) {
	for (let i = len - 1; i >= 0; i -= 1) bits.push(val >>> i & 1);
}
function qrMatrix(text) {
	const bytes = new TextEncoder().encode(text);
	const need = bytes.length + 3;
	const ver = VERSIONS.find((row) => row.data >= need) ?? VERSIONS[VERSIONS.length - 1];
	const bits = [];
	bitPush(bits, 4, 4);
	bitPush(bits, bytes.length, 8);
	for (const b of bytes) bitPush(bits, b, 8);
	bitPush(bits, 0, 4);
	while (bits.length % 8) bits.push(0);
	const data = new Uint8Array(ver.data);
	for (let i = 0; i < ver.data; i += 1) {
		let v = 0;
		for (let b = 0; b < 8; b += 1) v = v << 1 | (bits[i * 8 + b] ?? 0);
		data[i] = i < Math.floor(bits.length / 8) ? v : i % 2 === 0 ? 236 : 17;
	}
	const ecc = rsEncode(data, ver.ec);
	const stream = [...data, ...ecc];
	const n = ver.modules;
	const grid = Array.from({ length: n }, () => Array(n).fill(null));
	function finder(x, y) {
		for (let dy = -1; dy <= 7; dy += 1) for (let dx = -1; dx <= 7; dx += 1) {
			const xx = x + dx;
			const yy = y + dy;
			if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
			const on = dx === -1 || dy === -1 || dx === 7 || dy === 7 ? false : dx === 0 || dy === 0 || dx === 6 || dy === 6 ? true : dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
			grid[yy][xx] = on;
		}
	}
	finder(0, 0);
	finder(n - 7, 0);
	finder(0, n - 7);
	for (let i = 8; i < n - 8; i += 1) {
		grid[6][i] = i % 2 === 0;
		grid[i][6] = i % 2 === 0;
	}
	grid[n - 8][8] = true;
	let bit = 0;
	const total = stream.length * 8;
	const getBit = () => {
		const v = (stream[Math.floor(bit / 8)] ?? 0) >>> 7 - bit % 8 & 1;
		bit += 1;
		return v;
	};
	for (let col = n - 1; col > 0; col -= 2) {
		if (col === 6) col -= 1;
		for (let t = 0; t < n; t += 1) for (let k = 0; k < 2; k += 1) {
			const x = col - k;
			const y = Math.floor((n - 1 - col) / 2) % 2 === 0 ? n - 1 - t : t;
			if (grid[y][x] != null) continue;
			let v = bit < total ? getBit() : 0;
			if ((y + x) % 2 === 0) v ^= 1;
			grid[y][x] = Boolean(v);
		}
	}
	return grid.map((row) => row.map((cell) => Boolean(cell)));
}
function qrSvg(text, size = 192) {
	const m = qrMatrix(text);
	const n = m.length;
	const quiet = 2;
	const dim = n + 4;
	let path = "";
	for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) if (m[y][x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#f4f5f8"/><path fill="#07080c" d="${path}"/></svg>`;
}
function RecoveryPanel({ profile, friends, onChanged }) {
	const accepted = friends.filter((f) => f.status === "accepted");
	const [bundle, setBundle] = (0, import_react.useState)(null);
	const [email, setEmail] = (0, import_react.useState)("");
	const [emailCode, setEmailCode] = (0, import_react.useState)(null);
	const [emergency, setEmergency] = (0, import_react.useState)("");
	const [emergencyCode, setEmergencyCode] = (0, import_react.useState)(null);
	const [totpSecret, setTotpSecret] = (0, import_react.useState)(null);
	const [totpQr, setTotpQr] = (0, import_react.useState)(null);
	const [totpCheck, setTotpCheck] = (0, import_react.useState)("");
	const [totpOn, setTotpOn] = (0, import_react.useState)(profile.totpEnabled);
	const [backupCodes, setBackupCodes] = (0, import_react.useState)(null);
	const [backupLeft, setBackupLeft] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		getRecoveryEmail().then((v) => v && setEmail(v));
		getEmergencyContact().then((v) => v && setEmergency(v));
		loadTotpSecret().then((v) => {
			if (v) setTotpOn(true);
		});
		remainingBackupCodes().then(setBackupLeft);
	}, []);
	async function makePhrase() {
		const next = generatePhrase();
		await persistRecoveryPack(next.phrase, getSessionKeys());
		setBundle(next);
		toast("Phrase created. Haven cannot open this backup.");
	}
	async function saveEmail() {
		if (!email.includes("@")) {
			toast("Enter a real email");
			return;
		}
		await setRecoveryEmail(email);
		const code = generatePhrase().passkey.slice(0, 10);
		setEmailCode(code);
		const pack = await wrapRecoveryPack(code, getSessionKeys());
		await putRecoveryBlob({ data: {
			kind: "email",
			blob: JSON.stringify(pack)
		} });
		await updateProfile({ data: { recoveryEmailHash: await hashContactEmail(email) } });
		onChanged();
		toast("Recovery email saved. Haven cannot read the code.");
	}
	async function startTotp() {
		const secret = randomTotpSecret();
		const url = otpauthUrl(secret, profile.handle);
		setTotpSecret(secret);
		setTotpQr(qrSvg(url));
		setBackupCodes(null);
	}
	async function confirmTotp() {
		if (!totpSecret) return;
		if (!await totpValid(totpSecret, totpCheck)) {
			toast("That code did not match");
			return;
		}
		const codes = generateBackupCodes();
		await storeTotpSecret(totpSecret);
		await storeBackupCodes(codes);
		await updateProfile({ data: { totpEnabled: true } });
		setTotpOn(true);
		setBackupCodes(codes);
		setBackupLeft(codes.length);
		toast("Authenticator is on. Save your backup codes.");
		onChanged();
	}
	async function rotateBackupCodes() {
		const codes = generateBackupCodes();
		await storeBackupCodes(codes);
		setBackupCodes(codes);
		setBackupLeft(codes.length);
		toast("New backup codes. The old ones no longer work.");
	}
	async function saveEmergency() {
		if (!emergency) {
			toast("Pick someone you trust");
			return;
		}
		await setEmergencyContact(emergency);
		const next = generatePhrase();
		const pack = await wrapRecoveryPack(next.passkey, getSessionKeys());
		await putRecoveryBlob({ data: {
			kind: "emergency",
			blob: JSON.stringify(pack)
		} });
		setEmergencyCode(next.passkey);
		toast("Give them this code in person. Haven cannot open the packet.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass space-y-5 rounded-2xl p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Recovery phrase"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-mute",
					children: "Sixteen words. This backup cannot be opened by Haven — only by you."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-3 w-full",
					variant: "glass",
					onClick: () => void makePhrase(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), "Create phrase"]
				}),
				bundle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl bg-ink-2 px-3 py-3 font-mono text-sm leading-6 text-fog",
							children: bundle.phrase
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-mute",
							children: ["Passkey code: ", bundle.passkey]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "glass",
								className: "flex-1",
								onClick: () => {
									navigator.clipboard.writeText(bundle.phrase);
									toast("Copied. Store it offline.");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "glass",
								className: "flex-1",
								onClick: () => downloadText("haven-recovery.txt", recoveryFileBody(bundle)),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download"]
							})]
						})
					]
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Email recovery"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-mute",
					children: "We store only a sealed blob. The code is for you — production emails it; this preview shows it once."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-2",
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@family.com"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-2 w-full",
					variant: "glass",
					onClick: () => void saveEmail(),
					children: "Save recovery email"
				}),
				emailCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-mono text-sm text-fog",
					children: ["Recovery code (shown once): ", emailCode]
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Authenticator app"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-mute",
					children: "Any TOTP app. Scan the QR or paste the secret. Keep the backup codes somewhere only you can reach."
				}),
				totpOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [
						backupCodes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-ink-2 px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-mute",
									children: "Backup codes — shown once. Each works one time."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 grid grid-cols-2 gap-2 font-mono text-sm text-fog",
									children: backupCodes.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: code }, code))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "glass",
										className: "flex-1",
										onClick: () => {
											navigator.clipboard.writeText(backupCodes.join("\n"));
											toast("Copied backup codes");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "glass",
										className: "flex-1",
										onClick: () => downloadText("haven-2fa-backup.txt", `Haven authenticator backup codes\n\n${backupCodes.join("\n")}\n`),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download"]
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-mute",
							children: backupLeft ? `${backupLeft} backup code${backupLeft === 1 ? "" : "s"} left. Generate new ones if you lost the list.` : "No backup codes left. Generate a new set."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							variant: "glass",
							onClick: () => void rotateBackupCodes(),
							children: "Generate new backup codes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							variant: "ghost",
							onClick: () => {
								clearTotpSecret();
								updateProfile({ data: { totpEnabled: false } });
								setTotpOn(false);
								setBackupCodes(null);
								setBackupLeft(0);
								toast("Authenticator off");
							},
							children: "Remove 2FA"
						})
					]
				}) : totpSecret && totpQr ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto w-48 overflow-hidden rounded-xl bg-fog p-2",
							dangerouslySetInnerHTML: { __html: totpQr }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-xs text-mute",
							children: "Scan this QR, or paste the secret below into any authenticator."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-all rounded-xl bg-ink-2 px-3 py-2 text-center font-mono text-xs text-fog",
							children: totpSecret
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "glass",
							className: "w-full",
							onClick: () => {
								navigator.clipboard.writeText(totpSecret);
								toast("Secret copied");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy secret"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "numeric",
							placeholder: "Code from your app",
							value: totpCheck,
							onChange: (e) => setTotpCheck(e.target.value),
							maxLength: 6
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: () => void confirmTotp(),
							children: "Confirm"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-2 w-full",
					variant: "glass",
					onClick: () => void startTotp(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-4" }), "Set up authenticator"]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Emergency contact"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-mute",
					children: "They hold a sealed packet that can restore your vault. Haven cannot open it."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "mt-2 h-11 w-full rounded-lg bg-glass px-3 text-sm",
					value: emergency,
					onChange: (e) => setEmergency(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Choose someone"
					}), accepted.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: f.userId,
						children: f.displayName
					}, f.userId))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-2 w-full",
					variant: "glass",
					onClick: () => void saveEmergency(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }), "Save emergency contact"]
				}),
				emergencyCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 break-all font-mono text-sm text-fog",
					children: ["Tell them this code in person: ", emergencyCode]
				}) : null
			] })
		]
	});
}
function YouScreen({ profile, friends, onChanged }) {
	const prefs = usePrefs();
	const [tab, setTab] = (0, import_react.useState)("profile");
	const [name, setName] = (0, import_react.useState)(profile.displayName);
	const [handle, setHandle] = (0, import_react.useState)(profile.handle);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [ttl, setTtl] = (0, import_react.useState)(profile.defaultTtl);
	const [pin, setPin] = (0, import_react.useState)("");
	const [showPin, setShowPin] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [lock, setLock] = (0, import_react.useState)({
		hasPasscode: false,
		hasBiometric: false
	});
	(0, import_react.useEffect)(() => {
		getLockConfig().then((cfg) => setLock({
			hasPasscode: Boolean(cfg?.hasPasscode),
			hasBiometric: Boolean(cfg?.hasBiometric)
		}));
	}, []);
	async function saveProfile() {
		const nextHandle = handle.trim().toLowerCase();
		if (!/^[a-z0-9]{3,20}$/.test(nextHandle)) {
			toast("Handle must be 3–20 letters or numbers");
			return;
		}
		setBusy(true);
		try {
			await saveIdentity({
				handle: nextHandle,
				displayName: name.trim()
			});
			await updateProfile({ data: {
				defaultTtl: ttl,
				phone: phone ? normalizePhone(phone) : void 0,
				handleHash: await hashHandle(nextHandle)
			} });
			toast("Profile saved");
			onChanged();
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not save");
		} finally {
			setBusy(false);
		}
	}
	async function saveTtl(next) {
		setTtl(next);
		try {
			await updateProfile({ data: { defaultTtl: next } });
			onChanged();
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not save lifetime");
		}
	}
	const nativeCloud = CLOUD_OPTIONS.find((o) => o.id === prefs.cloudTarget)?.native === true;
	async function onCloudTarget(next) {
		setPrefs({ cloudTarget: next });
		if (next === "device") {
			await clearSyncedFolder().catch(() => void 0);
			return;
		}
		if (next === "folder" || nativeCloud || [
			"icloud",
			"proton",
			"gdrive",
			"onedrive"
		].includes(next)) {
			if (!folderPickerAvailable() && next !== "file") {
				toast("This browser cannot open a folder. Use a backup file until native sync lands.");
				return;
			}
			if (next === "folder") try {
				await pickSyncedFolder();
				toast("Encrypted backups will write to that folder");
			} catch (err) {
				const message = err instanceof Error ? err.message : "Could not open folder";
				if (!/abort|cancel/i.test(message)) toast(message);
			}
		}
	}
	async function removeAccount() {
		if (confirmDelete !== "DELETE") return;
		setBusy(true);
		try {
			await deleteAccount({ data: { confirm: "DELETE" } });
			await destroyLocalVault();
			await signOut("/login");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not delete account");
			setBusy(false);
		}
	}
	const showFolderTools = prefs.cloudTarget === "folder" || nativeCloud;
	const showFileTools = prefs.cloudTarget === "file" || nativeCloud;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8 px-5 pb-32 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: "You"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-mute",
					children: ["@", profile.handle]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-1 rounded-full glass p-1",
				children: [
					["profile", "Profile"],
					["privacy", "Privacy"],
					["security", "Security"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: cn("h-10 rounded-full text-sm font-medium transition-colors", tab === id ? "bg-fog text-accent-fg" : "text-mist"),
					children: label
				}, id))
			}),
			tab === "privacy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass rounded-2xl p-4 spec",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.16em] text-mute",
						children: "Encryption"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mist",
						children: "Clips, captions, who sent them, who you added, and group names are sealed on this phone. Haven’s mailbox only holds ciphertext it cannot open — not even who sent a clip. We cannot play, transcribe, or recover your videos."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.16em] text-mute",
						children: "Privacy & security"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivacyPanel, {
						profile,
						onChanged
					})]
				})]
			}) : null,
			tab === "security" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.16em] text-mute",
							children: "Recovery"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecoveryPanel, {
							profile,
							friends,
							onChanged
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.16em] text-mute",
								children: "Device lock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "glass rounded-2xl p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5 text-mist" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: "Passcode"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-mute",
											children: lock.hasPasscode ? "Encrypts your vault" : "Not set"
										})] })]
									}), lock.hasPasscode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => void clearPasscode().then(() => {
											setLock((s) => ({
												...s,
												hasPasscode: false
											}));
											toast("Passcode removed");
										}),
										children: "Remove"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "glass",
										onClick: () => setShowPin(true),
										children: "Set"
									})]
								}), showPin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinPad, {
										value: pin,
										onChange: (next) => {
											setPin(next);
											if (next.length === 6) setPasscode(next).then(() => {
												setLock((s) => ({
													...s,
													hasPasscode: true
												}));
												setShowPin(false);
												setPin("");
												toast("Passcode saved");
											}).catch((err) => toast(err instanceof Error ? err.message : "Could not set passcode"));
										}
									})
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "glass rounded-2xl p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-5 text-mist" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: "Face ID"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-mute",
											children: lock.hasBiometric ? "On for this device" : "Off"
										})] })]
									}), lock.hasBiometric ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => void disableBiometric().then(() => setLock((s) => ({
											...s,
											hasBiometric: false
										}))),
										children: "Remove"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "glass",
										disabled: !biometricAvailable(),
										onClick: () => void registerBiometric().then(() => {
											setLock((s) => ({
												...s,
												hasBiometric: true
											}));
											toast("Face ID enabled");
										}).catch((err) => toast(err instanceof Error ? err.message : "Could not enable Face ID")),
										children: "Enable"
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.16em] text-danger",
							children: "Delete account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl p-4 shadow-[0_0_0_1px_rgb(226_85_85/0.35)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-mist",
									children: "Permanently erases your profile, friendships, sealed envelopes, and the local vault on this device. Type DELETE to confirm."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-3",
									value: confirmDelete,
									onChange: (e) => setConfirmDelete(e.target.value.toUpperCase()),
									placeholder: "DELETE"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "mt-3 w-full",
									variant: "danger",
									disabled: confirmDelete !== "DELETE" || busy,
									onClick: () => void removeAccount(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete my account"]
								})
							]
						})]
					})
				]
			}) : null,
			tab === "profile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.16em] text-mute",
							children: "Profile"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							maxLength: 40
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: handle,
							onChange: (e) => setHandle(e.target.value),
							maxLength: 20
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "tel",
							placeholder: profile.hasPhone ? "Mobile number on file" : "Add a mobile number",
							value: phone,
							onChange: (e) => setPhone(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => void saveProfile(),
							disabled: busy,
							className: "w-full",
							children: "Save profile"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.16em] text-mute",
						children: "Preferences"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass divide-y divide-line overflow-hidden rounded-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: "Appearance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-mute",
									children: "Follow this phone, or lock light or dark."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-3 gap-1 rounded-lg bg-glass p-1",
									children: THEME_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setPrefs({ theme: opt.id }),
										className: cn("h-10 rounded-md text-sm font-medium transition-colors", prefs.theme === opt.id ? "bg-accent text-accent-fg" : "text-mist"),
										children: opt.label
									}, opt.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between gap-4 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: "Skip interval"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-mute",
									children: "Jump this far while watching."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefSelect, {
									"aria-label": "Skip interval",
									value: String(prefs.skipSeconds),
									onChange: (e) => setPrefs({ skipSeconds: Number(e.target.value) }),
									children: SKIP_OPTIONS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: n,
										children: skipLabel(n)
									}, n))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between gap-4 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: "Playback speed"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-mute",
									children: "Default when a clip starts. You can still change it while watching."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefSelect, {
									"aria-label": "Playback speed",
									value: String(prefs.playbackRate),
									onChange: (e) => setPrefs({ playbackRate: Number(e.target.value) }),
									children: SPEED_OPTIONS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: n,
										children: speedLabel(n)
									}, n))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between gap-4 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: "Default lifetime"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-mute",
									children: ttlHint(ttl) || "Timer starts after they watch, not when you send."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefSelect, {
									"aria-label": "Default lifetime",
									value: ttl,
									onChange: (e) => void saveTtl(e.target.value),
									children: TTL_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: opt.id,
										children: opt.label
									}, opt.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between gap-4 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: "Clip shield"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-mute",
									children: "Hide clips if you leave Haven. Blocks save menus. Screenshots on some phones cannot be fully stopped."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "switch",
									"aria-checked": prefs.shieldClips,
									onClick: () => setPrefs({ shieldClips: !prefs.shieldClips }),
									className: cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", prefs.shieldClips ? "bg-fog" : "bg-glass"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-1 size-5 rounded-full transition-transform", prefs.shieldClips ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-fog") })
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.16em] text-mute",
						children: "Cloud & mailbox"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass divide-y divide-line overflow-hidden rounded-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between gap-4 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: "Sync"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-mute",
									children: "Where a sealed copy can live if you keep clips forever."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefSelect, {
									"aria-label": "Cloud sync",
									value: prefs.cloudTarget,
									onChange: (e) => void onCloudTarget(e.target.value),
									children: CLOUD_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: opt.id,
										children: opt.label
									}, opt.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-4 py-3 text-xs text-mute",
								children: CLOUD_OPTIONS.find((o) => o.id === prefs.cloudTarget)?.hint
							}),
							nativeCloud ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "px-4 py-3 text-xs text-mist",
								children: [
									"Native ",
									CLOUD_OPTIONS.find((o) => o.id === prefs.cloudTarget)?.label,
									" sign-in ships with the phone app. On the web, pick a folder that cloud already syncs, or save a backup file."
								]
							}) : null,
							showFolderTools ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "glass",
									className: "flex-1",
									disabled: busy,
									onClick: () => void pickSyncedFolder().then(() => toast("Folder linked. Backups stay encrypted.")).catch((err) => toast(err instanceof Error ? err.message : "Could not open folder")),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "size-4" }), folderPickerAvailable() ? "Choose folder" : "Not on this browser"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "glass",
									onClick: () => void restoreFromFolder().then((n) => toast(`Restored ${n} clips`)).catch((err) => toast(err instanceof Error ? err.message : "Nothing to restore")),
									children: "Restore"
								})]
							}) : null,
							showFileTools ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "glass",
									className: "flex-1",
									onClick: () => void downloadBackupFile().then(() => toast("Encrypted backup saved")).catch((err) => toast(err instanceof Error ? err.message : "Could not export")),
									children: "Download backup"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: ".haven,application/octet-stream",
										className: "hidden",
										onChange: (e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											restoreBackupBlob(file).then((n) => {
												toast(`Restored ${n} clips`);
												onChanged();
											}).catch((err) => toast(err instanceof Error ? err.message : "Could not restore"));
										}
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex h-11 w-full items-center justify-center rounded-full glass text-sm font-medium",
										children: "Restore file"
									})]
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between gap-4 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: "Sealed copies on Haven"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-mute",
									children: RELAY_OPTIONS.find((o) => o.id === prefs.relayMode)?.hint
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefSelect, {
									"aria-label": "Mailbox retention",
									className: "w-44",
									value: prefs.relayMode,
									onChange: (e) => setPrefs({ relayMode: e.target.value }),
									children: RELAY_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: opt.id,
										children: opt.label
									}, opt.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-4 py-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "glass",
									className: "w-full",
									disabled: busy,
									onClick: () => void relayShredMine().then((res) => toast(`Removed ${res.removed} sealed copies from Haven`)).catch((err) => toast(err instanceof Error ? err.message : "Could not shred")),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "size-4" }), "Delete my sealed copies now"]
								})
							})
						]
					})]
				})
			] }) : null
		]
	});
}
function HavenApp() {
	const session = useHavenSession();
	const [tab, setTab] = (0, import_react.useState)("home");
	const [threadId, setThreadId] = (0, import_react.useState)(null);
	const [cameraFor, setCameraFor] = (0, import_react.useState)(null);
	const [threadVideos, setThreadVideos] = (0, import_react.useState)([]);
	const { user, isPending, profile, needsLock, lockKnown, unlocked, friends, circles, videos, latest } = session;
	const myInbox = videos.filter((v) => !v.outgoing && !v.viewedAt).length;
	const threadName = (0, import_react.useMemo)(() => {
		const id = threadId ?? cameraFor;
		if (!id || id === "self") return "You";
		const gid = parseGroupId(id);
		if (gid) return circles.find((c) => c.id === gid)?.name ?? "Group";
		return friends.find((f) => f.userId === id)?.displayName ?? "Friend";
	}, [
		threadId,
		cameraFor,
		friends,
		circles
	]);
	async function openThread(peerId) {
		setThreadVideos(await videosForPeer(peerId));
		setThreadId(peerId);
	}
	async function sendClip(payload) {
		if (!user || !profile) return;
		const peerId = cameraFor ?? "self";
		const id = crypto.randomUUID();
		const groupId = parseGroupId(peerId);
		const circle = groupId ? circles.find((c) => c.id === groupId) : null;
		const recipientId = peerId === "self" ? user.id : groupId ? groupPeerId(groupId) : peerId;
		const kind = payload.kind === "audio" ? "audio" : "video";
		const prefs = readPrefs();
		const header = {
			v: 1,
			purpose: "clip",
			clipId: id,
			kind,
			mimeType: payload.mimeType,
			durationMs: payload.durationMs,
			senderId: user.id,
			senderHandle: profile.handle,
			senderName: profile.displayName,
			allowSave: prefs.allowSave,
			groupId,
			captions: payload.captions,
			ttlMode: payload.ttl
		};
		await encryptAndStoreVideo({
			id,
			peerId,
			senderId: user.id,
			recipientId,
			blob: payload.blob,
			poster: payload.poster,
			ttlMode: payload.ttl,
			durationMs: payload.durationMs,
			outgoing: true,
			kind,
			mimeType: payload.mimeType,
			groupId,
			allowSave: prefs.allowSave,
			captions: payload.captions,
			senderHandle: profile.handle,
			senderName: profile.displayName
		});
		const expiresAt = null;
		async function publishOrQueue(seal) {
			const ready = await canSendNow(prefs.wifiOnly);
			if (!ready.ok) {
				await queueSeal(seal);
				toast(ready.reason === "wifi" ? "Queued until you’re on Wi-Fi" : "Queued. We’ll send when you’re back online.");
				return;
			}
			await relayPublish(seal);
		}
		if (circle) {
			const others = circle.members.filter((m) => m.userId !== user.id && m.publicKey && m.status === "member");
			if (!others.length) throw new Error("Waiting for people to accept this group");
			const sealed = await sealClip({
				blob: payload.blob,
				poster: payload.poster,
				header
			});
			for (const member of others) await publishOrQueue({
				recipientId: member.userId,
				ttlMode: payload.ttl,
				expiresAt,
				wrappedKey: await sealed.wrapFor(member.publicKey),
				iv: sealed.iv,
				ciphertext: sealed.ciphertext,
				poster: sealed.poster
			});
		} else if (peerId !== "self" && !isGroupPeer(peerId)) {
			const friend = friends.find((f) => f.userId === peerId);
			if (!friend?.publicKey) throw new Error("They have not opened Haven on a device yet");
			const sealed = await sealClip({
				blob: payload.blob,
				poster: payload.poster,
				header
			});
			await publishOrQueue({
				recipientId: peerId,
				ttlMode: payload.ttl,
				expiresAt,
				wrappedKey: await sealed.wrapFor(friend.publicKey),
				iv: sealed.iv,
				ciphertext: sealed.ciphertext,
				poster: sealed.poster
			});
		}
		await session.refreshVideos();
		setCameraFor(null);
		await openThread(peerId);
	}
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HavenMark, { subtitle: "Private video for the people you love." })]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!lockKnown) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HavenMark, { subtitle: "Opening on this device…" })]
	});
	if (needsLock) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "haven-bg min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockScreen, { onUnlocked: () => {
			session.setUnlocked(true);
			session.openVault();
		} })]
	});
	if (!unlocked || !profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 haven-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mute",
				children: "Opening your vault…"
			}),
			session.vaultError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: session.vaultError
			}) : null
		]
	});
	if (!profile.setupComplete) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "haven-bg min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupFlow, {
			displayName: profile.displayName,
			handle: profile.handle,
			onDone: () => session.invalidate()
		})]
	});
	if (cameraFor) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Recorder, {
		toName: threadName,
		peerId: cameraFor,
		defaultTtl: profile.defaultTtl,
		onCancel: () => setCameraFor(null),
		onSend: sendClip
	});
	if (threadId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadView, {
		peerId: threadId,
		name: threadName,
		videos: threadVideos,
		friends,
		circles,
		myId: user.id,
		me: profile,
		onBack: () => setThreadId(null),
		onReply: () => {
			setCameraFor(threadId);
			setThreadId(null);
		},
		onChanged: () => {
			videosForPeer(threadId).then(setThreadVideos);
			session.refreshVideos();
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "haven-bg min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto min-h-dvh w-full max-w-md",
			children: [
				tab === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, {
					meName: profile.displayName,
					friends,
					circles,
					latest,
					videos,
					myId: user.id,
					onOpen: (id) => void openThread(id),
					onRecordSelf: () => setCameraFor(SELF_PEER)
				}) : null,
				tab === "people" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleScreen, {
					friends,
					circles,
					myId: user.id,
					me: profile,
					onOpen: (id) => void openThread(id),
					onChanged: () => session.invalidate()
				}) : null,
				tab === "you" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YouScreen, {
					profile,
					friends,
					onChanged: () => session.invalidate()
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBar, {
					tab,
					onTab: setTab,
					onCamera: () => setCameraFor(SELF_PEER),
					inboxCount: myInbox
				})
			]
		})]
	});
}
var SplitComponent = HavenApp;
//#endregion
export { SplitComponent as component };
