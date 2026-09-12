import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import "./client-C_SNNFs7.mjs";
import { b as useCurrentUserState, n as Button, r as HavenMark, t as Atmosphere } from "./button-DbxQEyOR.mjs";
import "./server-DXwPVsNE.mjs";
import { t as Input } from "./input-BMtP2vSO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-k4U5d0uR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [account, setAccount] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh items-center justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HavenMark, { subtitle: "Private video for the people you love." })]
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function submit(e) {
		e.preventDefault();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between px-6 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-5xl italic text-fog",
					children: "Haven"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 text-2xl font-medium tracking-tight text-balance",
					children: "Private video for the people you love."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-mute",
					children: "Encrypted on your device. Sealed in transit. Gone when you say so."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => void submit(e),
				className: "glass spec mt-10 space-y-3 rounded-2xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 flex gap-1 rounded-full bg-ink/40 p-1",
						children: ["in", "up"].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode(id),
							className: `h-9 flex-1 rounded-full text-sm font-medium ${mode === id ? "bg-fog text-accent-fg" : "text-mute"}`,
							children: id === "in" ? "Sign in" : "Create account"
						}, id))
					}),
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Your name",
						value: name,
						onChange: (e) => setName(e.target.value),
						autoComplete: "name"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Email or phone",
						value: account,
						onChange: (e) => setAccount(e.target.value),
						autoComplete: "username"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Password",
						type: "password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						autoComplete: mode === "up" ? "new-password" : "current-password",
						minLength: 8,
						required: true
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						size: "lg",
						disabled: busy || true,
						children: mode === "up" ? "Create account" : "Continue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs text-mute",
						children: "Phone finds an existing account. Email is the login. Face ID is a device lock, set after you enter."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-2 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-sm text-mute",
					children: "Sign-in is disabled."
				})
			})
		]
	});
}
//#endregion
export { Login as component };
