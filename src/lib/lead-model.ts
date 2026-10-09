export const OBJECTIVES = ["Demo", "Know More", "Catch-up Call"] as const;
export type Objective = (typeof OBJECTIVES)[number];

export const SLOTS = [
  { value: "Morning (9:00 AM – 11:00 AM)", title: "Morning", detail: "9:00 AM – 11:00 AM" },
  { value: "Afternoon (1:00 PM – 3:00 PM)", title: "Afternoon", detail: "1:00 PM – 3:00 PM" },
  { value: "Evening (3:00 PM – 7:00 PM)", title: "Evening", detail: "3:00 PM – 7:00 PM" },
] as const;

export type LeadMode = "voice" | "manual";
export type LeadStatus = "draft" | "submitted" | "confirmed";

export type Lead = {
  id: string;
  createdAt: string;
  mode: LeadMode;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string;
  schoolName: string;
  rawTranscript: string;
  bullets: string[];
  callbackDate: string;
  callbackSlot: string;
  objective: string;
  emailSent: boolean;
};

export type ParsedLead = {
  name: string;
  phone: string;
  schoolName: string;
  bullets: string[];
  objective: Objective;
};

const WORD_DIGIT: Record<string, string> = {
  zero: "0",
  oh: "0",
  o: "0",
  nought: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

const REPEAT: Record<string, number> = {
  double: 2,
  triple: 3,
  quadruple: 4,
};

export function cleanPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : "";
}

export function formatPhone(digits: string): string {
  const phone = cleanPhone(digits) || digits.replace(/\D/g, "");
  if (phone.length !== 10) return digits.trim();
  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export function extractIndianMobile(transcript: string): string {
  const tokens = transcript
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let stream = "";
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] ?? "";
    const repeat = REPEAT[token];
    if (repeat) {
      const next = tokens[i + 1];
      const digit = next ? WORD_DIGIT[next] : undefined;
      if (digit) {
        stream += digit.repeat(repeat);
        i += 1;
        continue;
      }
      if (next && /^\d$/.test(next)) {
        stream += next.repeat(repeat);
        i += 1;
        continue;
      }
      stream += " ";
      continue;
    }
    if (WORD_DIGIT[token]) {
      stream += WORD_DIGIT[token];
      continue;
    }
    if (/^\d+$/.test(token)) {
      stream += token;
      continue;
    }
    stream += " ";
  }

  const candidates: string[] = [];
  for (const run of stream.split(/\s+/).filter(Boolean)) {
    let digits = run;
    if (digits.startsWith("91") && digits.length >= 12) digits = digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
    if (/^[6-9]\d{9}$/.test(digits)) candidates.push(digits);
    if (digits.length > 10) {
      for (let i = 0; i <= digits.length - 10; i += 1) {
        const slice = digits.slice(i, i + 10);
        if (/^[6-9]\d{9}$/.test(slice)) candidates.push(slice);
      }
    }
  }
  return candidates.at(-1) ?? "";
}

export function cleanName(input: string): string {
  return input
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function normalizeObjective(value: string): Objective | "" {
  const text = value.trim().toLowerCase();
  if (!text) return "";
  if (text.includes("demo")) return "Demo";
  if (text.includes("catch")) return "Catch-up Call";
  if (text.includes("know") || text.includes("info") || text.includes("more")) return "Know More";
  return "";
}

export function isObjective(value: string): value is Objective {
  return (OBJECTIVES as readonly string[]).includes(value);
}

export function isSlot(value: string): boolean {
  return SLOTS.some((slot) => slot.value === value);
}

export function parseBullets(value: unknown): string[] {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function bulletsFromNotes(notes: string): string[] {
  return notes
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function normalizeParsed(raw: unknown, transcript: string): ParsedLead {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  let name = typeof obj.name === "string" ? cleanName(obj.name) : "";
  const phone = (typeof obj.phone === "string" ? cleanPhone(obj.phone) : "") || extractIndianMobile(transcript);
  if (name && cleanPhone(name) === phone && phone) name = "";
  const schoolName =
    typeof obj.school_name === "string"
      ? cleanName(obj.school_name)
      : typeof obj.schoolName === "string"
        ? cleanName(obj.schoolName)
        : "";
  const bullets = parseBullets(obj.requirements_summary ?? obj.bullets);
  const objective =
    normalizeObjective(typeof obj.detected_objective === "string" ? obj.detected_objective : "") ||
    "Know More";
  return { name, phone, schoolName, bullets, objective };
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function todayIso(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts;
}

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    "Created",
    "Mode",
    "Status",
    "Name",
    "Phone",
    "Email",
    "Institution",
    "Objective",
    "Callback date",
    "Callback slot",
    "Requirements",
    "Transcript",
    "Email sent",
  ];
  const lines = [headers.map(csvCell).join(",")];
  for (const lead of leads) {
    lines.push(
      [
        lead.createdAt,
        lead.mode,
        lead.status,
        lead.name,
        lead.phone,
        lead.email,
        lead.schoolName,
        lead.objective,
        lead.callbackDate,
        lead.callbackSlot,
        lead.bullets.join(" | "),
        lead.rawTranscript,
        lead.emailSent ? "yes" : "no",
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;")
    .replaceAll("'", "&" + "#39;");
}

export function thankYouEmailHtml(input: {
  name: string;
  phone: string;
  schoolName: string;
  objective: string;
  bullets: string[];
  callbackDate: string;
  callbackSlot: string;
}): string {
  const name = escapeHtml(input.name || "there");
  const bullets = input.bullets.length
    ? `<ul>${input.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "<p>We have your note from the booth.</p>";
  const when = [input.callbackDate, input.callbackSlot].filter(Boolean).join(" · ");
  return `<!doctype html>
<html>
  <body style="margin:0;background:#e7eef5;color:#1a2330;font-family:Georgia,serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" style="max-width:480px;">
            <tr>
              <td style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#8493a3;">VidyaConnect</td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-size:28px;line-height:1.2;">Thank you, ${name}.</td>
            </tr>
            <tr>
              <td style="padding-top:12px;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#5c6b7c;">
                The booth team has your details${input.phone ? ` and will reach you at ${escapeHtml(formatPhone(input.phone))}` : ""}.
                ${input.schoolName ? `Institution: ${escapeHtml(input.schoolName)}.` : ""}
                ${input.objective ? ` You asked to ${escapeHtml(input.objective)}.` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a2330;">
                ${bullets}
                ${when ? `<p>Preferred callback: ${escapeHtml(when)}</p>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
