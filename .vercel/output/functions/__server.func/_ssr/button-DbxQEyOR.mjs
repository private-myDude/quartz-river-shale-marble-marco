import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as authMiddleware } from "./types-BaOifboJ.mjs";
import { cn as _enum, dn as boolean, gn as object, pn as literal, un as array, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import "./client-C_SNNFs7.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-DbxQEyOR.js
var button_DbxQEyOR_exports = /* @__PURE__ */ __exportAll({
	_: () => putRecoveryBlob,
	a: () => useCurrentUser,
	b: () => shredMyEnvelopes,
	c: () => api_exports,
	d: () => ensureProfile,
	f: () => listInbox,
	g: () => publishEnvelope,
	h: () => pickupEnvelope,
	i: () => HavenMark,
	l: () => createInviteLink,
	m: () => peekInvite,
	n: () => cn,
	o: () => useCurrentUserState,
	p: () => matchContacts,
	r: () => Atmosphere,
	s: () => acceptInviteLink,
	t: () => Button,
	u: () => deleteAccount,
	v: () => resolvePhoneLogin,
	x: () => updateProfile,
	y: () => searchPeople
});
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var api_exports = /* @__PURE__ */ __exportAll$1({
	acceptInviteLink: () => acceptInviteLink,
	createInviteLink: () => createInviteLink,
	deleteAccount: () => deleteAccount,
	ensureProfile: () => ensureProfile,
	getRecoveryBlob: () => getRecoveryBlob,
	listInbox: () => listInbox,
	matchContacts: () => matchContacts,
	peekInvite: () => peekInvite,
	pickupEnvelope: () => pickupEnvelope,
	publishEnvelope: () => publishEnvelope,
	putRecoveryBlob: () => putRecoveryBlob,
	resolvePhoneLogin: () => resolvePhoneLogin,
	searchPeople: () => searchPeople,
	shredMyEnvelopes: () => shredMyEnvelopes,
	updateProfile: () => updateProfile
});
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c864f410842cef6326976c340afea2c02fcd89978f6ec59ca8ae5064430ffdad"));
var ensureProfile = createServerFn({ method: "POST" }).validator((data) => object({
	displayName: string().trim().min(1).max(40).optional(),
	publicKey: string().min(16).optional(),
	handleHash: string().length(64).optional(),
	setupComplete: boolean().optional()
}).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("ca337694d2c67d70846eca9a5c6ce8d499cb435698e3f6cfb2d93e1638088c39"));
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
}).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("73a37e2a048cee92f79aea61fadb3d0bdc1770d3bde7e90fe00eed2d1ebce435"));
var resolvePhoneLogin = createServerFn({ method: "POST" }).validator((data) => object({ phone: string().min(8) }).parse(data)).handler(createSsrRpc("8b78b2ce5f6a4fe41aedd2337273e265d4074ab8a79dcb651f48e2c20ce4d9ba"));
var searchPeople = createServerFn({ method: "POST" }).validator((data) => object({
	handleHash: string().length(64).optional(),
	phoneHash: string().length(64).optional()
}).refine((d) => Boolean(d.handleHash || d.phoneHash)).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("9a19867c0133714d65793575f6608ae59ad8da6d11e0dd657e498b855bc9aef0"));
var matchContacts = createServerFn({ method: "POST" }).validator((data) => object({
	phoneHashes: array(string().length(64)).max(200),
	emailHashes: array(string().length(64)).max(200)
}).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("ba8b76beee56373f7d8967267e18ae09b8ce78568153aa3e1af7a827aa323bbf"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b6da32308f313759cdec75ed8f56c2bbf8dea307a53392cd569fdd85e3a4a77b"));
createServerFn({ method: "POST" }).validator((data) => object({ userId: string().min(1) }).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("232562c0160901cf6d7370fed1083c1c4d6da4f343fbfcd616f1c9b26bbc8552"));
createServerFn({ method: "POST" }).validator((data) => object({
	friendshipId: string(),
	accept: boolean()
}).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("e12bff1add1853646cbec68dc5dc472390ddc73c603e2db4fe46c1a389d7bf96"));
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
var publishEnvelope = createServerFn({ method: "POST" }).validator((data) => envelopeInput.parse(data)).middleware([authMiddleware]).handler(createSsrRpc("31e71ac27ac8f958b02474f79ed1dfafd9e1693d047befbb4bc9c4744a0369b8"));
var listInbox = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7f7feb6ca0e2bc40f4f4c77139bc84931d3d2e48df48ffa9acb4536e5cd0028b"));
var pickupEnvelope = createServerFn({ method: "POST" }).validator((data) => object({
	id: string().min(1),
	retain: boolean().optional()
}).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("34e57d611606a7b716f7a6ab2781c7d95ef351e051f9eb625da37868794fbbd9"));
createServerFn({ method: "POST" }).validator((data) => object({ id: string().min(1) }).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("c4f0a363de5f254fa0975ec9f6bc27f82caebe6e820ca6e3e3463b575906c9a3"));
var shredMyEnvelopes = createServerFn({ method: "POST" }).validator((data) => object({ ids: array(string().min(8).max(80)).max(500).optional() }).parse(data ?? {})).middleware([authMiddleware]).handler(createSsrRpc("b331b9e44f92c9fa5bb41c6001607382c7ac24655f3a817e4539e5c29951f592"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fa723475031a6b9093a43c475a1005e865e0e6a8ad1ccc90802881ae39bc62b4"));
createServerFn({ method: "POST" }).validator((data) => object({
	name: string().trim().min(1).max(40),
	memberIds: array(string().min(1)).max(49)
}).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("980e7ab8acd3258df5325bc94b42fff1b96ca9892567d4a16c2564da5f576a63"));
createServerFn({ method: "POST" }).validator((data) => object({ circleId: string().min(1) }).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("04bf561baf9b01b44086c2bf230562494725191052b34244e3242c6fa9b5978b"));
createServerFn({ method: "POST" }).validator((data) => object({
	circleId: string().min(1),
	accept: boolean()
}).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("ce8a9f9a1cfc3d3395e9c2cc9ef017ce3d9a79c25b1e31f0ae869d590834d690"));
createServerFn({ method: "POST" }).validator((data) => object({ userId: string().min(1) }).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("3e1438f81b1bcf8d3728b00c0d008dab04dbe9c0792866a1e58d8d4d6d834cd0"));
var createInviteLink = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("dcfdfe47aa8fefd19f30b3efccf26c2f546eefa54164936daf1580b92c9c0ff5"));
var peekInvite = createServerFn({ method: "POST" }).validator((data) => object({ token: string().min(8) }).parse(data)).handler(createSsrRpc("2062e91e0d15db8a31638d77b0b3118391337b9fdf6113f982ea35ce30bbf387"));
var acceptInviteLink = createServerFn({ method: "POST" }).validator((data) => object({ token: string().min(8) }).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("9a3168d6bbdb385478466cc1ceccc9c6a018f754bfb00aaae9d7b901b6e7413d"));
var putRecoveryBlob = createServerFn({ method: "POST" }).validator((data) => object({
	kind: _enum(["email", "emergency"]),
	blob: string().min(8).max(2e4)
}).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("00c1b02f741f4cc6c22ec4c529e46988c61c75e68e78a0b60734634d7828dee4"));
var getRecoveryBlob = createServerFn({ method: "POST" }).validator((data) => object({ kind: _enum(["email", "emergency"]) }).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("55bcc78e784a8f482837c24dd2c73bc44768b792c66dec9d7f430df3b9c557e3"));
var deleteAccount = createServerFn({ method: "POST" }).validator((data) => object({ confirm: literal("DELETE") }).parse(data)).middleware([authMiddleware]).handler(createSsrRpc("c75177100427a0d0d51456e7471e5e85ebcde22600fa047589bacbf8085d6724"));
/**
* Stable fallback user, used ONLY when auth is disabled
* (`VITE_AUTH_ENABLED=false`, the shipped default). With auth on, the sandbox
* live preview does real sign-in via the baked preview client. Its id is
* `"dev-user"` — the SAME id `verify.server.ts` returns server-side — so per-user
* rows written in that mode belong to one consistent owner.
*/
var DEV_USER = {
	id: "dev-user",
	displayName: "Dev User",
	primaryEmail: "dev@example.com",
	profileImageUrl: null,
	isDevFallback: true
};
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return {
		user: DEV_USER,
		isPending: false
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function Atmosphere() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed inset-0 -z-10 haven-bg",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-1/2 top-[-8%] h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-mist/20 blur-[90px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[8%] left-[-10%] h-[280px] w-[280px] rounded-full bg-fog/10 blur-[80px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[18%] right-[-8%] h-[240px] w-[240px] rounded-full bg-mist/15 blur-[70px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 opacity-[0.28] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')]" })
		]
	});
}
function HavenMark({ subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-6xl italic text-fog",
			children: "Haven"
		}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 max-w-xs text-sm text-mist",
			children: subtitle
		}) : null]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-[transform,opacity,background-color,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed select-none", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg shadow-[0_0_0_1px_var(--color-ring)] hover:opacity-95",
			glass: "glass-tight text-fog hover:bg-glass-2",
			ghost: "text-fog/80 hover:bg-glass",
			danger: "bg-danger text-fog hover:opacity-95",
			record: "bg-record text-fog shadow-[0_0_0_6px_rgb(232_93_108/0.18)]"
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-md",
			md: "h-11 px-4 text-sm rounded-lg",
			lg: "h-12 px-5 text-base rounded-xl",
			pill: "h-12 px-6 text-sm rounded-full",
			icon: "size-11 rounded-full"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { shredMyEnvelopes as _, button_DbxQEyOR_exports as a, useCurrentUserState as b, deleteAccount as c, matchContacts as d, peekInvite as f, searchPeople as g, putRecoveryBlob as h, acceptInviteLink as i, ensureProfile as l, publishEnvelope as m, Button as n, cn as o, pickupEnvelope as p, HavenMark as r, createInviteLink as s, Atmosphere as t, listInbox as u, updateProfile as v, useCurrentUser as y };
