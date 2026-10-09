import { formatDistanceToNow } from "date-fns";
import { Download, Loader2, Radio, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { OriginLogo } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminGate,
  adminLogin,
  adminLogout,
  listLeads,
  deleteLeads,
  seedSampleLeads,
  setBoothCode,
} from "@/lib/leads.functions";
import { OBJECTIVES, SLOTS, formatPhone, leadsToCsv, type Lead } from "@/lib/lead-model";
import { cn } from "@/lib/utils";

const STATUSES = ["draft", "submitted", "confirmed"] as const;

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

function downloadCsv(leads: Lead[]) {
  const blob = new Blob([leadsToCsv(leads)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "originbi-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminDesk() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [code, setCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadError, setLoadError] = useState("");
  const [objective, setObjective] = useState("");
  const [slot, setSlot] = useState("");
  const [status, setStatus] = useState("");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [announce, setAnnounce] = useState("");
  const [nextCode, setNextCode] = useState("");
  const [codeMessage, setCodeMessage] = useState("");
  const [sampleMessage, setSampleMessage] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const known = useRef<Set<string> | null>(null);

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

  useEffect(() => {
    let cancel = false;
    adminGate()
      .then((gate) => {
        if (cancel) return;
        setSignedIn(gate.signedIn);
      })
      .catch(() => {
        if (!cancel) setLoadError("Couldn't open the booth desk.");
      })
      .finally(() => {
        if (!cancel) setReady(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    let cancel = false;
    const pull = () => {
      if (document.hidden) return;
      listLeads()
        .then((result) => {
          if (cancel) return;
          if (!result.ok) {
            setSignedIn(false);
            return;
          }
          setLeads(result.leads);
          setLoaded(true);
        })
        .catch(() => {
          if (!cancel) setLoadError("The live feed paused. It will retry.");
        });
    };
    pull();
    const timer = window.setInterval(pull, 3000);
    return () => {
      cancel = true;
      window.clearInterval(timer);
    };
  }, [signedIn]);

  useEffect(() => {
    const ids = new Set(leads.map((lead) => lead.id));
    if (known.current) {
      const born = [...ids].filter((id) => !known.current?.has(id));
      if (born.length) {
        setFresh(new Set(born));
        setAnnounce(`${born.length} new ${born.length === 1 ? "lead" : "leads"}`);
        window.setTimeout(() => setFresh(new Set()), 4000);
      }
    }
    known.current = ids;
  }, [leads]);

  const filtered = useMemo(
    () =>
      leads.filter((lead) => {
        if (objective && lead.objective !== objective) return false;
        if (slot && lead.callbackSlot !== slot) return false;
        if (status && lead.status !== status) return false;
        return true;
      }),
    [leads, objective, slot, status],
  );

  const selectedIds = leads.map((lead) => lead.id).filter((id) => selected.has(id));
  const shownIds = filtered.map((lead) => lead.id);
  const allShown = shownIds.length > 0 && shownIds.every((id) => selected.has(id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleShown() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allShown) shownIds.forEach((id) => next.delete(id));
      else shownIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function removeSelected() {
    if (!selectedIds.length || deleting) return;
    const count = selectedIds.length;
    const label = count === 1 ? "this enquiry" : `${count} enquiries`;
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const result = await deleteLeads({ data: { ids: selectedIds } });
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      const gone = new Set(selectedIds);
      setLeads((prev) => prev.filter((lead) => !gone.has(lead.id)));
      setSelected(new Set());
      setAnnounce(`${result.deleted} ${result.deleted === 1 ? "enquiry" : "enquiries"} deleted`);
    } catch {
      setDeleteError("Couldn't delete those enquiries. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function onLogin(event: FormEvent) {
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

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-sm text-muted">Opening the desk…</main>
    );
  }

  if (!signedIn) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
        <OriginLogo className="h-10 w-auto object-contain object-left" />
        <p className="mt-5 text-xs tracking-widest text-subtle uppercase">Booth desk</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">OriginBI</h1>
        <p className="mt-2 text-sm text-muted">Live queue for the people running the booth.</p>
        <form className="mt-6 flex flex-col gap-3" onSubmit={(event) => void onLogin(event)}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Access code
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {loginError ? <p className="text-sm text-danger">{loginError}</p> : null}
          <Button size="lg" type="submit" disabled={loginBusy}>
            {loginBusy ? <Loader2 className="size-4 animate-spin" /> : null}
            Enter desk
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-6 md:px-8">
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs tracking-widest text-subtle uppercase">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="live-ping absolute inline-flex size-full rounded-full bg-ok" />
              <span className="relative size-2 rounded-full bg-ok" />
            </span>
            Live feed
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Booth desk</h1>
          <p className="mt-1 text-sm text-muted tabular-nums">{leads.length} on the desk</p>
          <Link to="/" className="mt-2 inline-flex text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
            Open capture
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => downloadCsv(filtered)} disabled={filtered.length === 0}>
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              void adminLogout().then(() => {
                setSignedIn(false);
                setLeads([]);
                setLoaded(false);
                known.current = null;
              });
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Filter label="Objective" value={objective} onChange={setObjective} options={["", ...OBJECTIVES]} />
        <Filter label="Callback slot" value={slot} onChange={setSlot} options={["", ...SLOTS.map((item) => item.value)]} />
        <Filter label="Status" value={status} onChange={setStatus} options={["", ...STATUSES]} />
      </div>

      {loadError ? <p className="mt-4 text-sm text-danger">{loadError}</p> : null}

      {loaded && leads.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="size-4 accent-fg"
              checked={allShown}
              onChange={toggleShown}
              disabled={filtered.length === 0}
            />
            Select all shown
          </label>
          <Button
            variant="outline"
            className="text-danger"
            disabled={selectedIds.length === 0 || deleting}
            onClick={() => void removeSelected()}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete selected{selectedIds.length ? ` (${selectedIds.length})` : ""}
          </Button>
        </div>
      ) : null}
      {deleteError ? <p className="mt-2 text-sm text-danger">{deleteError}</p> : null}

      {!loaded ? (
        <p className="mt-8 text-sm text-muted">Opening the queue…</p>
      ) : leads.length === 0 ? (
        <div className="mt-8 rounded-xl bg-surface p-6 ring-1 ring-border">
          <Radio className="size-5 text-muted" />
          <h2 className="mt-3 text-lg font-medium">Waiting for the first conversation</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Voice notes and forms show up here as visitors finish them. You can load a sample queue to see the
            feed before the floor opens.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              void seedSampleLeads().then(async (result) => {
                if (!result.ok) {
                  setSampleMessage(result.error);
                  return;
                }
                setSampleMessage(result.inserted ? "Sample queue added." : "Sample queue is already on the desk.");
                await refresh();
              });
            }}
          >
            Load sample queue
          </Button>
          {sampleMessage ? <p className="mt-3 text-sm text-subtle">{sampleMessage}</p> : null}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Nothing matches these filters.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {filtered.map((lead) => (
            <li
              key={lead.id}
              className={cn(
                "rounded-xl bg-surface p-4 ring-1",
                fresh.has(lead.id) ? "ring-fg" : "ring-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 accent-fg"
                    checked={selected.has(lead.id)}
                    aria-label={`Select ${lead.name || "unnamed enquiry"}`}
                    onChange={() => toggleOne(lead.id)}
                  />
                  <div>
                  <p className="text-xs tracking-widest text-subtle uppercase">
                    {lead.mode === "voice" ? "Voice" : "Form"}
                  </p>
                  <h2 className="mt-1 text-lg font-medium">{lead.name || "Unnamed voice note"}</h2>
                  <p className="text-sm text-muted">{lead.schoolName || "Institution not captured"}</p>
                  </div>
                </div>
                <p className="text-xs text-subtle tabular-nums">{when(lead.createdAt)}</p>
              </div>
              <p className="mt-3 text-sm tabular-nums tracking-wide">{lead.phone ? formatPhone(lead.phone) : "No mobile yet"}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {lead.objective ? <span className="rounded-full px-2 py-1 ring-1 ring-border">{lead.objective}</span> : null}
                <span className={cn("rounded-full px-2 py-1 ring-1 ring-border", lead.status === "confirmed" && "text-ok")}>
                  {lead.status}
                </span>
                {lead.callbackSlot ? (
                  <span className="rounded-full px-2 py-1 text-muted ring-1 ring-border">{lead.callbackSlot}</span>
                ) : null}
                {lead.email ? <span className="rounded-full px-2 py-1 text-muted ring-1 ring-border">{lead.email}</span> : null}
              </div>
              {lead.bullets.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {lead.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {lead.rawTranscript ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-subtle">Transcript</summary>
                  <p className="mt-2 text-sm text-muted">{lead.rawTranscript}</p>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10 max-w-sm border-t border-border pt-6">
        <h2 className="text-sm font-medium">Change access code</h2>
        <p className="mt-1 text-sm text-subtle">Replaces the current access code.</p>
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void setBoothCode({ data: { code: nextCode } }).then((result) => {
              if (!result.ok) {
                setCodeMessage(result.error);
                return;
              }
              setNextCode("");
              setCodeMessage("Access code updated.");
            });
          }}
        >
          <Input
            value={nextCode}
            onChange={(event) => setNextCode(event.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="New code"
            minLength={6}
          />
          <Button type="submit" variant="outline" disabled={nextCode.trim().length < 6}>
            Save code
          </Button>
          {codeMessage ? <p className="text-sm text-subtle">{codeMessage}</p> : null}
        </form>
      </section>
    </main>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md bg-surface px-3 text-sm text-fg ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
      >
        {options.map((option) => (
          <option key={option || "all"} value={option}>
            {option || "All"}
          </option>
        ))}
      </select>
    </label>
  );
}
