import { getRequestIP, useSession } from "@tanstack/react-start/server";
import { getSql, type Sql } from "@/lib/db";
import { env } from "@/lib/env.server";
import {
  bulletsFromNotes,
  cleanName,
  cleanPhone,
  extractIndianMobile,
  isEmail,
  isIsoDate,
  isObjective,
  isSlot,
  normalizeParsed,
  parseBullets,
  recoverDoubledSpeech,
  thankYouEmailHtml,
  todayIso,
  type Lead,
  type LeadMode,
  type LeadStatus,
  type Objective,
} from "@/lib/lead-model";

export const DEFAULT_BOOTH_CODE = "summit-floor";

const SESSION_PASSWORD =
  env("ADMIN_SESSION_SECRET") && (env("ADMIN_SESSION_SECRET")?.length ?? 0) >= 32
    ? (env("ADMIN_SESSION_SECRET") as string)
    : "vidyaconnect-booth-session-key-32b";

function sessionConfig() {
  return {
    password: SESSION_PASSWORD,
    name: "vidya_admin",
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: false,
    },
  };
}

type Bucket = { n: number; reset: number };

function rateBuckets() {
  const holder = globalThis as typeof globalThis & { __vidyaRate__?: Map<string, Bucket> };
  holder.__vidyaRate__ ??= new Map();
  return holder.__vidyaRate__;
}

function limited(key: string, limit: number, windowMs: number) {
  const map = rateBuckets();
  const now = Date.now();
  const row = map.get(key);
  if (!row || row.reset < now) {
    map.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  row.n += 1;
  return row.n > limit;
}

function clientIp() {
  return getRequestIP({ xForwardedFor: true }) || "local";
}

async function randomToken() {
  const { randomBytes } = await import("node:crypto");
  return randomBytes(18).toString("hex");
}

async function hashPin(pin: string) {
  const { randomBytes, scryptSync } = await import("node:crypto");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

async function verifyPin(pin: string, stored: string) {
  const { scryptSync, timingSafeEqual } = await import("node:crypto");
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(pin, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

async function safeEqual(a: string, b: string) {
  const { timingSafeEqual } = await import("node:crypto");
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function adminSession() {
  return useSession<{ admin?: boolean }>(sessionConfig());
}

async function requireAdmin() {
  const session = await adminSession();
  if (session.data.admin !== true) return null;
  return session;
}

function asIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return "";
}

function asDate(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return "";
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function mapLead(row: Record<string, unknown>): Lead {
  const mode: LeadMode = row.mode === "manual" ? "manual" : "voice";
  const status: LeadStatus =
    row.status === "confirmed" || row.status === "submitted" ? row.status : "draft";
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
    emailSent: row.email_sent === true,
  };
}

const LEAD_COLUMNS = `
  id, created_at, mode, status, name, phone, email, school_name, raw_transcript,
  bullet_requirements, callback_date, callback_slot, objective, email_sent
`;

async function findLead(sql: Sql, id: string, token: string) {
  const rows = await sql.query<Record<string, unknown>>(
    `select ${LEAD_COLUMNS} from leads where id = $1 and edit_token = $2 limit 1`,
    [id, token],
  );
  return rows[0] ? mapLead(rows[0]) : null;
}

function validClientKey(value: string) {
  return /^[a-zA-Z0-9-]{8,80}$/.test(value);
}

async function sendThankYou(lead: Lead) {
  const apiKey = env("RESEND_API_KEY");
  if (!lead.email) return { emailSent: false as const, emailState: "none" as const };
  if (!apiKey) return { emailSent: false as const, emailState: "skipped" as const };
  const from = env("RESEND_FROM") || "OriginBI <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [lead.email],
        subject: lead.name ? `Thank you, ${lead.name} — OriginBI` : "Thank you — OriginBI",
        html: thankYouEmailHtml({
          name: lead.name,
          phone: lead.phone,
          schoolName: lead.schoolName,
          objective: lead.objective,
          bullets: lead.bullets,
          callbackDate: lead.callbackDate,
          callbackSlot: lead.callbackSlot,
        }),
      }),
    });
    if (!res.ok) return { emailSent: false as const, emailState: "skipped" as const };
    return { emailSent: true as const, emailState: "sent" as const };
  } catch {
    return { emailSent: false as const, emailState: "skipped" as const };
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    throw new Error("unreadable");
  }
}

