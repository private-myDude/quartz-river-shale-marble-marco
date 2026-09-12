import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import "./client-C_SNNFs7.mjs";
import { y as useCurrentUser } from "./button-DbxQEyOR.mjs";
import { i as hasGateSessionMarker } from "./server-DXwPVsNE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bytes-DRfG6po7.js
var bytes_DRfG6po7_exports = /* @__PURE__ */ __exportAll({
	a: () => randomBytes,
	i: () => bytes_exports,
	n: () => b64ToBuf,
	o: () => utf8,
	r: () => bufToB64,
	t: () => asBytes
});
var bytes_exports = /* @__PURE__ */ __exportAll$1({
	asBytes: () => asBytes,
	b64ToBuf: () => b64ToBuf,
	bufToB64: () => bufToB64,
	randomBytes: () => randomBytes,
	utf8: () => utf8
});
function bufToB64(buffer) {
	const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
	let binary = "";
	const chunk = 32768;
	for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	return btoa(binary);
}
function b64ToBuf(value) {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
	return bytes.buffer;
}
function randomBytes(length) {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return bytes;
}
function utf8(value) {
	return new TextEncoder().encode(value);
}
function asBytes(data) {
	if (data instanceof Uint8Array) return data;
	return new Uint8Array(data);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/crypto-Bq-MJeFl.js
var crypto_Bq_MJeFl_exports = /* @__PURE__ */ __exportAll({
	a: () => exportPrivateKey,
	c: () => importPrivateKey,
	d: () => unwrapVideoKey,
	f: () => wrapVideoKeyForRecipient,
	i: () => encryptBuffer,
	l: () => importPublicKey,
	n: () => decryptBuffer,
	o: () => generateAesKey,
	r: () => derivePasscodeKey,
	s: () => generateIdentityKeyPair,
	t: () => crypto_exports,
	u: () => sha256Hex
});
var crypto_exports = /* @__PURE__ */ __exportAll$1({
	decryptBuffer: () => decryptBuffer,
	derivePasscodeKey: () => derivePasscodeKey,
	encryptBuffer: () => encryptBuffer,
	exportPrivateKey: () => exportPrivateKey,
	exportPublicKey: () => exportPublicKey,
	generateAesKey: () => generateAesKey,
	generateIdentityKeyPair: () => generateIdentityKeyPair,
	hashPasscode: () => hashPasscode,
	importPrivateKey: () => importPrivateKey,
	importPublicKey: () => importPublicKey,
	sha256Hex: () => sha256Hex,
	unwrapVideoKey: () => unwrapVideoKey,
	wrapVideoKeyForRecipient: () => wrapVideoKeyForRecipient
});
var EC_ALG = {
	name: "ECDH",
	namedCurve: "P-256"
};
var AES_ALG = {
	name: "AES-GCM",
	length: 256
};
var PBKDF2_ITERS = 21e4;
var WRAP_INFO = utf8("haven-envelope-v1");
async function generateIdentityKeyPair() {
	return crypto.subtle.generateKey(EC_ALG, true, ["deriveBits"]);
}
async function exportPublicKey(key) {
	return bufToB64(await crypto.subtle.exportKey("spki", key));
}
async function importPublicKey(spkiB64) {
	return crypto.subtle.importKey("spki", b64ToBuf(spkiB64), EC_ALG, true, []);
}
async function exportPrivateKey(key) {
	return bufToB64(await crypto.subtle.exportKey("pkcs8", key));
}
async function importPrivateKey(pkcs8B64) {
	return crypto.subtle.importKey("pkcs8", b64ToBuf(pkcs8B64), EC_ALG, true, ["deriveBits"]);
}
async function generateAesKey(extractable = true) {
	return crypto.subtle.importKey("raw", randomBytes(32), AES_ALG, extractable, ["encrypt", "decrypt"]);
}
async function derivePasscodeKey(passcode, salt) {
	const base = await crypto.subtle.importKey("raw", utf8(passcode), "PBKDF2", false, ["deriveKey"]);
	return crypto.subtle.deriveKey({
		name: "PBKDF2",
		salt: asBytes(salt),
		iterations: PBKDF2_ITERS,
		hash: "SHA-256"
	}, base, AES_ALG, false, ["encrypt", "decrypt"]);
}
async function encryptBuffer(key, data) {
	const iv = randomBytes(12);
	const ciphertext = await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv
	}, key, asBytes(data));
	return {
		iv: iv.buffer,
		ciphertext
	};
}
async function decryptBuffer(key, iv, ciphertext) {
	return crypto.subtle.decrypt({
		name: "AES-GCM",
		iv: asBytes(iv)
	}, key, ciphertext);
}
async function ecdhAesKey(privateKey, publicKey) {
	const bits = await crypto.subtle.deriveBits({
		name: "ECDH",
		public: publicKey
	}, privateKey, 256);
	const hkdf = await crypto.subtle.importKey("raw", bits, "HKDF", false, ["deriveKey"]);
	return crypto.subtle.deriveKey({
		name: "HKDF",
		hash: "SHA-256",
		salt: randomBytes(32),
		info: WRAP_INFO
	}, hkdf, AES_ALG, false, ["encrypt", "decrypt"]);
}
async function wrapVideoKeyForRecipient(videoKey, recipientPublic) {
	const ephemeral = await generateIdentityKeyPair();
	const { iv, ciphertext } = await encryptBuffer(await ecdhAesKey(ephemeral.privateKey, recipientPublic), await crypto.subtle.exportKey("raw", videoKey));
	const payload = {
		ephemeralPublic: await exportPublicKey(ephemeral.publicKey),
		iv: bufToB64(iv),
		ciphertext: bufToB64(ciphertext)
	};
	return JSON.stringify(payload);
}
async function unwrapVideoKey(wrappedJson, recipientPrivate) {
	const wrapped = JSON.parse(wrappedJson);
	const raw = await decryptBuffer(await ecdhAesKey(recipientPrivate, await importPublicKey(wrapped.ephemeralPublic)), b64ToBuf(wrapped.iv), b64ToBuf(wrapped.ciphertext));
	return crypto.subtle.importKey("raw", raw, AES_ALG, true, ["encrypt", "decrypt"]);
}
async function hashPasscode(passcode, salt) {
	const key = await derivePasscodeKey(passcode, salt);
	return bufToB64(await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv: randomBytes(12)
	}, key, utf8("haven-lock")));
}
async function sha256Hex(value) {
	const digest = await crypto.subtle.digest("SHA-256", utf8(value));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/idb-C6QQNckv.js
var idb_C6QQNckv_exports = /* @__PURE__ */ __exportAll({
	a: () => kvGet,
	c: () => putVideo,
	i: () => kvDel,
	l: () => wipeVault,
	n: () => getVideo,
	o: () => kvSet,
	r: () => idb_exports,
	s: () => listVideos,
	t: () => deleteVideo
});
var idb_exports = /* @__PURE__ */ __exportAll$1({
	deleteVideo: () => deleteVideo,
	getVideo: () => getVideo,
	kvDel: () => kvDel,
	kvGet: () => kvGet,
	kvSet: () => kvSet,
	listVideos: () => listVideos,
	putVideo: () => putVideo,
	wipeVault: () => wipeVault
});
var DB_NAME = "haven-vault";
var DB_VERSION = 1;
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onerror = () => reject(req.error);
		req.onsuccess = () => resolve(req.result);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
			if (!db.objectStoreNames.contains("videos")) {
				const videos = db.createObjectStore("videos", { keyPath: "id" });
				videos.createIndex("peerId", "peerId", { unique: false });
				videos.createIndex("createdAt", "createdAt", { unique: false });
			}
		};
	});
}
function reqToPromise(req) {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function kvGet(key) {
	const db = await openDb();
	try {
		return await reqToPromise(db.transaction("kv", "readonly").objectStore("kv").get(key));
	} finally {
		db.close();
	}
}
async function kvSet(key, value) {
	const db = await openDb();
	try {
		await reqToPromise(db.transaction("kv", "readwrite").objectStore("kv").put(value, key));
	} finally {
		db.close();
	}
}
async function kvDel(key) {
	const db = await openDb();
	try {
		await reqToPromise(db.transaction("kv", "readwrite").objectStore("kv").delete(key));
	} finally {
		db.close();
	}
}
async function putVideo(video) {
	const db = await openDb();
	try {
		await reqToPromise(db.transaction("videos", "readwrite").objectStore("videos").put(video));
	} finally {
		db.close();
	}
}
async function getVideo(id) {
	const db = await openDb();
	try {
		return await reqToPromise(db.transaction("videos", "readonly").objectStore("videos").get(id));
	} finally {
		db.close();
	}
}
async function deleteVideo(id) {
	const db = await openDb();
	try {
		await reqToPromise(db.transaction("videos", "readwrite").objectStore("videos").delete(id));
	} finally {
		db.close();
	}
}
async function listVideos() {
	const db = await openDb();
	try {
		return await reqToPromise(db.transaction("videos", "readonly").objectStore("videos").getAll());
	} finally {
		db.close();
	}
}
async function wipeVault() {
	await new Promise((resolve, reject) => {
		const req = indexedDB.deleteDatabase(DB_NAME);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
		req.onblocked = () => resolve();
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/graph-local-CzAMWcA8.js
var graph_local_CzAMWcA8_exports = /* @__PURE__ */ __exportAll({
	A: () => getSessionKeys,
	B: () => unlockWithBiometric,
	C: () => clearPasscode,
	D: () => disableBiometric,
	E: () => destroyLocalVault,
	F: () => registerBiometric,
	H: () => unlockWithPhrase,
	I: () => remainingBackupCodes,
	L: () => setPasscode,
	M: () => loadTotpSecret,
	N: () => lockSession,
	O: () => generateBackupCodes,
	P: () => lock_exports,
	R: () => storeBackupCodes,
	S: () => bootstrapVault,
	T: () => consumeBackupCode,
	V: () => unlockWithPasscode,
	_: () => sealToKv,
	a: () => loadCircles,
	b: () => UserButton,
	c: () => outgoingIds,
	d: () => removeFriend,
	f: () => saveCircle,
	g: () => upsertFriend,
	h: () => toCircleMembers,
	i: () => isBlocked,
	j: () => isUnlocked,
	k: () => getLockConfig,
	l: () => rememberOutgoing,
	m: () => suggestHandle,
	n: () => blockLocal,
	o: () => loadFriends,
	p: () => saveIdentity,
	r: () => consumePendingInvite,
	s: () => loadIdentity,
	t: () => PENDING_INVITE_KEY,
	u: () => removeCircle,
	v: () => unsealFromKv,
	w: () => clearTotpSecret,
	x: () => biometricAvailable,
	y: () => RedirectToSignIn,
	z: () => storeTotpSecret
});
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lock_exports = /* @__PURE__ */ __exportAll$1({
	biometricAvailable: () => biometricAvailable,
	bootstrapVault: () => bootstrapVault,
	clearPasscode: () => clearPasscode,
	clearTotpSecret: () => clearTotpSecret,
	consumeBackupCode: () => consumeBackupCode,
	destroyLocalVault: () => destroyLocalVault,
	disableBiometric: () => disableBiometric,
	generateBackupCodes: () => generateBackupCodes,
	getLockConfig: () => getLockConfig,
	getSessionKeys: () => getSessionKeys,
	isUnlocked: () => isUnlocked,
	loadTotpSecret: () => loadTotpSecret,
	lockSession: () => lockSession,
	registerBiometric: () => registerBiometric,
	remainingBackupCodes: () => remainingBackupCodes,
	setPasscode: () => setPasscode,
	storeBackupCodes: () => storeBackupCodes,
	storeTotpSecret: () => storeTotpSecret,
	unlockWithBiometric: () => unlockWithBiometric,
	unlockWithPasscode: () => unlockWithPasscode,
	unlockWithPhrase: () => unlockWithPhrase
});
var LOCK_KEY = "lock";
var IDENTITY_KEY$1 = "identity";
var VAULT_WRAP_KEY = "vaultWrap";
var sessionVaultKey = null;
var sessionPrivateKey = null;
var sessionPublicB64 = null;
function isUnlocked() {
	return sessionVaultKey != null && sessionPrivateKey != null;
}
function getSessionKeys() {
	if (!sessionVaultKey || !sessionPrivateKey || !sessionPublicB64) throw new Error("Vault is locked");
	return {
		vaultKey: sessionVaultKey,
		privateKey: sessionPrivateKey,
		publicKey: sessionPublicB64
	};
}
function lockSession() {
	sessionVaultKey = null;
	sessionPrivateKey = null;
	sessionPublicB64 = null;
}
async function getLockConfig() {
	return await kvGet(LOCK_KEY) ?? null;
}
async function persistIdentity(privateKey, publicKey, vaultKey) {
	const pkcs8 = await exportPrivateKey(privateKey);
	const wrappedPriv = await encryptBuffer(vaultKey, new TextEncoder().encode(pkcs8));
	await kvSet(IDENTITY_KEY$1, {
		publicKey,
		privatePkcs8: JSON.stringify({
			iv: bufToB64(wrappedPriv.iv),
			ciphertext: bufToB64(wrappedPriv.ciphertext)
		})
	});
}
async function unwrapIdentity(vaultKey) {
	const record = await kvGet(IDENTITY_KEY$1);
	if (!record) throw new Error("Missing identity");
	const wrapped = JSON.parse(record.privatePkcs8);
	const { b64ToBuf } = await Promise.resolve().then(() => bytes_DRfG6po7_exports).then((n) => n.i);
	return {
		privateKey: await importPrivateKey(new TextDecoder().decode(await decryptBuffer(vaultKey, b64ToBuf(wrapped.iv), b64ToBuf(wrapped.ciphertext)))),
		publicKey: record.publicKey
	};
}
async function openSession(vaultKey) {
	const identity = await unwrapIdentity(vaultKey);
	sessionVaultKey = vaultKey;
	sessionPrivateKey = identity.privateKey;
	sessionPublicB64 = identity.publicKey;
	return identity.publicKey;
}
async function bootstrapVault() {
	if (sessionVaultKey && sessionPublicB64) return sessionPublicB64;
	const lock = await getLockConfig();
	const raw = await kvGet("vaultRaw");
	if (lock?.hasPasscode && !raw) throw new Error("LOCKED");
	const existing = await kvGet(IDENTITY_KEY$1);
	if (raw && existing) return openSession(await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]));
	const pair = await generateIdentityKeyPair();
	const { exportPublicKey } = await Promise.resolve().then(() => crypto_Bq_MJeFl_exports).then((n) => n.t);
	const publicKey = await exportPublicKey(pair.publicKey);
	const vaultKey = await generateAesKey();
	await kvSet("vaultRaw", await crypto.subtle.exportKey("raw", vaultKey));
	const wrapped = await encryptBuffer(vaultKey, /* @__PURE__ */ new Uint8Array(32));
	await kvSet(VAULT_WRAP_KEY, {
		iv: bufToB64(wrapped.iv),
		ciphertext: bufToB64(wrapped.ciphertext)
	});
	await persistIdentity(pair.privateKey, publicKey, vaultKey);
	await kvSet(LOCK_KEY, {
		hasPasscode: false,
		hasBiometric: lock?.hasBiometric ?? false,
		saltB64: lock?.saltB64 ?? bufToB64(randomBytes(16)),
		credentialId: lock?.credentialId
	});
	return openSession(vaultKey);
}
async function setPasscode(passcode) {
	if (!/^\d{6}$/.test(passcode)) throw new Error("Use a 6-digit passcode");
	const salt = randomBytes(16);
	const wrapKey = await derivePasscodeKey(passcode, salt);
	sessionVaultKey ?? await generateAesKey();
	if (!sessionPrivateKey || !sessionPublicB64) await bootstrapVault();
	const active = getSessionKeys();
	const wrapped = await encryptBuffer(wrapKey, await crypto.subtle.exportKey("raw", active.vaultKey));
	await kvSet(VAULT_WRAP_KEY, {
		iv: bufToB64(wrapped.iv),
		ciphertext: bufToB64(wrapped.ciphertext)
	});
	await kvDelRaw();
	const { hashPasscode } = await Promise.resolve().then(() => crypto_Bq_MJeFl_exports).then((n) => n.t);
	const probe = await hashPasscode(passcode, salt);
	await kvSet(LOCK_KEY, {
		...await getLockConfig() ?? {
			hasPasscode: true,
			hasBiometric: false,
			saltB64: bufToB64(salt)
		},
		hasPasscode: true,
		saltB64: bufToB64(salt),
		passcodeProbe: probe
	});
	sessionVaultKey = active.vaultKey;
}
async function kvDelRaw() {
	const { kvDel } = await Promise.resolve().then(() => idb_C6QQNckv_exports).then((n) => n.r);
	await kvDel("vaultRaw");
}
async function unlockWithPasscode(passcode) {
	const lock = await getLockConfig();
	if (!lock?.hasPasscode) throw new Error("No passcode set");
	const { b64ToBuf } = await Promise.resolve().then(() => bytes_DRfG6po7_exports).then((n) => n.i);
	const wrapKey = await derivePasscodeKey(passcode, new Uint8Array(b64ToBuf(lock.saltB64)));
	const wrap = await kvGet(VAULT_WRAP_KEY);
	if (!wrap) throw new Error("Missing vault");
	try {
		const raw = await decryptBuffer(wrapKey, b64ToBuf(wrap.iv), b64ToBuf(wrap.ciphertext));
		return openSession(await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]));
	} catch {
		throw new Error("Wrong passcode");
	}
}
async function clearPasscode() {
	const active = getSessionKeys();
	await kvSet("vaultRaw", await crypto.subtle.exportKey("raw", active.vaultKey));
	const lock = await getLockConfig();
	await kvSet(LOCK_KEY, {
		hasPasscode: false,
		hasBiometric: lock?.hasBiometric ?? false,
		saltB64: lock?.saltB64 ?? bufToB64(randomBytes(16)),
		credentialId: lock?.credentialId
	});
}
async function registerBiometric() {
	if (typeof window === "undefined" || !window.PublicKeyCredential) throw new Error("This device cannot use Face ID or a passkey");
	const cred = await navigator.credentials.create({ publicKey: {
		challenge: randomBytes(32),
		rp: {
			name: "Haven",
			id: window.location.hostname
		},
		user: {
			id: randomBytes(16),
			name: "haven-lock",
			displayName: "Haven lock"
		},
		pubKeyCredParams: [{
			type: "public-key",
			alg: -7
		}, {
			type: "public-key",
			alg: -257
		}],
		authenticatorSelection: {
			authenticatorAttachment: "platform",
			userVerification: "required",
			residentKey: "preferred"
		},
		timeout: 6e4
	} });
	if (!cred) throw new Error("Biometric setup was cancelled");
	await kvSet(LOCK_KEY, {
		...await getLockConfig() ?? {
			hasPasscode: false,
			hasBiometric: true,
			saltB64: bufToB64(randomBytes(16))
		},
		hasBiometric: true,
		credentialId: bufToB64(cred.rawId)
	});
}
async function unlockWithBiometric() {
	const lock = await getLockConfig();
	if (!lock?.hasBiometric || !lock.credentialId) throw new Error("Face ID is not set up");
	const { b64ToBuf } = await Promise.resolve().then(() => bytes_DRfG6po7_exports).then((n) => n.i);
	if (!await navigator.credentials.get({ publicKey: {
		challenge: randomBytes(32),
		allowCredentials: [{
			type: "public-key",
			id: b64ToBuf(lock.credentialId)
		}],
		userVerification: "required",
		timeout: 6e4
	} })) throw new Error("Face ID was cancelled");
	if (lock.hasPasscode && !await kvGet("vaultRaw")) throw new Error("Enter your passcode to open the vault");
	return bootstrapVault();
}
async function disableBiometric() {
	const lock = await getLockConfig();
	if (!lock) return;
	await kvSet(LOCK_KEY, {
		...lock,
		hasBiometric: false,
		credentialId: void 0
	});
}
async function destroyLocalVault() {
	lockSession();
	await wipeVault();
}
async function unlockWithPhrase(secret) {
	const { loadRecoveryPack, openPackWithSecret, parseRecoveryPack, recoverySecrets } = await import("./recovery-C8lPkTmQ.mjs").then((n) => n.s);
	const { importPrivateKey } = await Promise.resolve().then(() => crypto_Bq_MJeFl_exports).then((n) => n.t);
	const packs = [];
	const local = await loadRecoveryPack();
	if (local) packs.push(local);
	try {
		const { getRecoveryBlob } = await import("./button-DbxQEyOR.mjs").then((n) => n.a).then((n) => n.c);
		const email = parseRecoveryPack(await getRecoveryBlob({ data: { kind: "email" } }));
		if (email) packs.push(email);
		const emergency = parseRecoveryPack(await getRecoveryBlob({ data: { kind: "emergency" } }));
		if (emergency) packs.push(emergency);
	} catch {}
	if (!packs.length) throw new Error("No recovery backup on this device");
	const guesses = recoverySecrets(secret);
	let last = null;
	for (const pack of packs) for (const guess of guesses) try {
		const opened = await openPackWithSecret(guess, pack);
		sessionVaultKey = opened.vaultKey;
		sessionPrivateKey = await importPrivateKey(opened.pkcs8);
		sessionPublicB64 = opened.publicKey;
		return opened.publicKey;
	} catch (err) {
		last = err instanceof Error ? err : /* @__PURE__ */ new Error("That recovery secret does not match");
	}
	throw last ?? /* @__PURE__ */ new Error("That recovery secret does not match");
}
var TOTP_KEY = "totp-secret";
var BACKUP_CODES_KEY = "totp-backup-hashes";
async function storeTotpSecret(secret) {
	await kvSet(TOTP_KEY, secret);
}
async function loadTotpSecret() {
	return await kvGet(TOTP_KEY) ?? null;
}
async function clearTotpSecret() {
	const { kvDel } = await Promise.resolve().then(() => idb_C6QQNckv_exports).then((n) => n.r);
	await kvDel(TOTP_KEY);
	await kvDel(BACKUP_CODES_KEY);
}
var BACKUP_ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateBackupCodes(count = 8) {
	const codes = [];
	for (let i = 0; i < count; i += 1) {
		const bytes = randomBytes(8);
		let raw = "";
		for (const b of bytes) raw += BACKUP_ALPH[b % 32];
		codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
	}
	return codes;
}
function normalizeBackupCode(code) {
	return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
async function storeBackupCodes(codes) {
	const { sha256Hex } = await Promise.resolve().then(() => crypto_Bq_MJeFl_exports).then((n) => n.t);
	await kvSet(BACKUP_CODES_KEY, await Promise.all(codes.map((c) => sha256Hex(normalizeBackupCode(c)))));
}
async function remainingBackupCodes() {
	return (await kvGet(BACKUP_CODES_KEY) ?? []).length;
}
async function consumeBackupCode(code) {
	const { sha256Hex } = await Promise.resolve().then(() => crypto_Bq_MJeFl_exports).then((n) => n.t);
	const hashes = await kvGet(BACKUP_CODES_KEY) ?? [];
	if (!hashes.length) return false;
	const guess = await sha256Hex(normalizeBackupCode(code));
	const idx = hashes.indexOf(guess);
	if (idx < 0) return false;
	hashes.splice(idx, 1);
	await kvSet(BACKUP_CODES_KEY, hashes);
	return true;
}
function biometricAvailable() {
	return typeof window !== "undefined" && !!window.PublicKeyCredential;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	(0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			false
		]
	});
}
async function sealToKv(key, value) {
	const { vaultKey } = getSessionKeys();
	const { iv, ciphertext } = await encryptBuffer(vaultKey, utf8(JSON.stringify(value)));
	await kvSet(key, {
		iv: bufToB64(iv),
		ciphertext: bufToB64(ciphertext)
	});
}
async function unsealFromKv(key) {
	const row = await kvGet(key);
	if (!row?.iv || !row.ciphertext) return null;
	const { vaultKey } = getSessionKeys();
	const plain = await decryptBuffer(vaultKey, b64ToBuf(row.iv), b64ToBuf(row.ciphertext));
	return JSON.parse(new TextDecoder().decode(plain));
}
var FRIENDS_KEY = "graph-friends";
var CIRCLES_KEY = "graph-circles";
var BLOCKS_KEY = "graph-blocks";
var IDENTITY_KEY = "graph-identity";
var OUTGOING_KEY = "graph-outgoing-ids";
var PENDING_INVITE_KEY = "haven-pending-invite";
function suggestHandle(name) {
	return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || "haven"}${Math.floor(100 + Math.random() * 900)}`;
}
async function loadIdentity() {
	return await unsealFromKv(IDENTITY_KEY) ?? {
		handle: "",
		displayName: ""
	};
}
async function saveIdentity(next) {
	await sealToKv(IDENTITY_KEY, {
		handle: next.handle.trim().toLowerCase().replace(/^@/, ""),
		displayName: next.displayName.trim().slice(0, 40)
	});
}
async function loadFriends() {
	return await unsealFromKv(FRIENDS_KEY) ?? [];
}
async function upsertFriend(incoming) {
	const all = await loadFriends();
	const idx = all.findIndex((row) => row.userId === incoming.userId);
	if (idx < 0) all.push({
		...incoming,
		friendshipId: incoming.friendshipId || crypto.randomUUID()
	});
	else {
		const prev = all[idx];
		let status = incoming.status;
		if (prev.status === "accepted" || incoming.status === "accepted") status = "accepted";
		else if (prev.status === "pending-out" && incoming.status === "pending-in" || prev.status === "pending-in" && incoming.status === "pending-out") status = "accepted";
		all[idx] = {
			...prev,
			handle: incoming.handle || prev.handle,
			displayName: incoming.displayName || prev.displayName,
			publicKey: incoming.publicKey || prev.publicKey,
			status
		};
	}
	all.sort((a, b) => a.displayName.localeCompare(b.displayName));
	await sealToKv(FRIENDS_KEY, all);
	return all;
}
async function removeFriend(userId) {
	const next = (await loadFriends()).filter((row) => row.userId !== userId);
	await sealToKv(FRIENDS_KEY, next);
	return next;
}
async function loadCircles() {
	return await unsealFromKv(CIRCLES_KEY) ?? [];
}
async function saveCircle(circle) {
	const all = await loadCircles();
	const idx = all.findIndex((row) => row.id === circle.id);
	if (idx < 0) all.unshift(circle);
	else all[idx] = circle;
	await sealToKv(CIRCLES_KEY, all);
	return all;
}
async function removeCircle(id) {
	const next = (await loadCircles()).filter((row) => row.id !== id);
	await sealToKv(CIRCLES_KEY, next);
	return next;
}
async function loadBlocks() {
	return await unsealFromKv(BLOCKS_KEY) ?? [];
}
async function blockLocal(userId) {
	const blocks = await loadBlocks();
	if (!blocks.includes(userId)) blocks.push(userId);
	await sealToKv(BLOCKS_KEY, blocks);
	await removeFriend(userId);
	await sealToKv(CIRCLES_KEY, (await loadCircles()).map((c) => ({
		...c,
		members: c.members.filter((m) => m.userId !== userId)
	})).filter((c) => c.createdBy !== userId));
}
async function isBlocked(userId) {
	return (await loadBlocks()).includes(userId);
}
async function rememberOutgoing(id) {
	const ids = await unsealFromKv(OUTGOING_KEY) ?? [];
	if (!ids.includes(id)) ids.push(id);
	if (ids.length > 400) ids.splice(0, ids.length - 400);
	await sealToKv(OUTGOING_KEY, ids);
}
async function outgoingIds() {
	return await unsealFromKv(OUTGOING_KEY) ?? [];
}
async function consumePendingInvite() {
	if (typeof sessionStorage === "undefined") return;
	const raw = sessionStorage.getItem(PENDING_INVITE_KEY);
	if (!raw) return;
	sessionStorage.removeItem(PENDING_INVITE_KEY);
	try {
		const row = JSON.parse(raw);
		if (!row.userId) return;
		await upsertFriend({
			userId: row.userId,
			handle: row.handle || "friend",
			displayName: row.displayName || row.handle || "Friend",
			publicKey: row.publicKey,
			status: "accepted",
			friendshipId: crypto.randomUUID()
		});
	} catch {}
}
function toCircleMembers(members) {
	return members.map((m) => ({
		userId: m.userId,
		handle: m.handle ?? "",
		displayName: m.displayName ?? m.handle ?? "Friend",
		publicKey: m.publicKey ?? null,
		role: m.role === "owner" ? "owner" : "member",
		status: m.status === "invited" ? "invited" : "member"
	}));
}
//#endregion
export { exportPrivateKey as $, saveCircle as A, unlockWithPhrase as B, lockSession as C, rememberOutgoing as D, remainingBackupCodes as E, storeTotpSecret as F, kvDel as G, upsertFriend as H, suggestHandle as I, listVideos as J, kvGet as K, toCircleMembers as L, sealToKv as M, setPasscode as N, removeCircle as O, storeBackupCodes as P, encryptBuffer as Q, unlockWithBiometric as R, loadTotpSecret as S, registerBiometric as T, deleteVideo as U, unsealFromKv as V, getVideo as W, decryptBuffer as X, putVideo as Y, derivePasscodeKey as Z, isBlocked as _, blockLocal as a, asBytes as at, loadFriends as b, clearTotpSecret as c, randomBytes as ct, destroyLocalVault as d, generateAesKey as et, disableBiometric as f, graph_local_CzAMWcA8_exports as g, getSessionKeys as h, biometricAvailable as i, wrapVideoKeyForRecipient as it, saveIdentity as j, removeFriend as k, consumeBackupCode as l, utf8 as lt, getLockConfig as m, RedirectToSignIn as n, sha256Hex as nt, bootstrapVault as o, b64ToBuf as ot, generateBackupCodes as p, kvSet as q, UserButton as r, unwrapVideoKey as rt, clearPasscode as s, bufToB64 as st, PENDING_INVITE_KEY as t, importPublicKey as tt, consumePendingInvite as u, isUnlocked as v, outgoingIds as w, loadIdentity as x, loadCircles as y, unlockWithPasscode as z };
