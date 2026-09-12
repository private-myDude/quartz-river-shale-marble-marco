import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as require_react, i as require_jsx_runtime, n as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { _ as createRootRoute, b as useRouter, d as HeadContent, g as createFileRoute, h as lazyRouteComponent, m as Outlet, p as createRouter, u as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { bn as union, gn as object, hn as number, pn as literal, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as auth } from "./server-DXwPVsNE.mjs";
import { c as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BrCfh7Ot.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-ink px-6 text-center text-fog",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-mute",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var PREFS_KEY = "haven-prefs-v1";
var SKIP_OPTIONS = [
	10,
	15,
	20,
	30
];
var SPEED_OPTIONS = [
	1,
	1.25,
	1.5,
	1.75,
	2
];
var THEME_OPTIONS = [
	{
		id: "system",
		label: "System"
	},
	{
		id: "light",
		label: "Light"
	},
	{
		id: "dark",
		label: "Dark"
	}
];
var CLOUD_OPTIONS = [
	{
		id: "device",
		label: "This device only",
		hint: "Playable clips never leave this phone."
	},
	{
		id: "icloud",
		label: "iCloud",
		hint: "Native iCloud Drive lands in the Haven app. Until then, pick the iCloud folder this phone already syncs.",
		native: true
	},
	{
		id: "proton",
		label: "Proton Drive",
		hint: "Native Proton Drive lands in the Haven app. Until then, pick a Proton-synced folder or save a backup file.",
		native: true
	},
	{
		id: "gdrive",
		label: "Google Drive",
		hint: "Native Drive lands in the Haven app. Until then, pick a Drive-synced folder or save a backup file.",
		native: true
	},
	{
		id: "onedrive",
		label: "OneDrive",
		hint: "Native OneDrive lands in the Haven app. Until then, pick a OneDrive folder or save a backup file.",
		native: true
	},
	{
		id: "folder",
		label: "Any synced folder",
		hint: "Encrypted backup into whatever folder your cloud already watches."
	},
	{
		id: "file",
		label: "Backup file",
		hint: "Download or restore a sealed vault file."
	},
	{
		id: "haven",
		label: "Haven Cloud",
		hint: "Sealed mailbox only. We cannot watch your clips."
	}
];
var RELAY_OPTIONS = [{
	id: "pickup",
	label: "Delete when picked up",
	hint: "Sealed copy vanishes as soon as this phone takes it."
}, {
	id: "until-expiry",
	label: "Keep until lifetime ends",
	hint: "Mailbox holds ciphertext until the clip’s timer."
}];
var DEFAULT_PREFS = {
	theme: "system",
	skipSeconds: 10,
	playbackRate: 1,
	shieldClips: true,
	cloudTarget: "device",
	relayMode: "pickup",
	allowSave: false,
	allowForward: true,
	sendReceipts: true,
	notifications: true,
	quietHours: false,
	quietStart: "22:00",
	quietEnd: "07:00",
	captions: false,
	startMuted: false,
	wifiOnly: false,
	discovery: "handle"
};
var listeners = /* @__PURE__ */ new Set();
var cached = DEFAULT_PREFS;
var cachedRaw = null;
var hydrated = false;
function isSkip(value) {
	return SKIP_OPTIONS.includes(value);
}
function isSpeed(value) {
	return SPEED_OPTIONS.includes(value);
}
function isTheme(value) {
	return value === "system" || value === "light" || value === "dark";
}
function isCloud(value) {
	return CLOUD_OPTIONS.some((opt) => opt.id === value);
}
function isRelay(value) {
	return value === "pickup" || value === "until-expiry";
}
function parsePrefs(raw) {
	if (!raw || typeof raw !== "object") return DEFAULT_PREFS;
	const rec = raw;
	return {
		theme: isTheme(rec.theme) ? rec.theme : DEFAULT_PREFS.theme,
		skipSeconds: isSkip(rec.skipSeconds) ? rec.skipSeconds : DEFAULT_PREFS.skipSeconds,
		playbackRate: isSpeed(rec.playbackRate) ? rec.playbackRate : DEFAULT_PREFS.playbackRate,
		shieldClips: rec.shieldClips === false ? false : true,
		cloudTarget: isCloud(rec.cloudTarget) ? rec.cloudTarget : DEFAULT_PREFS.cloudTarget,
		relayMode: isRelay(rec.relayMode) ? rec.relayMode : DEFAULT_PREFS.relayMode,
		allowSave: rec.allowSave === true,
		allowForward: rec.allowForward === false ? false : true,
		sendReceipts: rec.sendReceipts === false ? false : true,
		notifications: rec.notifications === false ? false : true,
		quietHours: rec.quietHours === true,
		quietStart: typeof rec.quietStart === "string" ? rec.quietStart : DEFAULT_PREFS.quietStart,
		quietEnd: typeof rec.quietEnd === "string" ? rec.quietEnd : DEFAULT_PREFS.quietEnd,
		captions: rec.captions === true,
		startMuted: rec.startMuted === true,
		wifiOnly: rec.wifiOnly === true,
		discovery: rec.discovery === "anyone" ? "anyone" : "handle"
	};
}
function readPrefs() {
	if (typeof localStorage === "undefined") return cached;
	try {
		const raw = localStorage.getItem(PREFS_KEY);
		if (hydrated && raw === cachedRaw) return cached;
		hydrated = true;
		cachedRaw = raw;
		cached = parsePrefs(raw ? JSON.parse(raw) : null);
		return cached;
	} catch {
		hydrated = true;
		return cached;
	}
}
function writePrefs(next) {
	cached = next;
	cachedRaw = JSON.stringify(next);
	hydrated = true;
	localStorage.setItem(PREFS_KEY, cachedRaw);
	listeners.forEach((fn) => fn());
}
function setPrefs(partial) {
	const next = {
		...readPrefs(),
		...partial
	};
	writePrefs(next);
	return next;
}
function subscribePrefs(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
function usePrefs() {
	return (0, import_react.useSyncExternalStore)(subscribePrefs, readPrefs, () => DEFAULT_PREFS);
}
function systemPrefersDark() {
	if (typeof window === "undefined") return true;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function resolvedTheme(theme, systemDark = systemPrefersDark()) {
	if (theme === "light") return "light";
	if (theme === "dark") return "dark";
	return systemDark ? "dark" : "light";
}
function applyThemeClass(mode) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	root.classList.toggle("dark", mode === "dark");
	root.classList.toggle("light", mode === "light");
	root.style.colorScheme = mode;
	const meta = document.querySelector("meta[name=\"theme-color\"]");
	if (meta) meta.setAttribute("content", mode === "dark" ? "#07080c" : "#f4f5f7");
}
function speedLabel(rate) {
	return rate === 1 ? "1×" : `${rate}×`;
}
function skipLabel(seconds) {
	return `${seconds} seconds`;
}
function ThemeRoot({ children }) {
	const prefs = usePrefs();
	const theme = resolvedTheme(prefs.theme);
	(0, import_react.useEffect)(() => {
		const apply = () => applyThemeClass(resolvedTheme(prefs.theme));
		apply();
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, [prefs.theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme,
		toastOptions: { className: "glass text-fog border-0" }
	})] });
}
var THEME_BOOT = `(()=>{try{var k="haven-prefs-v1";var p=JSON.parse(localStorage.getItem(k)||"{}");var t=p.theme||"system";var dark=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",dark);r.classList.toggle("light",!dark);r.style.colorScheme=dark?"dark":"light";}catch(e){document.documentElement.classList.add("dark")}})();`;
var styles_default = "/assets/styles-CuzzTR6q.css";
var APP_NAME = "Haven";
var queryClient = new QueryClient({ defaultOptions: { queries: {
	staleTime: 8e3,
	retry: 1,
	refetchOnWindowFocus: false
} } });
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Private video for the people you love. Encrypted on your device."
			},
			{
				name: "theme-color",
				content: "#07080c"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_BOOT } })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "haven-bg min-h-dvh bg-ink text-fog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
					client: queryClient,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeRoot, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$2 = () => import("./routes-DzQTBKno.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./login-k4U5d0uR.mjs");
var Route$2 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./invite._token-BH7PPBao.mjs");
var Route$1 = createFileRoute("/invite/$token")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	LoginRoute: Route$2.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$4
	}),
	InviteTokenRoute: Route$1.update({
		id: "/invite/$token",
		path: "/invite/$token",
		getParentRoute: () => Route$4
	}),
	ApiAuthSplatRoute: Route.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { SKIP_OPTIONS as a, readPrefs as c, speedLabel as d, usePrefs as f, RELAY_OPTIONS as i, setPrefs as l, Route$1 as n, SPEED_OPTIONS as o, CLOUD_OPTIONS as r, THEME_OPTIONS as s, router_exports as t, skipLabel as u };
