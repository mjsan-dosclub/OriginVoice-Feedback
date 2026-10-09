import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Waveform } from "@/components/waveform";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { processVoice } from "@/lib/leads.functions";

export function VoicePanel() {
  const navigate = useNavigate();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wantRef = useRef(false);
  const clientKey = useRef<string | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      wantRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* already stopped */
      }
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
      if (finalAdd.trim()) {
        setTranscript((prev) => {
          const base = prev.trim();
          const next = finalAdd.trim();
          return base ? `${base} ${next}` : next;
        });
      }
      setInterim(nextInterim.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === "language-not-supported" && recognition.lang !== "en-IN") {
        recognition.lang = "en-IN";
        window.setTimeout(() => {
          if (!wantRef.current) return;
          try {
            recognition.start();
          } catch {
            /* already started */
          }
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
        } catch {
          /* start already in progress */
        }
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
    } catch {
      /* already started */
    }
  }

  function stopListening() {
    wantRef.current = false;
    setListening(false);
    setInterim("");
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
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
      const result = await processVoice({
        data: { transcript: text, clientKey: clientKey.current },
      });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      await navigate({
        to: "/confirmation",
        search: { id: result.id, token: result.token },
      });
    } catch {
      setFormError("Couldn't reach the desk. Your words are still here — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <section className="glass rounded-2xl p-4">
        <p className="text-sm font-medium">Speak in Tamil, English, or both</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Your name and institution</li>
          <li>10-digit mobile number</li>
          <li>Your requirement or pain point</li>
        </ol>
      </section>

      <div className="flex flex-col items-center">
        <Waveform
          active={listening}
          onToggle={() => (listening ? stopListening() : startListening())}
        />
        <p className="text-sm text-muted" aria-live="polite">
          {listening ? "Listening in Tamil and English. Tap stop when you are done." : "Tap the mic. The bars stay still until you record."}
        </p>
      </div>

      {speechError ? <p className="text-sm text-danger">{speechError}</p> : null}

      <label className="glass flex flex-col gap-2 rounded-2xl p-3">
        <span className="px-1 text-sm font-medium">Live transcript</span>
        <Textarea
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          placeholder="Your words appear here. Edit a name, institution, or number before processing."
          aria-label="Live transcript"
          className="border-0 bg-elevated/80 shadow-none"
        />
        {interim ? (
          <p className="px-1 text-sm text-subtle" aria-live="polite">
            Hearing: {interim}
          </p>
        ) : null}
      </label>

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}

      <Button size="lg" onClick={() => void onProcess()} disabled={busy || transcript.trim().length < 4}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {busy ? "Reading the conversation" : "Process with AI"}
      </Button>
      <p className="text-sm text-subtle">
        Silence does not send anything. The raw note is saved as a draft before it is read.
      </p>
    </div>
  );
}
