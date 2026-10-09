import { o as __toESM } from "../_runtime.mjs";
import { g as todayIso, n as SLOTS, t as OBJECTIVES } from "./lead-model-DC03iF1B.mjs";
import { J as require_react, Y as require_jsx_runtime, b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as OriginLogo } from "./mark-BHVgysz8.mjs";
import { n as Input, o as cn, p as submitManual, t as Button, u as processVoice } from "./leads.functions-NhQJjj9k.mjs";
import { a as LoaderCircle, i as Mic, n as Square, s as ClipboardList } from "../_libs/lucide-react.mjs";
import { n as Field, r as Textarea, t as ChoiceGroup } from "./textarea-Cu3zwWa_.mjs";
import { t as VisitorFrame } from "./visitor-frame-CXIKSup9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/capture-page-CAbYMtvb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ManualPanel() {
	const navigate = useNavigate();
	const clientKey = (0, import_react.useRef)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [schoolName, setSchoolName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [callbackDate, setCallbackDate] = (0, import_react.useState)("");
	const [callbackSlot, setCallbackSlot] = (0, import_react.useState)("");
	const [objective, setObjective] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setCallbackDate(todayIso());
	}, []);
	async function onSubmit(event) {
		event.preventDefault();
		if (!clientKey.current) clientKey.current = crypto.randomUUID();
		setBusy(true);
		setError("");
		try {
			const result = await submitManual({ data: {
				clientKey: clientKey.current,
				name,
				schoolName,
				phone,
				email,
				callbackDate,
				callbackSlot,
				objective,
				notes
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			await navigate({
				to: "/thanks",
				search: {
					name: result.name,
					mail: "none"
				}
			});
		} catch {
			setError("Couldn't save this form. Try again.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-5 pb-24",
		onSubmit: (event) => void onSubmit(event),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Full name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (event) => setName(event.target.value),
					autoComplete: "name",
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Institution",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: schoolName,
					onChange: (event) => setSchoolName(event.target.value),
					autoComplete: "organization",
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Mobile number",
				hint: "10-digit Indian mobile.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: phone,
					onChange: (event) => setPhone(event.target.value),
					inputMode: "numeric",
					autoComplete: "tel",
					placeholder: "98XXXXXXXX",
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Email",
				hint: "Optional. Used for the thank-you note.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: email,
					onChange: (event) => setEmail(event.target.value),
					type: "email",
					autoComplete: "email",
					inputMode: "email"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Preferred callback date",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: callbackDate,
					onChange: (event) => setCallbackDate(event.target.value),
					type: "date",
					min: todayIso(),
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceGroup, {
				legend: "Time slot",
				name: "callback-slot",
				value: callbackSlot,
				onChange: setCallbackSlot,
				options: SLOTS.map((slot) => ({
					value: slot.value,
					title: slot.title,
					detail: slot.detail
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceGroup, {
				legend: "Objective",
				name: "objective",
				value: objective,
				onChange: setObjective,
				options: OBJECTIVES.map((item) => ({
					value: item,
					title: item
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Requirement notes",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: notes,
					onChange: (event) => setNotes(event.target.value),
					placeholder: "What should the booth team follow up on?"
				})
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "lg",
				type: "submit",
				disabled: busy,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, busy ? "Saving" : "Submit"]
			})
		]
	});
}
var BARS = 27;
function Waveform({ active, disabled, onToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-44 w-full items-center justify-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("absolute inset-x-4 flex h-28 items-center justify-center gap-1", active ? "ios-live" : "ios-idle"),
				"aria-hidden": "true",
				children: Array.from({ length: BARS }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ios-bar",
					style: {
						["--i"]: String(index),
						["--n"]: String(index % 7)
					}
				}, index))
			}),
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ios-pulse",
				"aria-hidden": "true"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mic-disc press relative z-10 flex size-24 items-center justify-center rounded-full text-fg outline-none focus-visible:ring-2 focus-visible:ring-fg/30 disabled:opacity-40",
				"data-live": active ? "true" : "false",
				"aria-pressed": active,
				"aria-label": active ? "Stop recording" : "Start recording",
				disabled,
				onClick: onToggle,
				children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
					className: "size-7 fill-current",
					strokeWidth: 0
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
					className: "size-8",
					strokeWidth: 1.75
				})
			})
		]
	});
}
function VoicePanel() {
	const navigate = useNavigate();
	const recognitionRef = (0, import_react.useRef)(null);
	const wantRef = (0, import_react.useRef)(false);
	const clientKey = (0, import_react.useRef)(null);
	const [listening, setListening] = (0, import_react.useState)(false);
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [interim, setInterim] = (0, import_react.useState)("");
	const [speechError, setSpeechError] = (0, import_react.useState)("");
	const [formError, setFormError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		return () => {
			wantRef.current = false;
			try {
				recognitionRef.current?.abort();
			} catch {}
		};
	}, []);
	function ensureRecognition() {
		if (recognitionRef.current) return recognitionRef.current;
		const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!Ctor) return null;
		const recognition = new Ctor();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "ta-IN";
		recognition.onresult = (event) => {
			let finalAdd = "";
			let nextInterim = "";
			for (let i = event.resultIndex; i < event.results.length; i += 1) {
				const piece = event.results[i]?.[0]?.transcript ?? "";
				if (event.results[i]?.isFinal) finalAdd += piece;
				else nextInterim += piece;
			}
			if (finalAdd.trim()) setTranscript((prev) => {
				const base = prev.trim();
				const next = finalAdd.trim();
				return base ? `${base} ${next}` : next;
			});
			setInterim(nextInterim.trim());
		};
		recognition.onerror = (event) => {
			if (event.error === "language-not-supported" && recognition.lang !== "en-IN") {
				recognition.lang = "en-IN";
				window.setTimeout(() => {
					if (!wantRef.current) return;
					try {
						recognition.start();
					} catch {}
				}, 200);
				return;
			}
			if (event.error === "not-allowed" || event.error === "service-not-allowed") {
				wantRef.current = false;
				setListening(false);
				setSpeechError("Microphone is blocked. Type the conversation instead.");
			}
		};
		recognition.onend = () => {
			if (!wantRef.current) {
				setListening(false);
				setInterim("");
				return;
			}
			window.setTimeout(() => {
				if (!wantRef.current) return;
				try {
					recognition.start();
				} catch {}
			}, 300);
		};
		recognitionRef.current = recognition;
		return recognition;
	}
	function startListening() {
		setListening(true);
		const recognition = ensureRecognition();
		if (!recognition) {
			setSpeechError("This browser has no voice capture. The wave still runs — type the conversation.");
			return;
		}
		recognition.lang = "ta-IN";
		setSpeechError("");
		wantRef.current = true;
		try {
			recognition.start();
		} catch {}
	}
	function stopListening() {
		wantRef.current = false;
		setListening(false);
		setInterim("");
		try {
			recognitionRef.current?.stop();
		} catch {}
	}
	async function onProcess() {
		stopListening();
		const text = transcript.trim();
		if (text.length < 4) {
			setFormError("Add a few words before processing.");
			return;
		}
		if (!clientKey.current) clientKey.current = crypto.randomUUID();
		setBusy(true);
		setFormError("");
		try {
			const result = await processVoice({ data: {
				transcript: text,
				clientKey: clientKey.current
			} });
			if (!result.ok) {
				setFormError(result.error);
				return;
			}
			await navigate({
				to: "/confirmation",
				search: {
					id: result.id,
					token: result.token
				}
			});
		} catch {
			setFormError("Couldn't reach the desk. Your words are still here — try again.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass rounded-2xl p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Speak in Tamil, English, or both"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-2 list-decimal space-y-1 pl-5 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Your name and institution" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "10-digit mobile number" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Your requirement or pain point" })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waveform, {
					active: listening,
					onToggle: () => listening ? stopListening() : startListening()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					"aria-live": "polite",
					children: listening ? "Listening in Tamil and English. Tap stop when you are done." : "Tap the mic. The bars stay still until you record."
				})]
			}),
			speechError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: speechError
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "glass flex flex-col gap-2 rounded-2xl p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-1 text-sm font-medium",
						children: "Live transcript"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: transcript,
						onChange: (event) => setTranscript(event.target.value),
						placeholder: "Your words appear here. Edit a name, institution, or number before processing.",
						"aria-label": "Live transcript",
						className: "border-0 bg-elevated/80 shadow-none"
					}),
					interim ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "px-1 text-sm text-subtle",
						"aria-live": "polite",
						children: ["Hearing: ", interim]
					}) : null
				]
			}),
			formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: formError
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "lg",
				onClick: () => void onProcess(),
				disabled: busy || transcript.trim().length < 4,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, busy ? "Reading the conversation" : "Process with AI"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-subtle",
				children: "Silence does not send anything. The raw note is saved as a draft before it is read."
			})
		]
	});
}
function CapturePage({ initialMode }) {
	const [mode, setMode] = (0, import_react.useState)(initialMode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitorFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-md flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3 px-4 pt-5 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OriginLogo, { className: "h-10 w-auto max-w-full object-contain object-left" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs font-medium tracking-wide text-muted",
						children: "VidyaConnect"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin",
					className: "shrink-0 text-sm font-medium text-fg",
					children: "Desk"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "A minute with the booth. Speak it, or write it."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "glass mt-4 grid grid-cols-2 rounded-full p-1",
					role: "group",
					"aria-label": "Capture mode",
					children: [{
						id: "voice",
						label: "Voice mode",
						icon: Mic
					}, {
						id: "manual",
						label: "Manual form",
						icon: ClipboardList
					}].map((option) => {
						const selected = mode === option.id;
						const Icon = option.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": selected,
							onClick: () => setMode(option.id),
							className: cn("press flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium", selected ? "bg-accent text-accent-fg" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4",
								strokeWidth: 1.75
							}), option.label]
						}, option.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex-1 px-4",
				children: mode === "voice" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoicePanel, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualPanel, {})
			})
		]
	}) });
}
//#endregion
export { CapturePage as t };
