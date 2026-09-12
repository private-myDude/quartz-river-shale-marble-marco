//#region node_modules/.nitro/vite/services/ssr/assets/phone-B91MbUMF.js
function normalizePhone(input) {
	const digits = input.replace(/[^\d+]/g, "");
	const compact = digits.startsWith("+") ? `+${digits.slice(1).replace(/\D/g, "")}` : digits.replace(/\D/g, "");
	const nums = compact.startsWith("+") ? compact.slice(1) : compact;
	if (nums.length < 10 || nums.length > 15) return null;
	if (compact.startsWith("+")) return compact;
	if (nums.length === 10) return `+1${nums}`;
	return `+${nums}`;
}
function last4(phone) {
	return phone.replace(/\D/g, "").slice(-4);
}
function looksLikePhone(input) {
	const trimmed = input.trim();
	if (trimmed.includes("@")) return false;
	return normalizePhone(trimmed) != null;
}
/** Shared with the server hasher. Names and numbers never leave the device; only this digest is used to match. */
var PHONE_HASH_PEPPER = "haven-phone-v1";
//#endregion
export { normalizePhone as i, last4 as n, looksLikePhone as r, PHONE_HASH_PEPPER as t };
