import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ChoiceGroup } from "@/components/choice-group";
import { Field } from "@/components/field";
import { VisitorFrame } from "@/components/visitor-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { confirmVoice, getLead } from "@/lib/leads.functions";
import { OBJECTIVES, formatPhone, isObjective, type Lead, type Objective } from "@/lib/lead-model";

export function ConfirmationView({ id, token }: { id: string; token: string }) {
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [objective, setObjective] = useState<Objective | "">("Know More");
  const [bulletsText, setBulletsText] = useState("");

  useEffect(() => {
    if (!id || !token) {
      setError("This confirmation link is incomplete.");
      setLoading(false);
      return;
    }
    let cancel = false;
    getLead({ data: { id, token } })
      .then((result) => {
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
      })
      .catch(() => {
        if (!cancel) setError("Couldn't open this confirmation.");
      })
      .finally(() => {
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
      const result = await confirmVoice({
        data: { id, token, name, phone, email, schoolName, objective, bulletsText },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await navigate({
        to: "/thanks",
        search: { name: result.name, mail: result.emailState },
      });
    } catch {
      setError("Couldn't confirm this note. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <VisitorFrame>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-6 pb-24">
        <p className="text-xs tracking-widest text-subtle uppercase">Confirm</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {name.trim() ? `Thank you, ${name.trim()}` : "Check this note"}
        </h1>
        {loading ? <p className="mt-6 text-sm text-muted">Opening the saved note…</p> : null}
        {!loading && error && !lead ? <p className="mt-6 text-sm text-danger">{error}</p> : null}
        {lead && (lead.status === "confirmed" || lead.status === "submitted") ? (
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-base text-muted">
              This note is already with the booth team
              {lead.phone ? ` for ${formatPhone(lead.phone)}` : ""}.
            </p>
            <Link to="/thanks" search={{ name: lead.name, mail: lead.emailSent ? "sent" : "none" }} className="text-sm text-fg underline-offset-4 hover:underline">
              View the thank-you
            </Link>
          </div>
        ) : null}
        {lead && lead.status === "draft" ? (
          <div className="mt-6 flex flex-col gap-5">
            <p className="text-base text-muted">
              {phone
                ? `Please confirm the mobile number ${formatPhone(phone)}.`
                : "Please confirm the mobile number."}
            </p>
            {!lead.name ? (
              <p className="text-sm text-subtle">
                The reading didn't fill every field. Correct anything that looks off, then send.
              </p>
            ) : null}
            <Field label="Name">
              <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </Field>
            <Field label="Mobile number">
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="numeric"
                autoComplete="tel"
              />
            </Field>
            <Field label="Institution">
              <Input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} autoComplete="organization" />
            </Field>
            <Field label="Email" hint="Optional.">
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
              />
            </Field>
            <ChoiceGroup
              legend="Objective"
              name="confirm-objective"
              value={objective}
              onChange={setObjective}
              options={OBJECTIVES.map((item) => ({ value: item, title: item }))}
            />
            <Field label="Requirements" hint="One point per line.">
              <Textarea value={bulletsText} onChange={(event) => setBulletsText(event.target.value)} />
            </Field>
            {lead.rawTranscript ? (
              <details className="glass rounded-2xl px-3 py-3">
                <summary className="cursor-pointer text-sm font-medium">What we heard</summary>
                <p className="mt-2 text-sm text-muted">{lead.rawTranscript}</p>
              </details>
            ) : null}
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button size="lg" onClick={() => void onConfirm()} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {busy ? "Sending" : "Confirm & send"}
            </Button>
          </div>
        ) : null}
      </main>
    </VisitorFrame>
  );
}
