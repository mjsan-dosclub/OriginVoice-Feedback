import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as cn } from "./leads.functions-NhQJjj9k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/textarea-Cu3zwWa_.js
var import_jsx_runtime = require_jsx_runtime();
function ChoiceGroup({ legend, name, value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
			className: "mb-1 text-sm font-medium",
			children: legend
		}), options.map((option) => {
			const selected = value === option.value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: cn("flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 ring-1", selected ? "bg-accent text-accent-fg ring-accent" : "bg-surface text-fg ring-border"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: option.title
				}), option.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("block text-sm", selected ? "text-accent-fg/75" : "text-muted"),
					children: option.detail
				}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "radio",
					name,
					value: option.value,
					checked: selected,
					onChange: () => onChange(option.value),
					className: "size-4"
				})]
			}, option.value);
		})]
	});
}
function Field({ label, hint, error, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			children,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			hint && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-subtle",
				children: hint
			}) : null
		]
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-32 w-full resize-y rounded-md bg-surface px-3 py-3 text-base text-fg ring-1 ring-border outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-fg/30", className),
		...props
	});
}
//#endregion
export { Field as n, Textarea as r, ChoiceGroup as t };
