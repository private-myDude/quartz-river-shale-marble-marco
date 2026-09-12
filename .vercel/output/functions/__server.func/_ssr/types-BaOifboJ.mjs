import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/types-BaOifboJ.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-C_SNNFs7.mjs").then((n) => n.t).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-CHQZzzPD.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var TTL_OPTIONS = [
	{
		id: "view",
		label: "After viewing",
		hint: "Destroyed when they finish watching"
	},
	{
		id: "1d",
		label: "24 hours",
		hint: "Gone 24 hours after they watch — not after you send"
	},
	{
		id: "1w",
		label: "1 week",
		hint: "Lives seven days after they watch"
	},
	{
		id: "2w",
		label: "2 weeks",
		hint: "Lives fourteen days after they watch"
	},
	{
		id: "3w",
		label: "3 weeks",
		hint: "Lives twenty-one days after they watch"
	},
	{
		id: "4w",
		label: "4 weeks",
		hint: "Lives twenty-eight days after they watch"
	},
	{
		id: "6m",
		label: "6 months",
		hint: "Lives six months after they watch"
	},
	{
		id: "forever",
		label: "Keep forever",
		hint: "Stays until you delete it"
	}
];
var TTL_SECONDS = {
	view: null,
	"1d": 86400,
	"1w": 604800,
	"2w": 1209600,
	"3w": 1814400,
	"4w": 2419200,
	"6m": 15724800,
	forever: null
};
var REACTION_EMOJIS = [
	"❤️",
	"😂",
	"😮",
	"😢",
	"👍",
	"🔥"
];
function isReactionEmoji(value) {
	return REACTION_EMOJIS.includes(value);
}
function isTtlMode(value) {
	return TTL_OPTIONS.some((option) => option.id === value);
}
function ttlLabel(mode) {
	return TTL_OPTIONS.find((option) => option.id === mode)?.label ?? "24 hours";
}
function ttlHint(mode) {
	return TTL_OPTIONS.find((option) => option.id === mode)?.hint ?? "";
}
/** Lifetime clock starts when the clip is watched, never when it is sent. */
function expiresAtFrom(mode, fromMs = Date.now()) {
	const seconds = TTL_SECONDS[mode];
	if (seconds == null) return null;
	return fromMs + seconds * 1e3;
}
function isMediaKind(value) {
	return value === "video" || value === "audio" || value === "receipt" || value === "reaction" || value === "recovery";
}
function isPlayable(kind) {
	return kind === "video" || kind === "audio";
}
function isDiscovery(value) {
	return value === "handle" || value === "anyone";
}
function groupPeerId(id) {
	return `g:${id}`;
}
function isGroupPeer(peerId) {
	return peerId.startsWith("g:");
}
function parseGroupId(peerId) {
	return isGroupPeer(peerId) ? peerId.slice(2) : null;
}
var SELF_PEER = "self";
//#endregion
export { expiresAtFrom as a, isGroupPeer as c, isReactionEmoji as d, isTtlMode as f, ttlLabel as h, authMiddleware as i, isMediaKind as l, ttlHint as m, SELF_PEER as n, groupPeerId as o, parseGroupId as p, TTL_OPTIONS as r, isDiscovery as s, REACTION_EMOJIS as t, isPlayable as u };