async function callGrok(transcript: string, withSchema: boolean) {
  const apiKey = env("XAI_API_KEY");
  if (!apiKey) return null;
  const hint = extractIndianMobile(transcript);
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(20_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0,
      max_tokens: 450,
      ...(withSchema ? { response_format: { type: "json_object" } } : {}),
      messages: [
        {
          role: "system",
          content:
            "Most visitors speak Indian English. Some speak Tamil, or English and Tamil in the same sentence. English may be written in Tamil letters (ராஜ் = Raj, மை நம்பர் இஸ் = my number is, பிளஸ் = plus). Keep the person's name and institution as spoken. " +
            "If the same phrase is pasted again and again, keep one copy. " +
            "Resolve spoken numbers in English or Tamil: double nine = 99, triple eight = 888, oh = 0, ஒன்பது = 9, எட்டு = 8, பூஜ்யம் = 0. " +
            "Return JSON only with keys name, phone, school_name, requirements_summary, detected_objective. " +
            "phone is a 10-digit Indian mobile with no country code. If the digit hint is 10 digits, use it as phone. Never leave phone empty when a mobile is spoken. " +
            "school_name is the institution they name — a school, college, campus, or organisation — or null. Visitors may say institution instead of school. requirements_summary is 1 to 4 short sentences of the real requirement, never a single noun and never invented. " +
            'detected_objective is exactly one of "Demo", "Know More", "Catch-up Call". ' +
            "Demo means they want a product demonstration. Catch-up Call means a callback or meeting. Otherwise Know More. " +
            "Do not invent a name, institution, or phone that is not supported by the transcript.",
        },
        {
          role: "user",
          content: `Digit hint from a deterministic pass, which may be wrong: ${hint || "none"}\n\nTranscript:\n${transcript}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const error = new Error(`status ${res.status}`);
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = body.choices?.[0]?.message?.content ?? "";
  return normalizeParsed(extractJson(content), transcript);
}

async function parseTranscript(transcript: string) {
  if (!env("XAI_API_KEY")) {
    return {
      ai: false as const,
      parsed: normalizeParsed({}, transcript),
    };
  }
  try {
    const parsed = await callGrok(transcript, true);
    if (!parsed) return { ai: false as const, parsed: normalizeParsed({}, transcript) };
    return { ai: true as const, parsed };
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status !== 400 && status !== 422) {
      return { ai: false as const, parsed: normalizeParsed({}, transcript) };
    }
    try {
      const parsed = await callGrok(transcript, false);
      if (!parsed) return { ai: false as const, parsed: normalizeParsed({}, transcript) };
      return { ai: true as const, parsed };
    } catch {
      return { ai: false as const, parsed: normalizeParsed({}, transcript) };
    }
  }
}

export async function transcribeBoothAudio(input: { audioBase64: string; mime: string }) {
  const apiKey = env("XAI_API_KEY");
  if (!apiKey) {
    return { ok: false as const, error: "Voice reading is unavailable. Type the note, or use the form." };
  }
  if (limited(`ai:${clientIp()}`, 200, 60 * 60 * 1000)) {
    return { ok: false as const, error: "Voice reading is paused for this phone. Use the form, or try later." };
  }
  const mime = (input.mime.split(";")[0] || "audio/webm").toLowerCase();
  const allowed = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/x-m4a", "video/mp4"];
  if (!allowed.includes(mime)) {
    return { ok: false as const, error: "This phone's recording could not be read. Type the note instead." };
  }
  let bytes: Buffer;
  try {
    bytes = Buffer.from(input.audioBase64, "base64");
  } catch {
    return { ok: false as const, error: "This recording could not be read. Try again." };
  }
  if (bytes.length < 800) return { ok: false as const, error: "That recording was too short. Try again." };
  if (bytes.length > 6_000_000) return { ok: false as const, error: "That recording is too long. Try a shorter note." };

  const ext = mime.includes("mp4") || mime.includes("m4a") ? "m4a" : mime.includes("wav") ? "wav" : "webm";
  const form = new FormData();
  form.append("model", "grok-voice-transcribe-2.0");
  form.append("file", new File([new Uint8Array(bytes)], `booth.${ext}`, { type: mime }));
  try {
    const res = await fetch("https://api.x.ai/v1/stt", {
      method: "POST",
      signal: AbortSignal.timeout(25_000),
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) return { ok: false as const, error: "Couldn't hear that clearly. Type the note, or use the form." };
    const body = (await res.json()) as { text?: string };
    const text = recoverDoubledSpeech((body.text ?? "").trim());
    if (text.length < 2) return { ok: false as const, error: "Couldn't hear that clearly. Type the note, or use the form." };
    return { ok: true as const, text };
  } catch {
    return { ok: false as const, error: "Couldn't reach voice reading. Type the note, or use the form." };
  }
}

export async function processVoiceLead(input: { transcript: string; clientKey: string }) {
  const transcript = recoverDoubledSpeech(input.transcript.trim());
  if (transcript.length < 4) {
    return { ok: false as const, error: "Add a few words before processing." };
  }
  if (!validClientKey(input.clientKey)) {
    return { ok: false as const, error: "Could not start this capture. Reload and try again." };
  }
  const ip = clientIp();
  if (limited(`lead:${ip}`, 400, 60 * 60 * 1000)) {
    return { ok: false as const, error: "This phone has sent a lot of notes. Try again in a little while." };
  }
  if (limited(`ai:${ip}`, 200, 60 * 60 * 1000)) {
    return { ok: false as const, error: "Voice reading is paused for this phone. Use the form, or try later." };
  }

  const sql = await getSql();
  const existing = await sql<{ id: string; edit_token: string; status: string }>`
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
  } else if (existing[0].status === "draft") {
    await sql`
      update leads
      set raw_transcript = ${transcript}, mode = 'voice'
      where id = ${id} and edit_token = ${token}
    `;
  } else {
    const lead = await findLead(sql, id, token);
    return {
      ok: true as const,
      id,
      token,
      ai: true,
      lead,
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
  return { ok: true as const, id, token, ai, lead };
}

export async function readLead(input: { id: string; token: string }) {
  if (!input.id || !input.token) {
    return { ok: false as const, error: "This confirmation link is incomplete." };
  }
  const sql = await getSql();
  const lead = await findLead(sql, input.id, input.token);
  if (!lead) return { ok: false as const, error: "This confirmation link is not valid." };
  return { ok: true as const, lead };
}

export async function confirmLead(input: {
  id: string;
  token: string;
  name: string;
  phone: string;
  email: string;
  schoolName: string;
  objective: string;
  bulletsText: string;
}) {
  const name = cleanName(input.name);
  const phone = cleanPhone(input.phone);
  const email = input.email.trim().toLowerCase();
  const schoolName = cleanName(input.schoolName);
  const bullets = bulletsFromNotes(input.bulletsText);
  if (name.length < 2) return { ok: false as const, error: "Add the visitor's name." };
  if (!phone) return { ok: false as const, error: "Enter a 10-digit Indian mobile number." };
  if (email && !isEmail(email)) return { ok: false as const, error: "That email does not look right." };
  if (!isObjective(input.objective)) return { ok: false as const, error: "Choose what they want next." };

  const sql = await getSql();
  const current = await findLead(sql, input.id, input.token);
  if (!current) return { ok: false as const, error: "This confirmation link is not valid." };

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
  if (!lead) return { ok: false as const, error: "Could not save the confirmation." };

  if (lead.emailSent) {
    return { ok: true as const, name: lead.name, emailState: "sent" as const };
  }
  const mailed = await sendThankYou(lead);
  if (mailed.emailSent) {
    await sql`update leads set email_sent = true where id = ${input.id} and edit_token = ${input.token}`;
  }
  return { ok: true as const, name: lead.name, emailState: mailed.emailState };
}

export async function submitManualLead(input: {
  clientKey: string;
  name: string;
  schoolName: string;
  phone: string;
  email: string;
  callbackDate: string;
  callbackSlot: string;
  objective: string;
  notes: string;
}) {
  if (!validClientKey(input.clientKey)) {
    return { ok: false as const, error: "Could not start this form. Reload and try again." };
  }
  if (limited(`lead:${clientIp()}`, 400, 60 * 60 * 1000)) {
    return { ok: false as const, error: "This phone has sent a lot of notes. Try again in a little while." };
  }
  const name = cleanName(input.name);
  const schoolName = cleanName(input.schoolName);
  const phone = cleanPhone(input.phone);
  const email = input.email.trim().toLowerCase();
  const notes = input.notes.trim().slice(0, 1000);
  if (name.length < 2) return { ok: false as const, error: "Add the full name." };
  if (schoolName.length < 2) return { ok: false as const, error: "Add the institution name." };
  if (!phone) return { ok: false as const, error: "Enter a 10-digit Indian mobile number." };
  if (email && !isEmail(email)) return { ok: false as const, error: "That email does not look right." };
  if (!isIsoDate(input.callbackDate) || input.callbackDate < todayIso()) {
    return { ok: false as const, error: "Choose today or a later callback date." };
  }
  if (!isSlot(input.callbackSlot)) return { ok: false as const, error: "Choose a callback slot." };
  if (!isObjective(input.objective)) return { ok: false as const, error: "Choose an objective." };

  const sql = await getSql();
  const existing = await sql<{ id: string; edit_token: string }>`
    select id, edit_token from leads where client_key = ${input.clientKey} limit 1
  `;
  const bullets = bulletsFromNotes(notes);
  const objective: Objective = input.objective;
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
    return { ok: true as const, name };
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
  return { ok: true as const, name };
}

async function pinState(sql: Sql) {
  const rows = await sql<{ pin_hash: string | null }>`
    select pin_hash from booth_settings where id = 1
  `;
  return rows[0]?.pin_hash ?? null;
}

export async function adminGateState() {
  const session = await adminSession();
  const sql = await getSql();
  const hash = await pinState(sql);
  return {
    signedIn: session.data.admin === true,
    usingDefaultCode: !hash,
  };
}

export async function adminLoginState(input: { code: string }) {
  const code = input.code.trim();
  const ip = clientIp();
  if (limited(`login:${ip}`, 8, 10 * 60 * 1000)) {
    return { ok: false as const, error: "Too many attempts. Wait a few minutes." };
  }
  const sql = await getSql();
  const hash = await pinState(sql);
  const valid = hash ? await verifyPin(code, hash) : await safeEqual(code, DEFAULT_BOOTH_CODE);
  if (!valid) return { ok: false as const, error: "That access code is not right." };
  const session = await adminSession();
  await session.update({ admin: true });
  return { ok: true as const };
}

export async function adminLogoutState() {
  const session = await adminSession();
  await session.clear();
  return { ok: true as const };
}

export async function listLeadState() {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Sign in to the booth desk." };
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select ${LEAD_COLUMNS} from leads order by created_at desc limit 400`,
  );
  return { ok: true as const, leads: rows.map(mapLead) };
}

export async function deleteLeadState(input: { ids: string[] }) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Sign in to the booth desk." };
  const ids = [...new Set(input.ids.map((id) => id.trim()).filter((id) => /^[a-zA-Z0-9-]{8,80}$/.test(id)))].slice(0, 200);
  if (!ids.length) return { ok: false as const, error: "Choose at least one enquiry." };
  const sql = await getSql();
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
  const rows = await sql.query<{ id: string }>(
    `delete from leads where id in (${placeholders}) returning id`,
    ids,
  );
  return { ok: true as const, deleted: rows.length };
}

export async function changeBoothCode(input: { code: string }) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Sign in to the booth desk." };
  const code = input.code.trim();
  if (code.length < 6 || code.length > 64) {
    return { ok: false as const, error: "Use 6 to 64 characters." };
  }
  const sql = await getSql();
  const pin = await hashPin(code);
  await sql`
    insert into booth_settings (id, pin_hash, updated_at)
    values (1, ${pin}, now())
    on conflict (id) do update set pin_hash = ${pin}, updated_at = now()
  `;
  return { ok: true as const };
}

export async function loadSampleQueue() {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Sign in to the booth desk." };
  const sql = await getSql();
  const tomorrow = todayIso(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const samples: Array<{
    key: string;
    mode: LeadMode;
    status: LeadStatus;
    name: string | null;
    phone: string | null;
    email: string | null;
    school: string | null;
    transcript: string | null;
    bullets: string[];
    date: string | null;
    slot: string | null;
    objective: string | null;
  }> = [
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
      objective: "Demo",
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
      objective: "Know More",
    },
    {
      key: "sample-farida",
      mode: "voice",
      status: "draft",
      name: null,
      phone: null,
      email: null,
      school: null,
      transcript:
        "This is Farida from Crescent School. My number is nine eight one one one two three three four four. We need help with fee collection.",
      bullets: [],
      date: null,
      slot: null,
      objective: null,
    },
  ];

  let inserted = 0;
  for (const sample of samples) {
    const rows = await sql<{ id: string }>`
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
  return { ok: true as const, inserted };
}
