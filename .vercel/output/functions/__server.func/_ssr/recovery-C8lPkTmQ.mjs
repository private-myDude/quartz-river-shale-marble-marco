import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { $ as exportPrivateKey, K as kvGet, Q as encryptBuffer, X as decryptBuffer, Z as derivePasscodeKey, at as asBytes, ct as randomBytes, lt as utf8, ot as b64ToBuf, q as kvSet, st as bufToB64 } from "./graph-local-CzAMWcA8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recovery-C8lPkTmQ.js
var ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function randomTotpSecret() {
	return toBase32(randomBytes(20));
}
function toBase32(bytes) {
	let bits = 0;
	let value = 0;
	let out = "";
	for (const b of bytes) {
		value = value << 8 | b;
		bits += 8;
		while (bits >= 5) {
			out += ALPH[value >>> bits - 5 & 31];
			bits -= 5;
		}
	}
	if (bits > 0) out += ALPH[value << 5 - bits & 31];
	return out;
}
function fromBase32(text) {
	const clean = text.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
	let bits = 0;
	let value = 0;
	const out = [];
	for (const ch of clean) {
		const idx = ALPH.indexOf(ch);
		if (idx < 0) continue;
		value = value << 5 | idx;
		bits += 5;
		if (bits >= 8) {
			out.push(value >>> bits - 8 & 255);
			bits -= 8;
		}
	}
	return Uint8Array.from(out);
}
function otpauthUrl(secret, account) {
	return `otpauth://totp/${encodeURIComponent(`Haven:${account}`)}?secret=${secret}&issuer=Haven&digits=6&period=30`;
}
async function totpCode(secret, at = Date.now()) {
	const keyBytes = fromBase32(secret);
	const key = await crypto.subtle.importKey("raw", asBytes(keyBytes), {
		name: "HMAC",
		hash: "SHA-1"
	}, false, ["sign"]);
	const counter = Math.floor(at / 3e4);
	const msg = /* @__PURE__ */ new ArrayBuffer(8);
	new DataView(msg).setUint32(4, counter);
	const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
	const offset = sig[sig.length - 1] & 15;
	const bin = (sig[offset] & 127) << 24 | sig[offset + 1] << 16 | sig[offset + 2] << 8 | sig[offset + 3];
	return String(bin % 1e6).padStart(6, "0");
}
async function totpValid(secret, code, at = Date.now()) {
	const guess = code.replace(/\s/g, "");
	if (!/^\d{6}$/.test(guess)) return false;
	for (const delta of [
		-1,
		0,
		1
	]) if (await totpCode(secret, at + delta * 3e4) === guess) return true;
	return false;
}
/** 256 unique words — 16 of them is 128 bits. Haven never sees this phrase. */
var RECOVERY_WORDS = [
	"able",
	"acid",
	"aged",
	"ally",
	"amber",
	"anchor",
	"apple",
	"apron",
	"arc",
	"arena",
	"arrow",
	"ashes",
	"atlas",
	"audio",
	"avalon",
	"axis",
	"azure",
	"badge",
	"baker",
	"balm",
	"basin",
	"batch",
	"beach",
	"beads",
	"beam",
	"beans",
	"bear",
	"beats",
	"bench",
	"berry",
	"birch",
	"blend",
	"bliss",
	"block",
	"bloom",
	"bluff",
	"board",
	"boast",
	"bonus",
	"boost",
	"booth",
	"borne",
	"both",
	"bound",
	"boxer",
	"brain",
	"brand",
	"brass",
	"brave",
	"bread",
	"breeze",
	"brick",
	"bride",
	"brim",
	"bring",
	"brisk",
	"broad",
	"brook",
	"brush",
	"buck",
	"buddy",
	"build",
	"bulb",
	"bulk",
	"bully",
	"bunch",
	"burst",
	"cabin",
	"cable",
	"cadet",
	"camel",
	"camp",
	"canal",
	"candy",
	"canoe",
	"cape",
	"card",
	"cargo",
	"carry",
	"carve",
	"catch",
	"cause",
	"cedar",
	"chain",
	"chair",
	"chalk",
	"champ",
	"chant",
	"charm",
	"chart",
	"chase",
	"cheap",
	"check",
	"cheer",
	"chef",
	"chess",
	"chest",
	"chick",
	"chief",
	"child",
	"chill",
	"chip",
	"choir",
	"chop",
	"chord",
	"chuck",
	"churn",
	"cider",
	"cinch",
	"civic",
	"civil",
	"claim",
	"clamp",
	"clasp",
	"class",
	"claw",
	"clay",
	"clean",
	"clear",
	"clerk",
	"click",
	"cliff",
	"climb",
	"cling",
	"clip",
	"cloak",
	"clock",
	"clone",
	"close",
	"cloth",
	"cloud",
	"clove",
	"club",
	"clump",
	"coach",
	"coast",
	"coat",
	"cobra",
	"cocoa",
	"code",
	"coil",
	"coin",
	"coke",
	"cold",
	"color",
	"colt",
	"comb",
	"come",
	"comet",
	"comic",
	"comma",
	"cone",
	"cook",
	"cool",
	"cope",
	"copy",
	"coral",
	"cord",
	"core",
	"cork",
	"corn",
	"cost",
	"couch",
	"cough",
	"could",
	"count",
	"court",
	"cover",
	"crab",
	"craft",
	"cramp",
	"crane",
	"crank",
	"crash",
	"crate",
	"crave",
	"crawl",
	"craze",
	"cream",
	"creek",
	"creep",
	"crept",
	"crest",
	"crew",
	"cried",
	"crisp",
	"crop",
	"cross",
	"crowd",
	"crown",
	"crude",
	"crumb",
	"crush",
	"crust",
	"cub",
	"cube",
	"cumin",
	"cup",
	"cure",
	"curl",
	"curry",
	"curve",
	"cycle",
	"daily",
	"dairy",
	"daisy",
	"dance",
	"dandy",
	"dare",
	"dark",
	"dart",
	"dash",
	"data",
	"date",
	"dawn",
	"daze",
	"deal",
	"dean",
	"dear",
	"debt",
	"deck",
	"deed",
	"deep",
	"deer",
	"delay",
	"delta",
	"demo",
	"denim",
	"dense",
	"dent",
	"depot",
	"depth",
	"desk",
	"dial",
	"diary",
	"dice",
	"diet",
	"dig",
	"dill",
	"dime",
	"dine",
	"dip",
	"dirt",
	"disc",
	"dish",
	"disk",
	"dive",
	"dock",
	"dodge",
	"does",
	"dove",
	"doze",
	"draft",
	"drain",
	"drama",
	"drank"
];
function wordAt(index) {
	return RECOVERY_WORDS[index & 255] ?? "able";
}
var recovery_exports = /* @__PURE__ */ __exportAll({
	downloadText: () => downloadText,
	generatePhrase: () => generatePhrase,
	getEmergencyContact: () => getEmergencyContact,
	getRecoveryEmail: () => getRecoveryEmail,
	loadRecoveryPack: () => loadRecoveryPack,
	normalizePhrase: () => normalizePhrase,
	openPackWithSecret: () => openPackWithSecret,
	parseRecoveryPack: () => parseRecoveryPack,
	persistRecoveryPack: () => persistRecoveryPack,
	phraseFromPasskey: () => phraseFromPasskey,
	recoveryFileBody: () => recoveryFileBody,
	recoverySecrets: () => recoverySecrets,
	setEmergencyContact: () => setEmergencyContact,
	setRecoveryEmail: () => setRecoveryEmail,
	wrapRecoveryPack: () => wrapRecoveryPack
});
var PACK_KEY = "recovery-pack";
var EMAIL_KEY = "recovery-email";
var EMERGENCY_KEY = "recovery-emergency";
function wordsFromEntropy(bytes) {
	return [...bytes].map((b) => wordAt(b));
}
function generatePhrase() {
	const entropy = randomBytes(16);
	const words = wordsFromEntropy(entropy);
	return {
		words,
		phrase: words.join(" "),
		passkey: toBase32(entropy)
	};
}
function normalizePhrase(input) {
	return input.trim().toLowerCase().split(/[^a-z]+/).filter(Boolean).join(" ");
}
function phraseFromPasskey(passkey) {
	const bytes = fromBase32(passkey);
	if (bytes.length < 16) return null;
	return wordsFromEntropy(bytes.subarray(0, 16)).join(" ");
}
/** Secrets to try against a pack: phrase, passkey, or a short email/emergency code. */
function recoverySecrets(input) {
	const trimmed = input.trim();
	const phrase = normalizePhrase(trimmed);
	const compact = trimmed.replace(/\s+/g, "").toUpperCase();
	const out = /* @__PURE__ */ new Set();
	if (trimmed) out.add(trimmed);
	if (phrase) out.add(phrase);
	if (compact) out.add(compact);
	out.add(trimmed.toLowerCase());
	const fromKey = phraseFromPasskey(compact);
	if (fromKey) out.add(fromKey);
	return [...out];
}
async function wrapRecoveryPack(secret, keys) {
	const salt = randomBytes(16);
	const wrapKey = await derivePasscodeKey(secret, salt);
	const vaultRaw = await crypto.subtle.exportKey("raw", keys.vaultKey);
	const wrappedVault = await encryptBuffer(wrapKey, vaultRaw);
	const pkcs8 = await exportPrivateKey(keys.privateKey);
	const wrappedIdentity = await encryptBuffer(wrapKey, utf8(pkcs8));
	return {
		v: 1,
		publicKey: keys.publicKey,
		salt: bufToB64(salt),
		wrappedVault: {
			iv: bufToB64(wrappedVault.iv),
			ciphertext: bufToB64(wrappedVault.ciphertext)
		},
		wrappedIdentity: {
			iv: bufToB64(wrappedIdentity.iv),
			ciphertext: bufToB64(wrappedIdentity.ciphertext)
		},
		note: "Haven cannot open this backup."
	};
}
async function persistRecoveryPack(secret, keys) {
	const pack = await wrapRecoveryPack(secret, keys);
	await kvSet(PACK_KEY, pack);
	return pack;
}
async function loadRecoveryPack() {
	return await kvGet(PACK_KEY) ?? null;
}
async function openPackWithSecret(secret, pack) {
	const wrapKey = await derivePasscodeKey(secret, new Uint8Array(b64ToBuf(pack.salt)));
	const raw = await decryptBuffer(wrapKey, b64ToBuf(pack.wrappedVault.iv), b64ToBuf(pack.wrappedVault.ciphertext));
	return {
		vaultKey: await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]),
		pkcs8: new TextDecoder().decode(await decryptBuffer(wrapKey, b64ToBuf(pack.wrappedIdentity.iv), b64ToBuf(pack.wrappedIdentity.ciphertext))),
		publicKey: pack.publicKey
	};
}
function parseRecoveryPack(raw) {
	if (!raw) return null;
	try {
		const pack = JSON.parse(raw);
		if (pack?.v !== 1 || !pack.salt || !pack.wrappedVault) return null;
		return pack;
	} catch {
		return null;
	}
}
function downloadText(filename, body) {
	const blob = new Blob([body], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function recoveryFileBody(bundle) {
	return [
		"HAVEN RECOVERY",
		"Haven cannot open this backup. Only you can.",
		"",
		`Passkey: ${bundle.passkey}`,
		"",
		"Phrase:",
		bundle.phrase,
		"",
		"Keep this offline. Anyone with it can open your vault."
	].join("\n");
}
async function setRecoveryEmail(email) {
	await kvSet(EMAIL_KEY, email.trim().toLowerCase());
}
async function getRecoveryEmail() {
	return await kvGet(EMAIL_KEY) ?? null;
}
async function setEmergencyContact(userId) {
	await kvSet(EMERGENCY_KEY, userId);
}
async function getEmergencyContact() {
	return await kvGet(EMERGENCY_KEY) ?? null;
}
//#endregion
export { persistRecoveryPack as a, setEmergencyContact as c, otpauthUrl as d, randomTotpSecret as f, getRecoveryEmail as i, setRecoveryEmail as l, generatePhrase as n, recoveryFileBody as o, totpValid as p, getEmergencyContact as r, recovery_exports as s, downloadText as t, wrapRecoveryPack as u };
