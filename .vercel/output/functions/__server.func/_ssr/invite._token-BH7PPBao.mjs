import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as useCurrentUserState, f as peekInvite, i as acceptInviteLink, n as Button, r as HavenMark, t as Atmosphere } from "./button-DbxQEyOR.mjs";
import { n as RedirectToSignIn, t as PENDING_INVITE_KEY } from "./graph-local-CzAMWcA8.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route$1 } from "./router-BrCfh7Ot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invite._token-BH7PPBao.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function claimFromHash() {
	if (typeof window === "undefined") return {};
	const raw = window.location.hash.replace(/^#/, "");
	if (!raw) return {};
	try {
		return JSON.parse(atob(raw));
	} catch {
		return {};
	}
}
function InvitePage() {
	const { token } = Route$1.useParams();
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [info, setInfo] = (0, import_react.useState)(null);
	const [claim, setClaim] = (0, import_react.useState)({});
	const [missing, setMissing] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setClaim(claimFromHash());
		let cancelled = false;
		peekInvite({ data: { token } }).then((row) => {
			if (cancelled) return;
			if (!row) setMissing(true);
			else setInfo(row);
		});
		return () => {
			cancelled = true;
		};
	}, [token]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh items-center justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HavenMark, { subtitle: "Opening invite…" })]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function accept() {
		if (!info) return;
		setBusy(true);
		try {
			const accepted = await acceptInviteLink({ data: { token } });
			const payload = {
				userId: accepted.userId,
				publicKey: accepted.publicKey ?? info.publicKey,
				handle: claim.h || "friend",
				displayName: claim.n || claim.h || "Friend"
			};
			sessionStorage.setItem(PENDING_INVITE_KEY, JSON.stringify(payload));
			toast(`You’re connected with ${payload.displayName}`);
			await navigate({ to: "/" });
		} catch (err) {
			toast(err instanceof Error ? err.message : "Invite expired");
			setBusy(false);
		}
	}
	const title = claim.n || "Someone";
	const handle = claim.h;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "haven-bg flex min-h-dvh flex-col items-center justify-center px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HavenMark, { subtitle: "Private video for the people you love." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass mt-10 w-full max-w-sm rounded-3xl p-6 text-center",
				children: missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mist",
					children: "This invite is gone or already used."
				}) : info ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-medium",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-mute",
						children: handle ? `@${handle} invited you to Haven` : "Invited you to Haven"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-5 w-full",
						disabled: busy,
						onClick: () => void accept(),
						children: "Accept invite"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mute",
					children: "Looking up this invite…"
				})
			})
		]
	});
}
//#endregion
export { InvitePage as component };
