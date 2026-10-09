import { Y as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Check } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-6nfsgQ0B.mjs";
import { t as VisitorFrame } from "./visitor-frame-CXIKSup9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/thanks-DCfToHr2.js
var import_jsx_runtime = require_jsx_runtime();
function ThanksView({ name, mail }) {
	const who = name.trim();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitorFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-10 pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-12 items-center justify-center rounded-full bg-surface ring-1 ring-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-5",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-6 text-3xl font-semibold tracking-tight",
				children: who ? `Thank you, ${who}.` : "Thank you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-base text-muted",
				children: "The booth team has your details and will follow up."
			}),
			mail === "sent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-subtle",
				children: "A thank-you note is on its way to your email."
			}) : null,
			mail === "skipped" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-subtle",
				children: "Saved. Email delivery isn't connected on this deployment, so no message was sent."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "press mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-base font-medium text-accent-fg",
				children: "Capture another"
			})
		]
	}) });
}
function ThanksPage() {
	const { name, mail } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThanksView, {
		name,
		mail
	});
}
//#endregion
export { ThanksPage as component };
