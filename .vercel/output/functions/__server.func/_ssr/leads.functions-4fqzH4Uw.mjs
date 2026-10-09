import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads.functions-4fqzH4Uw.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var processVoice_createServerFn_handler = createServerRpc({
	id: "1bebe412973200707ab7cef40f9ebe1f856db5de331067d1ead2b2b822564c3d",
	name: "processVoice",
	filename: "src/lib/leads.functions.ts"
}, (opts) => processVoice.__executeServer(opts));
var processVoice = createServerFn({ method: "POST" }).validator((input) => {
	const data = record(input);
	return {
		transcript: text(data.transcript, 4e3).trim(),
		clientKey: text(data.clientKey, 80).trim()
	};
}).handler(processVoice_createServerFn_handler, async ({ data }) => {
	const { processVoiceLead } = await import("./leads.server-DzdGQgHg.mjs");
	return processVoiceLead(data);
});
var getLead_createServerFn_handler = createServerRpc({
	id: "9ba435182af651646a6e2c0c517332c38983db18d8dcda7e337e568b2e110db4",
	name: "getLead",
	filename: "src/lib/leads.functions.ts"
}, (opts) => getLead.__executeServer(opts));
var getLead = createServerFn({ method: "POST" }).validator((input) => {
	const data = record(input);
	return {
		id: text(data.id, 80),
		token: text(data.token, 80)
	};
}).handler(getLead_createServerFn_handler, async ({ data }) => {
	const { readLead } = await import("./leads.server-DzdGQgHg.mjs");
	return readLead(data);
});
var confirmVoice_createServerFn_handler = createServerRpc({
	id: "53a587810f7d7443d0020df55901de3c9bc7247f0191bc8b0035cb90398010f9",
	name: "confirmVoice",
	filename: "src/lib/leads.functions.ts"
}, (opts) => confirmVoice.__executeServer(opts));
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
}).handler(confirmVoice_createServerFn_handler, async ({ data }) => {
	const { confirmLead } = await import("./leads.server-DzdGQgHg.mjs");
	return confirmLead(data);
});
var submitManual_createServerFn_handler = createServerRpc({
	id: "fc9a69a9736c7d1914602724c585b0d40ff408cae0ec7747dd3ed3be07fa9b06",
	name: "submitManual",
	filename: "src/lib/leads.functions.ts"
}, (opts) => submitManual.__executeServer(opts));
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
}).handler(submitManual_createServerFn_handler, async ({ data }) => {
	const { submitManualLead } = await import("./leads.server-DzdGQgHg.mjs");
	return submitManualLead(data);
});
var adminGate_createServerFn_handler = createServerRpc({
	id: "3c76ecc8e53a7437d3afc28917cf180674a1e9397e73df2bd71485523f53b82a",
	name: "adminGate",
	filename: "src/lib/leads.functions.ts"
}, (opts) => adminGate.__executeServer(opts));
var adminGate = createServerFn({ method: "GET" }).handler(adminGate_createServerFn_handler, async () => {
	const { adminGateState } = await import("./leads.server-DzdGQgHg.mjs");
	return adminGateState();
});
var adminLogin_createServerFn_handler = createServerRpc({
	id: "799d07ae85d42fd5b285b082bd19cef85a1f5884f7cd59990bc972d6ca2b75a5",
	name: "adminLogin",
	filename: "src/lib/leads.functions.ts"
}, (opts) => adminLogin.__executeServer(opts));
var adminLogin = createServerFn({ method: "POST" }).validator((input) => {
	return { code: text(record(input).code, 80) };
}).handler(adminLogin_createServerFn_handler, async ({ data }) => {
	const { adminLoginState } = await import("./leads.server-DzdGQgHg.mjs");
	return adminLoginState(data);
});
var adminLogout_createServerFn_handler = createServerRpc({
	id: "dc2df9b5a6af7707825d4cb9e8fef1b10bd42d116b4723b46f472a192cc35939",
	name: "adminLogout",
	filename: "src/lib/leads.functions.ts"
}, (opts) => adminLogout.__executeServer(opts));
var adminLogout = createServerFn({ method: "POST" }).handler(adminLogout_createServerFn_handler, async () => {
	const { adminLogoutState } = await import("./leads.server-DzdGQgHg.mjs");
	return adminLogoutState();
});
var listLeads_createServerFn_handler = createServerRpc({
	id: "77acd1c20769f0aaa93fdea78adabaa9f8b27285e13363740e4c85703e8554bc",
	name: "listLeads",
	filename: "src/lib/leads.functions.ts"
}, (opts) => listLeads.__executeServer(opts));
var listLeads = createServerFn({ method: "GET" }).handler(listLeads_createServerFn_handler, async () => {
	const { listLeadState } = await import("./leads.server-DzdGQgHg.mjs");
	return listLeadState();
});
var setBoothCode_createServerFn_handler = createServerRpc({
	id: "98961a8b9f3dec5ec178e1c8714ec5efd0971bc95dc1100e00851affc8b9a167",
	name: "setBoothCode",
	filename: "src/lib/leads.functions.ts"
}, (opts) => setBoothCode.__executeServer(opts));
var setBoothCode = createServerFn({ method: "POST" }).validator((input) => {
	return { code: text(record(input).code, 80) };
}).handler(setBoothCode_createServerFn_handler, async ({ data }) => {
	const { changeBoothCode } = await import("./leads.server-DzdGQgHg.mjs");
	return changeBoothCode(data);
});
var seedSampleLeads_createServerFn_handler = createServerRpc({
	id: "fb679afaefb2145bfc03cb7120b8c3e71e19004ed3856043bfe6cda15428cb06",
	name: "seedSampleLeads",
	filename: "src/lib/leads.functions.ts"
}, (opts) => seedSampleLeads.__executeServer(opts));
var seedSampleLeads = createServerFn({ method: "POST" }).handler(seedSampleLeads_createServerFn_handler, async () => {
	const { loadSampleQueue } = await import("./leads.server-DzdGQgHg.mjs");
	return loadSampleQueue();
});
//#endregion
export { adminGate_createServerFn_handler, adminLogin_createServerFn_handler, adminLogout_createServerFn_handler, confirmVoice_createServerFn_handler, getLead_createServerFn_handler, listLeads_createServerFn_handler, processVoice_createServerFn_handler, seedSampleLeads_createServerFn_handler, setBoothCode_createServerFn_handler, submitManual_createServerFn_handler };
