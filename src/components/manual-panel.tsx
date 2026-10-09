import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChoiceGroup } from "@/components/choice-group";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitManual } from "@/lib/leads.functions";
import { OBJECTIVES, SLOTS, todayIso, type Objective } from "@/lib/lead-model";

export function ManualPanel() {
  const navigate = useNavigate();
  const clientKey = useRef<string | null>(null);
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackSlot, setCallbackSlot] = useState("");
  const [objective, setObjective] = useState<Objective | "">("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCallbackDate(todayIso());
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!clientKey.current) clientKey.current = crypto.randomUUID();
    setBusy(true);
    setError("");
    try {
      const result = await submitManual({
        data: {
          clientKey: clientKey.current,
          name,
          schoolName,
          phone,
          email,
          callbackDate,
          callbackSlot,
          objective,
          notes,
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await navigate({
        to: "/thanks",
        search: { name: result.name, mail: "none" },
      });
    } catch {
      setError("Couldn't save this form. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-5 pb-24" onSubmit={(event) => void onSubmit(event)}>
      <Field label="Full name">
        <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
      </Field>
      <Field label="Institution">
        <Input
          value={schoolName}
          onChange={(event) => setSchoolName(event.target.value)}
          autoComplete="organization"
          required
        />
      </Field>
      <Field label="Mobile number" hint="10-digit Indian mobile.">
        <Input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          inputMode="numeric"
          autoComplete="tel"
          placeholder="98XXXXXXXX"
          required
        />
      </Field>
      <Field label="Email" hint="Optional. Used for the thank-you note.">
        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          inputMode="email"
        />
      </Field>
      <Field label="Preferred callback date">
        <Input
          value={callbackDate}
          onChange={(event) => setCallbackDate(event.target.value)}
          type="date"
          min={todayIso()}
          required
        />
      </Field>
      <ChoiceGroup
        legend="Time slot"
        name="callback-slot"
        value={callbackSlot}
        onChange={setCallbackSlot}
        options={SLOTS.map((slot) => ({ value: slot.value, title: slot.title, detail: slot.detail }))}
      />
      <ChoiceGroup
        legend="Objective"
        name="objective"
        value={objective}
        onChange={setObjective}
        options={OBJECTIVES.map((item) => ({ value: item, title: item }))}
      />
      <Field label="Requirement notes">
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What should the booth team follow up on?"
        />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button size="lg" type="submit" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {busy ? "Saving" : "Submit"}
      </Button>
    </form>
  );
}
