import { a as cleanPhone, c as isEmail, d as isSlot, g as todayIso, h as thankYouEmailHtml, i as cleanName, l as isIsoDate, m as parseBullets, o as extractIndianMobile, p as normalizeParsed, r as bulletsFromNotes, u as isObjective } from "./lead-model-DC03iF1B.mjs";
import { a as useSession$1, i as getRequestIP$1 } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads.server-DzdGQgHg.js
var _0002_leads_default = "create table if not exists leads (\n  id text primary key,\n  created_at timestamptz not null default now(),\n  mode text not null check (mode in ('voice', 'manual')),\n  status text not null default 'draft' check (status in ('draft', 'submitted', 'confirmed')),\n  name text,\n  phone text,\n  email text,\n  school_name text,\n  raw_transcript text,\n  bullet_requirements jsonb,\n  callback_date date,\n  callback_slot text,\n  objective text,\n  email_sent boolean not null default false,\n  edit_token text not null,\n  client_key text unique\n);\n\ncreate index if not exists leads_created_at_idx on leads (created_at desc);\n\ncreate table if not exists booth_settings (\n  id integer primary key,\n  pin_hash text,\n  updated_at timestamptz not null default now()\n);\n\ninsert into booth_settings (id)\nvalues (1)\non conflict (id) do nothing;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_leads.sql": _0002_leads_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function env(key) {
	return process.env[key]?.trim() || void 0;
}
var SESSION_PASSWORD = env("ADMIN_SESSION_SECRET") && (env("ADMIN_SESSION_SECRET")?.length ?? 0) >= 32 ? env("ADMIN_SESSION_SECRET") : "vidyaconnect-booth-session-key-32b";
function sessionConfig() {
	return {
		password: SESSION_PASSWORD,
		name: "vidya_admin",
		maxAge: 43200,
		cookie: {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			secure: false
		}
	};
}
function rateBuckets() {
	const holder = globalThis;
	holder.__vidyaRate__ ??= /* @__PURE__ */ new Map();
	return holder.__vidyaRate__;
}
function limited(key, limit, windowMs) {
	const map = rateBuckets();
	const now = Date.now();
	const row = map.get(key);
	if (!row || row.reset < now) {
		map.set(key, {
			n: 1,
			reset: now + windowMs
		});
		return false;
	}
	row.n += 1;
	return row.n > limit;
}
function clientIp() {
	return getRequestIP$1({ xForwardedFor: true }) || "local";
}
async function randomToken() {
	const { randomBytes } = await import("node:crypto");
	return randomBytes(18).toString("hex");
}
async function hashPin(pin) {
	const { randomBytes, scryptSync } = await import("node:crypto");
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${scryptSync(pin, salt, 32).toString("hex")}`;
}
async function verifyPin(pin, stored) {
	const { scryptSync, timingSafeEqual } = await import("node:crypto");
	const [salt, hash] = stored.split(":");
	if (!salt || !hash) return false;
	const next = scryptSync(pin, salt, 32);
	const prev = Buffer.from(hash, "hex");
	if (next.length !== prev.length) return false;
	return timingSafeEqual(next, prev);
}
async function safeEqual(a, b) {
	const { timingSafeEqual } = await import("node:crypto");
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}
async function adminSession() {
	return useSession$1(sessionConfig());
}
async function requireAdmin() {
	const session = await adminSession();
	if (session.data.admin !== true) return null;
	return session;
}
function asIso(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return "";
}
function asDate(value) {
	if (!value) return "";
	if (typeof value === "string") return value.slice(0, 10);
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return "";
}
function asText(value) {
	return typeof value === "string" ? value : "";
}
function mapLead(row) {
	const mode = row.mode === "manual" ? "manual" : "voice";
	const status = row.status === "confirmed" || row.status === "submitted" ? row.status : "draft";
	return {
		id: asText(row.id),
		createdAt: asIso(row.created_at),
		mode,
		status,
		name: asText(row.name),
		phone: asText(row.phone),
		email: asText(row.email),
		schoolName: asText(row.school_name),
		rawTranscript: asText(row.raw_transcript),
		bullets: parseBullets(row.bullet_requirements),
		callbackDate: asDate(row.callback_date),
		callbackSlot: asText(row.callback_slot),
		objective: asText(row.objective),
		emailSent: row.email_sent === true
	};
}
var LEAD_COLUMNS = `
  id, created_at, mode, status, name, phone, email, school_name, raw_transcript,
  bullet_requirements, callback_date, callback_slot, objective, email_sent
`;
async function findLead(sql, id, token) {
	const rows = await sql.query(`select ${LEAD_COLUMNS} from leads where id = $1 and edit_token = $2 limit 1`, [id, token]);
	return rows[0] ? mapLead(rows[0]) : null;
}
function validClientKey(value) {
	return /^[a-zA-Z0-9-]{8,80}$/.test(value);
}
async function sendThankYou(lead) {
	const apiKey = env("RESEND_API_KEY");
	if (!lead.email) return {
		emailSent: false,
		emailState: "none"
	};
	if (!apiKey) return {
		emailSent: false,
		emailState: "skipped"
	};
	const from = env("RESEND_FROM") || "VidyaConnect <onboarding@resend.dev>";
	try {
		if (!(await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				from,
				to: [lead.email],
				subject: lead.name ? `Thank you, ${lead.name} — VidyaConnect` : "Thank you — VidyaConnect",
				html: thankYouEmailHtml({
					name: lead.name,
					phone: lead.phone,
					schoolName: lead.schoolName,
					objective: lead.objective,
					bullets: lead.bullets,
					callbackDate: lead.callbackDate,
					callbackSlot: lead.callbackSlot
				})
			})
		})).ok) return {
			emailSent: false,
			emailState: "skipped"
		};
		return {
			emailSent: true,
			emailState: "sent"
		};
	} catch {
		return {
			emailSent: false,
			emailState: "skipped"
		};
	}
}
function extractJson(text) {
	const trimmed = text.trim();
	try {
		return JSON.parse(trimmed);
	} catch {
		const start = trimmed.indexOf("{");
		const end = trimmed.lastIndexOf("}");
		if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
		throw new Error("unreadable");
	}
}
async function callGrok(transcript, withSchema) {
	const apiKey = env("XAI_API_KEY");
	if (!apiKey) return null;
	const hint = extractIndianMobile(transcript);
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: 0,
			max_tokens: 450,
			...withSchema ? { response_format: { type: "json_object" } } : {},
			messages: [{
				role: "system",
				content: "The transcript may be Tamil script, English, or Tamil mixed with English. Keep the person's name and institution as spoken. Resolve spoken numbers: double nine = 99, triple eight = 888, oh = 0. Return JSON only with keys name, phone, school_name, requirements_summary, detected_objective. phone is a 10-digit Indian mobile with no country code, or an empty string. school_name is the institution they name — a school, college, campus, or organisation — or null. Visitors may say institution instead of school. requirements_summary is 1 to 4 short sentences of the real requirement, never a single noun and never invented. detected_objective is exactly one of \"Demo\", \"Know More\", \"Catch-up Call\". Demo means they want a product demonstration. Catch-up Call means a callback or meeting. Otherwise Know More. Do not invent a name, institution, or phone that is not supported by the transcript."
			}, {
				role: "user",
				content: `Digit hint from a deterministic pass, which may be wrong: ${hint || "none"}\n\nTranscript:\n${transcript}`
			}]
		})
	});
	if (!res.ok) {
		const error = /* @__PURE__ */ new Error(`status ${res.status}`);
		error.status = res.status;
		throw error;
	}
	const content = (await res.json()).choices?.[0]?.message?.content ?? "";
	return normalizeParsed(extractJson(content), transcript);
}
async function parseTranscript(transcript) {
	if (!env("XAI_API_KEY")) return {
		ai: false,
		parsed: normalizeParsed({}, transcript)
	};
	try {
		const parsed = await callGrok(transcript, true);
		if (!parsed) return {
			ai: false,
			parsed: normalizeParsed({}, transcript)
		};
		return {
			ai: true,
			parsed
		};
	} catch (error) {
		const status = error.status;
		if (status !== 400 && status !== 422) return {
			ai: false,
			parsed: normalizeParsed({}, transcript)
		};
		try {
			const parsed = await callGrok(transcript, false);
			if (!parsed) return {
				ai: false,
				parsed: normalizeParsed({}, transcript)
			};
			return {
				ai: true,
				parsed
			};
		} catch {
			return {
				ai: false,
				parsed: normalizeParsed({}, transcript)
			};
		}
	}
}
async function processVoiceLead(input) {
	const transcript = input.transcript.trim();
	if (transcript.length < 4) return {
		ok: false,
		error: "Add a few words before processing."
	};
	if (!validClientKey(input.clientKey)) return {
		ok: false,
		error: "Could not start this capture. Reload and try again."
	};
	const ip = clientIp();
	if (limited(`lead:${ip}`, 40, 36e5)) return {
		ok: false,
		error: "This phone has sent a lot of notes. Try again in a little while."
	};
	if (limited(`ai:${ip}`, 20, 36e5)) return {
		ok: false,
		error: "Voice reading is paused for this phone. Use the form, or try later."
	};
	const sql = await getSql();
	const existing = await sql`
    select id, edit_token, status from leads where client_key = ${input.clientKey} limit 1
  `;
	let id = existing[0]?.id ?? "";
	let token = existing[0]?.edit_token ?? "";
	if (!existing[0]) {
		id = crypto.randomUUID();
		token = await randomToken();
		await sql`
      insert into leads (id, mode, status, raw_transcript, edit_token, client_key)
      values (${id}, 'voice', 'draft', ${transcript}, ${token}, ${input.clientKey})
    `;
	} else if (existing[0].status === "draft") await sql`
      update leads
      set raw_transcript = ${transcript}, mode = 'voice'
      where id = ${id} and edit_token = ${token}
    `;
	else {
		const lead = await findLead(sql, id, token);
		return {
			ok: true,
			id,
			token,
			ai: true,
			lead
		};
	}
	const { ai, parsed } = await parseTranscript(transcript);
	await sql`
    update leads
    set
      name = ${parsed.name || null},
      phone = ${parsed.phone || null},
      school_name = ${parsed.schoolName || null},
      bullet_requirements = ${JSON.stringify(parsed.bullets)}::jsonb,
      objective = ${parsed.objective}
    where id = ${id} and edit_token = ${token} and status = 'draft'
  `;
	const lead = await findLead(sql, id, token);
	return {
		ok: true,
		id,
		token,
		ai,
		lead
	};
}
async function readLead(input) {
	if (!input.id || !input.token) return {
		ok: false,
		error: "This confirmation link is incomplete."
	};
	const lead = await findLead(await getSql(), input.id, input.token);
	if (!lead) return {
		ok: false,
		error: "This confirmation link is not valid."
	};
	return {
		ok: true,
		lead
	};
}
async function confirmLead(input) {
	const name = cleanName(input.name);
	const phone = cleanPhone(input.phone);
	const email = input.email.trim().toLowerCase();
	const schoolName = cleanName(input.schoolName);
	const bullets = bulletsFromNotes(input.bulletsText);
	if (name.length < 2) return {
		ok: false,
		error: "Add the visitor's name."
	};
	if (!phone) return {
		ok: false,
		error: "Enter a 10-digit Indian mobile number."
	};
	if (email && !isEmail(email)) return {
		ok: false,
		error: "That email does not look right."
	};
	if (!isObjective(input.objective)) return {
		ok: false,
		error: "Choose what they want next."
	};
	const sql = await getSql();
	if (!await findLead(sql, input.id, input.token)) return {
		ok: false,
		error: "This confirmation link is not valid."
	};
	await sql`
    update leads
    set
      name = ${name},
      phone = ${phone},
      email = ${email || null},
      school_name = ${schoolName || null},
      bullet_requirements = ${JSON.stringify(bullets)}::jsonb,
      objective = ${input.objective},
      status = 'confirmed'
    where id = ${input.id} and edit_token = ${input.token}
  `;
	const lead = await findLead(sql, input.id, input.token);
	if (!lead) return {
		ok: false,
		error: "Could not save the confirmation."
	};
	if (lead.emailSent) return {
		ok: true,
		name: lead.name,
		emailState: "sent"
	};
	const mailed = await sendThankYou(lead);
	if (mailed.emailSent) await sql`update leads set email_sent = true where id = ${input.id} and edit_token = ${input.token}`;
	return {
		ok: true,
		name: lead.name,
		emailState: mailed.emailState
	};
}
async function submitManualLead(input) {
	if (!validClientKey(input.clientKey)) return {
		ok: false,
		error: "Could not start this form. Reload and try again."
	};
	if (limited(`lead:${clientIp()}`, 40, 36e5)) return {
		ok: false,
		error: "This phone has sent a lot of notes. Try again in a little while."
	};
	const name = cleanName(input.name);
	const schoolName = cleanName(input.schoolName);
	const phone = cleanPhone(input.phone);
	const email = input.email.trim().toLowerCase();
	const notes = input.notes.trim().slice(0, 1e3);
	if (name.length < 2) return {
		ok: false,
		error: "Add the full name."
	};
	if (schoolName.length < 2) return {
		ok: false,
		error: "Add the institution name."
	};
	if (!phone) return {
		ok: false,
		error: "Enter a 10-digit Indian mobile number."
	};
	if (email && !isEmail(email)) return {
		ok: false,
		error: "That email does not look right."
	};
	if (!isIsoDate(input.callbackDate) || input.callbackDate < todayIso()) return {
		ok: false,
		error: "Choose today or a later callback date."
	};
	if (!isSlot(input.callbackSlot)) return {
		ok: false,
		error: "Choose a callback slot."
	};
	if (!isObjective(input.objective)) return {
		ok: false,
		error: "Choose an objective."
	};
	const sql = await getSql();
	const existing = await sql`
    select id, edit_token from leads where client_key = ${input.clientKey} limit 1
  `;
	const bullets = bulletsFromNotes(notes);
	const objective = input.objective;
	if (existing[0]) {
		await sql`
      update leads
      set
        mode = 'manual',
        status = 'submitted',
        name = ${name},
        phone = ${phone},
        email = ${email || null},
        school_name = ${schoolName},
        bullet_requirements = ${JSON.stringify(bullets)}::jsonb,
        callback_date = ${input.callbackDate},
        callback_slot = ${input.callbackSlot},
        objective = ${objective},
        raw_transcript = ${notes || null}
      where id = ${existing[0].id} and edit_token = ${existing[0].edit_token}
    `;
		return {
			ok: true,
			name
		};
	}
	const id = crypto.randomUUID();
	const token = await randomToken();
	await sql`
    insert into leads (
      id, mode, status, name, phone, email, school_name, raw_transcript,
      bullet_requirements, callback_date, callback_slot, objective, edit_token, client_key
    ) values (
      ${id},
      'manual',
      'submitted',
      ${name},
      ${phone},
      ${email || null},
      ${schoolName},
      ${notes || null},
      ${JSON.stringify(bullets)}::jsonb,
      ${input.callbackDate},
      ${input.callbackSlot},
      ${objective},
      ${token},
      ${input.clientKey}
    )
  `;
	return {
		ok: true,
		name
	};
}
async function pinState(sql) {
	return (await sql`
    select pin_hash from booth_settings where id = 1
  `)[0]?.pin_hash ?? null;
}
async function adminGateState() {
	const session = await adminSession();
	const hash = await pinState(await getSql());
	return {
		signedIn: session.data.admin === true,
		usingDefaultCode: !hash
	};
}
async function adminLoginState(input) {
	const code = input.code.trim();
	if (limited(`login:${clientIp()}`, 8, 6e5)) return {
		ok: false,
		error: "Too many attempts. Wait a few minutes."
	};
	const hash = await pinState(await getSql());
	if (!(hash ? await verifyPin(code, hash) : await safeEqual(code, "summit-floor"))) return {
		ok: false,
		error: "That access code is not right."
	};
	await (await adminSession()).update({ admin: true });
	return { ok: true };
}
async function adminLogoutState() {
	await (await adminSession()).clear();
	return { ok: true };
}
async function listLeadState() {
	if (!await requireAdmin()) return {
		ok: false,
		error: "Sign in to the booth desk."
	};
	return {
		ok: true,
		leads: (await (await getSql()).query(`select ${LEAD_COLUMNS} from leads order by created_at desc limit 400`)).map(mapLead)
	};
}
async function changeBoothCode(input) {
	if (!await requireAdmin()) return {
		ok: false,
		error: "Sign in to the booth desk."
	};
	const code = input.code.trim();
	if (code.length < 6 || code.length > 64) return {
		ok: false,
		error: "Use 6 to 64 characters."
	};
	const sql = await getSql();
	const pin = await hashPin(code);
	await sql`
    insert into booth_settings (id, pin_hash, updated_at)
    values (1, ${pin}, now())
    on conflict (id) do update set pin_hash = ${pin}, updated_at = now()
  `;
	return { ok: true };
}
async function loadSampleQueue() {
	if (!await requireAdmin()) return {
		ok: false,
		error: "Sign in to the booth desk."
	};
	const sql = await getSql();
	const tomorrow = todayIso(new Date(Date.now() + 864e5));
	const samples = [
		{
			key: "sample-ananya",
			mode: "manual",
			status: "confirmed",
			name: "Ananya Iyer",
			phone: "9845012345",
			email: "ananya@greenwood.example",
			school: "Greenwood International",
			transcript: null,
			bullets: ["Wants a live demo of the parent communication app", "Board meets next Thursday"],
			date: tomorrow,
			slot: "Morning (9:00 AM – 11:00 AM)",
			objective: "Demo"
		},
		{
			key: "sample-rahul",
			mode: "manual",
			status: "submitted",
			name: "Rahul Menon",
			phone: "9900088776",
			email: null,
			school: "St. Joseph's Residential",
			transcript: "Comparing three vendors for attendance.",
			bullets: ["Comparing three vendors for attendance"],
			date: tomorrow,
			slot: "Afternoon (1:00 PM – 3:00 PM)",
			objective: "Know More"
		},
		{
			key: "sample-farida",
			mode: "voice",
			status: "draft",
			name: null,
			phone: null,
			email: null,
			school: null,
			transcript: "This is Farida from Crescent School. My number is nine eight one one one two three three four four. We need help with fee collection.",
			bullets: [],
			date: null,
			slot: null,
			objective: null
		}
	];
	let inserted = 0;
	for (const sample of samples) {
		const rows = await sql`
      insert into leads (
        id, mode, status, name, phone, email, school_name, raw_transcript,
        bullet_requirements, callback_date, callback_slot, objective, edit_token, client_key, email_sent
      ) values (
        ${crypto.randomUUID()},
        ${sample.mode},
        ${sample.status},
        ${sample.name},
        ${sample.phone},
        ${sample.email},
        ${sample.school},
        ${sample.transcript},
        ${JSON.stringify(sample.bullets)}::jsonb,
        ${sample.date},
        ${sample.slot},
        ${sample.objective},
        ${await randomToken()},
        ${sample.key},
        false
      )
      on conflict (client_key) do nothing
      returning id
    `;
		inserted += rows.length;
	}
	return {
		ok: true,
		inserted
	};
}
//#endregion
export { adminGateState, adminLoginState, adminLogoutState, changeBoothCode, confirmLead, listLeadState, loadSampleQueue, processVoiceLead, readLead, submitManualLead };
