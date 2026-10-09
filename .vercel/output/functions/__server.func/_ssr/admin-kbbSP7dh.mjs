import { o as __toESM } from "../_runtime.mjs";
import { f as leadsToCsv, n as SLOTS, s as formatPhone, t as OBJECTIVES } from "./lead-model-DC03iF1B.mjs";
import { J as require_react, Y as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as OriginLogo } from "./mark-BHVgysz8.mjs";
import { a as adminLogout, d as seedSampleLeads, f as setBoothCode, i as adminLogin, l as listLeads, n as Input, o as cn, r as adminGate, t as Button } from "./leads.functions-NhQJjj9k.mjs";
import { a as LoaderCircle, o as Download, r as Radio } from "../_libs/lucide-react.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-kbbSP7dh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"draft",
	"submitted",
	"confirmed"
];
function when(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return formatDistanceToNow(date, { addSuffix: true });
}
function downloadCsv(leads) {
	const blob = new Blob([leadsToCsv(leads)], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "vidyaconnect-leads.csv";
	link.click();
	URL.revokeObjectURL(url);
}
function AdminDesk() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [signedIn, setSignedIn] = (0, import_react.useState)(false);
	const [usingDefaultCode, setUsingDefaultCode] = (0, import_react.useState)(true);
	const [code, setCode] = (0, import_react.useState)("");
	const [loginError, setLoginError] = (0, import_react.useState)("");
	const [loginBusy, setLoginBusy] = (0, import_react.useState)(false);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [leads, setLeads] = (0, import_react.useState)([]);
	const [loadError, setLoadError] = (0, import_react.useState)("");
	const [objective, setObjective] = (0, import_react.useState)("");
	const [slot, setSlot] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("");
	const [fresh, setFresh] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [announce, setAnnounce] = (0, import_react.useState)("");
	const [nextCode, setNextCode] = (0, import_react.useState)("");
	const [codeMessage, setCodeMessage] = (0, import_react.useState)("");
	const [sampleMessage, setSampleMessage] = (0, import_react.useState)("");
	const known = (0, import_react.useRef)(null);
	async function refresh() {
		const result = await listLeads();
		if (!result.ok) {
			setSignedIn(false);
			setLoadError(result.error);
			return;
		}
		setLeads(result.leads);
		setLoaded(true);
		setLoadError("");
	}
	(0, import_react.useEffect)(() => {
		let cancel = false;
		adminGate().then((gate) => {
			if (cancel) return;
			setSignedIn(gate.signedIn);
			setUsingDefaultCode(gate.usingDefaultCode);
		}).catch(() => {
			if (!cancel) setLoadError("Couldn't open the booth desk.");
		}).finally(() => {
			if (!cancel) setReady(true);
		});
		return () => {
			cancel = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!signedIn) return;
		let cancel = false;
		const pull = () => {
			if (document.hidden) return;
			listLeads().then((result) => {
				if (cancel) return;
				if (!result.ok) {
					setSignedIn(false);
					return;
				}
				setLeads(result.leads);
				setLoaded(true);
			}).catch(() => {
				if (!cancel) setLoadError("The live feed paused. It will retry.");
			});
		};
		pull();
		const timer = window.setInterval(pull, 3e3);
		return () => {
			cancel = true;
			window.clearInterval(timer);
		};
	}, [signedIn]);
	(0, import_react.useEffect)(() => {
		const ids = new Set(leads.map((lead) => lead.id));
		if (known.current) {
			const born = [...ids].filter((id) => !known.current?.has(id));
			if (born.length) {
				setFresh(new Set(born));
				setAnnounce(`${born.length} new ${born.length === 1 ? "lead" : "leads"}`);
				window.setTimeout(() => setFresh(/* @__PURE__ */ new Set()), 4e3);
			}
		}
		known.current = ids;
	}, [leads]);
	const filtered = (0, import_react.useMemo)(() => leads.filter((lead) => {
		if (objective && lead.objective !== objective) return false;
		if (slot && lead.callbackSlot !== slot) return false;
		if (status && lead.status !== status) return false;
		return true;
	}), [
		leads,
		objective,
		slot,
		status
	]);
	async function onLogin(event) {
		event.preventDefault();
		setLoginBusy(true);
		setLoginError("");
		try {
			const result = await adminLogin({ data: { code } });
			if (!result.ok) {
				setLoginError(result.error);
				return;
			}
			setSignedIn(true);
			setCode("");
			await refresh();
		} catch {
			setLoginError("Couldn't check that code.");
		} finally {
			setLoginBusy(false);
		}
	}
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center text-sm text-muted",
		children: "Opening the desk…"
	});
	if (!signedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OriginLogo, { className: "h-10 w-auto object-contain object-left" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-xs tracking-widest text-subtle uppercase",
				children: "Booth desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-3xl font-semibold tracking-tight",
				children: "VidyaConnect"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Live queue for the people running the booth."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-col gap-3",
				onSubmit: (event) => void onLogin(event),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-2 text-sm font-medium",
						children: ["Access code", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: code,
							onChange: (event) => setCode(event.target.value),
							type: "password",
							autoComplete: "current-password",
							required: true
						})]
					}),
					usingDefaultCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-subtle",
						children: "Preview code is summit-floor. Change it after you enter."
					}) : null,
					loginError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: loginError
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						type: "submit",
						disabled: loginBusy,
						children: [loginBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Enter desk"]
					})
				]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-dvh w-full max-w-5xl px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				"aria-live": "polite",
				children: announce
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-xs tracking-widest text-subtle uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative flex size-2",
							"aria-hidden": "true",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-ping absolute inline-flex size-full rounded-full bg-ok" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative size-2 rounded-full bg-ok" })]
						}), "Live feed"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-3xl font-semibold tracking-tight",
						children: "Booth desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted tabular-nums",
						children: [leads.length, " on the desk"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "mt-2 inline-flex text-sm text-muted underline-offset-4 hover:text-fg hover:underline",
						children: "Open capture"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => downloadCsv(filtered),
						disabled: filtered.length === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export CSV"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => {
							adminLogout().then(() => {
								setSignedIn(false);
								setLeads([]);
								setLoaded(false);
								known.current = null;
							});
						},
						children: "Sign out"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
						label: "Objective",
						value: objective,
						onChange: setObjective,
						options: ["", ...OBJECTIVES]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
						label: "Callback slot",
						value: slot,
						onChange: setSlot,
						options: ["", ...SLOTS.map((item) => item.value)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
						label: "Status",
						value: status,
						onChange: setStatus,
						options: ["", ...STATUSES]
					})
				]
			}),
			loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-danger",
				children: loadError
			}) : null,
			!loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted",
				children: "Opening the queue…"
			}) : leads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-xl bg-surface p-6 ring-1 ring-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5 text-muted" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 text-lg font-medium",
						children: "Waiting for the first conversation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-muted",
						children: "Voice notes and forms show up here as visitors finish them. You can load a sample queue to see the feed before the floor opens."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						variant: "outline",
						onClick: () => {
							seedSampleLeads().then(async (result) => {
								if (!result.ok) {
									setSampleMessage(result.error);
									return;
								}
								setSampleMessage(result.inserted ? "Sample queue added." : "Sample queue is already on the desk.");
								await refresh();
							});
						},
						children: "Load sample queue"
					}),
					sampleMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-subtle",
						children: sampleMessage
					}) : null
				]
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted",
				children: "Nothing matches these filters."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 flex flex-col gap-3",
				children: filtered.map((lead) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn("rounded-xl bg-surface p-4 ring-1", fresh.has(lead.id) ? "ring-fg" : "ring-border"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-widest text-subtle uppercase",
									children: lead.mode === "voice" ? "Voice" : "Form"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-1 text-lg font-medium",
									children: lead.name || "Unnamed voice note"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: lead.schoolName || "Institution not captured"
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle tabular-nums",
								children: when(lead.createdAt)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm tabular-nums tracking-wide",
							children: lead.phone ? formatPhone(lead.phone) : "No mobile yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2 text-xs",
							children: [
								lead.objective ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full px-2 py-1 ring-1 ring-border",
									children: lead.objective
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("rounded-full px-2 py-1 ring-1 ring-border", lead.status === "confirmed" && "text-ok"),
									children: lead.status
								}),
								lead.callbackSlot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full px-2 py-1 text-muted ring-1 ring-border",
									children: lead.callbackSlot
								}) : null,
								lead.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full px-2 py-1 text-muted ring-1 ring-border",
									children: lead.email
								}) : null
							]
						}),
						lead.bullets.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 list-disc space-y-1 pl-5 text-sm text-muted",
							children: lead.bullets.map((bullet) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: bullet }, bullet))
						}) : null,
						lead.rawTranscript ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer text-sm text-subtle",
								children: "Transcript"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: lead.rawTranscript
							})]
						}) : null
					]
				}, lead.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 max-w-sm border-t border-border pt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Change access code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-subtle",
						children: "Replaces the preview code for this desk."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-col gap-3",
						onSubmit: (event) => {
							event.preventDefault();
							setBoothCode({ data: { code: nextCode } }).then((result) => {
								if (!result.ok) {
									setCodeMessage(result.error);
									return;
								}
								setUsingDefaultCode(false);
								setNextCode("");
								setCodeMessage("Access code updated.");
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: nextCode,
								onChange: (event) => setNextCode(event.target.value),
								type: "password",
								autoComplete: "new-password",
								placeholder: "New code",
								minLength: 6
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "outline",
								disabled: nextCode.trim().length < 6,
								children: "Save code"
							}),
							codeMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-subtle",
								children: codeMessage
							}) : null
						]
					})
				]
			})
		]
	});
}
function Filter({ label, value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-2 text-sm font-medium",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value,
			onChange: (event) => onChange(event.target.value),
			className: "h-11 rounded-md bg-surface px-3 text-sm text-fg ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-fg/30",
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: option,
				children: option || "All"
			}, option || "all"))
		})]
	});
}
function AdminPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDesk, {});
}
//#endregion
export { AdminPage as component };
