import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads.functions-NhQJjj9k.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium outline-none focus-visible:ring-2 focus-visible:ring-fg/40 disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			default: "btn-fill bg-accent text-accent-fg",
			outline: "btn-line bg-transparent text-fg ring-1 ring-border",
			ghost: "bg-transparent text-muted hover:text-fg"
		},
		size: {
			default: "h-11 px-5 text-sm",
			lg: "h-12 w-full px-6 text-base"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
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
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-12 w-full rounded-md bg-surface px-3 text-base text-fg ring-1 ring-border outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-fg/30", className),
		...props
	});
}
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
function text(value, max) {
	return typeof value === "string" ? value.slice(0, max) : "";
}
function record(input) {
	if (!input || typeof input !== "object") return {};
	return input;
}
var processVoice = createServerFn({ method: "POST" }).validator((input) => {
	const data = record(input);
	return {
		transcript: text(data.transcript, 4e3).trim(),
		clientKey: text(data.clientKey, 80).trim()
	};
}).handler(createSsrRpc("1bebe412973200707ab7cef40f9ebe1f856db5de331067d1ead2b2b822564c3d"));
var getLead = createServerFn({ method: "POST" }).validator((input) => {
	const data = record(input);
	return {
		id: text(data.id, 80),
		token: text(data.token, 80)
	};
}).handler(createSsrRpc("9ba435182af651646a6e2c0c517332c38983db18d8dcda7e337e568b2e110db4"));
var confirmVoice = createServerFn({ method: "POST" }).validator((input) => {
	const data = record(input);
	return {
		id: text(data.id, 80),
		token: text(data.token, 80),
		name: text(data.name, 160),
		phone: text(data.phone, 32),
		email: text(data.email, 160),
		schoolName: text(data.schoolName, 160),
		objective: text(data.objective, 40),
		bulletsText: text(data.bulletsText, 1200)
	};
}).handler(createSsrRpc("53a587810f7d7443d0020df55901de3c9bc7247f0191bc8b0035cb90398010f9"));
var submitManual = createServerFn({ method: "POST" }).validator((input) => {
	const data = record(input);
	return {
		clientKey: text(data.clientKey, 80).trim(),
		name: text(data.name, 160),
		schoolName: text(data.schoolName, 160),
		phone: text(data.phone, 32),
		email: text(data.email, 160),
		callbackDate: text(data.callbackDate, 12),
		callbackSlot: text(data.callbackSlot, 80),
		objective: text(data.objective, 40),
		notes: text(data.notes, 1e3)
	};
}).handler(createSsrRpc("fc9a69a9736c7d1914602724c585b0d40ff408cae0ec7747dd3ed3be07fa9b06"));
var adminGate = createServerFn({ method: "GET" }).handler(createSsrRpc("3c76ecc8e53a7437d3afc28917cf180674a1e9397e73df2bd71485523f53b82a"));
var adminLogin = createServerFn({ method: "POST" }).validator((input) => {
	return { code: text(record(input).code, 80) };
}).handler(createSsrRpc("799d07ae85d42fd5b285b082bd19cef85a1f5884f7cd59990bc972d6ca2b75a5"));
var adminLogout = createServerFn({ method: "POST" }).handler(createSsrRpc("dc2df9b5a6af7707825d4cb9e8fef1b10bd42d116b4723b46f472a192cc35939"));
var listLeads = createServerFn({ method: "GET" }).handler(createSsrRpc("77acd1c20769f0aaa93fdea78adabaa9f8b27285e13363740e4c85703e8554bc"));
var setBoothCode = createServerFn({ method: "POST" }).validator((input) => {
	return { code: text(record(input).code, 80) };
}).handler(createSsrRpc("98961a8b9f3dec5ec178e1c8714ec5efd0971bc95dc1100e00851affc8b9a167"));
var seedSampleLeads = createServerFn({ method: "POST" }).handler(createSsrRpc("fb679afaefb2145bfc03cb7120b8c3e71e19004ed3856043bfe6cda15428cb06"));
//#endregion
export { adminLogout as a, getLead as c, seedSampleLeads as d, setBoothCode as f, adminLogin as i, listLeads as l, Input as n, cn as o, submitManual as p, adminGate as r, confirmVoice as s, Button as t, processVoice as u };
