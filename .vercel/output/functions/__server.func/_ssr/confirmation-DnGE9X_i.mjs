import { o as __toESM } from "../_runtime.mjs";
import { s as formatPhone, t as OBJECTIVES, u as isObjective } from "./lead-model-DC03iF1B.mjs";
import { J as require_react, Y as require_jsx_runtime, b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as getLead, n as Input, s as confirmVoice, t as Button } from "./leads.functions-NhQJjj9k.mjs";
import { a as LoaderCircle } from "../_libs/lucide-react.mjs";
import { r as Route$2 } from "./router-6nfsgQ0B.mjs";
import { n as Field, r as Textarea, t as ChoiceGroup } from "./textarea-Cu3zwWa_.mjs";
import { t as VisitorFrame } from "./visitor-frame-CXIKSup9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/confirmation-DnGE9X_i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConfirmationView({ id, token }) {
	const navigate = useNavigate();
	const [lead, setLead] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [schoolName, setSchoolName] = (0, import_react.useState)("");
	const [objective, setObjective] = (0, import_react.useState)("Know More");
	const [bulletsText, setBulletsText] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!id || !token) {
			setError("This confirmation link is incomplete.");
			setLoading(false);
			return;
		}
		let cancel = false;
		getLead({ data: {
			id,
			token
		} }).then((result) => {
			if (cancel) return;
			if (!result.ok || !result.lead) {
				setError(result.ok ? "This confirmation link is not valid." : result.error);
				return;
			}
			setLead(result.lead);
			setName(result.lead.name);
			setPhone(result.lead.phone);
			setEmail(result.lead.email);
			setSchoolName(result.lead.schoolName);
			setObjective(isObjective(result.lead.objective) ? result.lead.objective : "Know More");
			setBulletsText(result.lead.bullets.join("\n"));
		}).catch(() => {
			if (!cancel) setError("Couldn't open this confirmation.");
		}).finally(() => {
			if (!cancel) setLoading(false);
		});
		return () => {
			cancel = true;
		};
	}, [id, token]);
	async function onConfirm() {
		setBusy(true);
		setError("");
		try {
			const result = await confirmVoice({ data: {
				id,
				token,
				name,
				phone,
				email,
				schoolName,
				objective,
				bulletsText
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			await navigate({
				to: "/thanks",
				search: {
					name: result.name,
					mail: result.emailState
				}
			});
		} catch {
			setError("Couldn't confirm this note. Try again.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitorFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-6 pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-widest text-subtle uppercase",
				children: "Confirm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-2xl font-semibold tracking-tight",
				children: name.trim() ? `Thank you, ${name.trim()}` : "Check this note"
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted",
				children: "Opening the saved note…"
			}) : null,
			!loading && error && !lead ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-danger",
				children: error
			}) : null,
			lead && (lead.status === "confirmed" || lead.status === "submitted") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-base text-muted",
					children: [
						"This note is already with the booth team",
						lead.phone ? ` for ${formatPhone(lead.phone)}` : "",
						"."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/thanks",
					search: {
						name: lead.name,
						mail: lead.emailSent ? "sent" : "none"
					},
					className: "text-sm text-fg underline-offset-4 hover:underline",
					children: "View the thank-you"
				})]
			}) : null,
			lead && lead.status === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base text-muted",
						children: phone ? `Please confirm the mobile number ${formatPhone(phone)}.` : "Please confirm the mobile number."
					}),
					!lead.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-subtle",
						children: "The reading didn't fill every field. Correct anything that looks off, then send."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (event) => setName(event.target.value),
							autoComplete: "name"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Mobile number",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: phone,
							onChange: (event) => setPhone(event.target.value),
							inputMode: "numeric",
							autoComplete: "tel"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Institution",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: schoolName,
							onChange: (event) => setSchoolName(event.target.value),
							autoComplete: "organization"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						hint: "Optional. A thank-you note is sent when email delivery is connected.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: email,
							onChange: (event) => setEmail(event.target.value),
							type: "email",
							inputMode: "email",
							autoComplete: "email"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceGroup, {
						legend: "Objective",
						name: "confirm-objective",
						value: objective,
						onChange: setObjective,
						options: OBJECTIVES.map((item) => ({
							value: item,
							title: item
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Requirements",
						hint: "One point per line.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: bulletsText,
							onChange: (event) => setBulletsText(event.target.value)
						})
					}),
					lead.rawTranscript ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "glass rounded-2xl px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "cursor-pointer text-sm font-medium",
							children: "What we heard"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: lead.rawTranscript
						})]
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						onClick: () => void onConfirm(),
						disabled: busy,
						children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, busy ? "Sending" : "Confirm & send"]
					})
				]
			}) : null
		]
	}) });
}
function ConfirmationPage() {
	const { id, token } = Route$2.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationView, {
		id,
		token
	});
}
//#endregion
export { ConfirmationPage as component };
