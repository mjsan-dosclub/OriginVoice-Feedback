import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, Y as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as OriginLogo } from "./mark-BHVgysz8.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/visitor-frame-CXIKSup9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
function DesktopBlocker() {
	const [wide, setWide] = (0, import_react.useState)(false);
	const [url, setUrl] = (0, import_react.useState)("");
	const [src, setSrc] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(min-width: 768px)");
		const apply = () => setWide(media.matches);
		apply();
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!wide) return;
		const next = window.location.href;
		setUrl(next);
		let cancel = false;
		import_lib.toDataURL(next, {
			margin: 1,
			width: 512,
			color: {
				dark: "#121316",
				light: "#ffffff"
			}
		}).then((image) => {
			if (!cancel) setSrc(image);
		}).catch(() => {
			if (!cancel) setSrc("");
		});
		return () => {
			cancel = true;
		};
	}, [wide]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "hidden w-80 shrink-0 px-6 pt-16 pb-10 lg:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OriginLogo, { className: "mx-auto h-12 w-auto object-contain" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-xs font-medium tracking-widest text-subtle uppercase",
					children: "VidyaConnect"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-2xl font-semibold tracking-tight",
					children: "Try it here, or on a phone"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-4 max-w-md text-base text-muted",
					children: "The booth is built for a phone. You can tap through it on the left, or scan this code to open the same screen on a mobile."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mt-8 w-64 rounded-xl bg-surface p-4 ring-1 ring-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-md bg-fg p-3",
						children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							alt: "QR code to open VidyaConnect on a phone",
							className: "aspect-square w-full"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square w-full bg-elevated" })
					})
				}),
				url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm break-all text-subtle",
					children: url
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin",
					className: "mt-8 inline-flex h-11 items-center text-sm text-muted underline-offset-4 hover:text-fg hover:underline",
					children: "Booth desk"
				})
			]
		})
	});
}
function VisitorFrame({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh items-start justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full max-w-md",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopBlocker, {})]
	});
}
//#endregion
export { VisitorFrame as t };
