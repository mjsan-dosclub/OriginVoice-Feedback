import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Waveform } from "@/components/waveform";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { processVoice, transcribeBooth } from "@/lib/leads.functions";
import { recoverDoubledSpeech } from "@/lib/lead-model";
import { beginIosRecording, type IosRecording } from "@/lib/ios-capture";

const MAX_RECORD_MS = 75_000;

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function iosMicHelp() {
  const chrome = /CriOS/.test(navigator.userAgent);
  return chrome
    ? "Chrome blocked the microphone. On the iPhone open Settings, then Chrome, then Microphone, and turn it on. Come back and tap the mic again."
    : "Safari blocked the microphone. On the iPhone open Settings, then Safari, then Microphone, and choose Allow. Come back and tap the mic again.";
}

function joinSpeech(prefix: string, finals: string) {
  const base = prefix.trim();
  const next = finals.trim();
  if (!next) return base;
  if (!base) return next;
  if (next.startsWith(base)) return next;
  if (base.endsWith(next)) return base;
  return `${base} ${next}`;
}

function sessionText(results: SpeechRecognitionResultList) {
  const finals: string[] = [];
  let interim = "";
  for (let i = 0; i < results.length; i += 1) {
    const piece = (results[i]?.[0]?.transcript ?? "").replace(/\s+/g, " ").trim();
    if (!piece) continue;
    if (results[i]?.isFinal) {
      const prev = finals[finals.length - 1];
      if (prev === piece || (prev && piece.startsWith(prev))) finals[finals.length - 1] = piece;
      else if (!prev || !prev.startsWith(piece)) finals.push(piece);
    } else {
      interim = piece;
    }
  }
  return { finals: finals.join(" "), interim };
}

export function VoicePanel() {
  const navigate = useNavigate();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wantRef = useRef(false);
  const heardRef = useRef(false);
  const prefixRef = useRef("");
  const transcriptRef = useRef("");
  const interimRef = useRef("");
  const clientKey = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const iosRef = useRef<IosRecording | null>(null);
  const limitRef = useRef<number | null>(null);
  const [listening, setListening] = useState(false);
  const [recorderOnly, setRecorderOnly] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  function remember(next: string) {
    const cleaned = recoverDoubledSpeech(next);
    transcriptRef.current = cleaned;
    setTranscript(cleaned);
  }

  useEffect(() => {
    return () => {
      wantRef.current = false;
      if (limitRef.current) window.clearTimeout(limitRef.current);
      try {
        recognitionRef.current?.abort();
      } catch {
        /* already stopped */
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      iosRef.current?.cancel();
    };
  }, []);

  function ensureRecognition() {
    if (recognitionRef.current) return recognitionRef.current;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return null;
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      heardRef.current = true;
      const { finals, interim: nextInterim } = sessionText(event.results);
      remember(joinSpeech(prefixRef.current, finals));
      interimRef.current = nextInterim;
      setInterim(nextInterim);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        if (recorderRef.current && recorderRef.current.state === "recording") {
          setRecorderOnly(true);
          return;
        }
        wantRef.current = false;
        setListening(false);
        setSpeechError(isIos() ? iosMicHelp() : "Microphone is blocked. Type the note, or use Manual form.");
      }
    };
    recognition.onend = () => {
      prefixRef.current = transcriptRef.current.trim();
      if (!wantRef.current) {
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
      }, 250);
    };
    recognitionRef.current = recognition;
    return recognition;
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  function stopRecorder() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return Promise.resolve<Blob | null>(null);
    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/mp4";
        const blob = new Blob(chunksRef.current, { type });
        resolve(blob.size ? blob : null);
      };
      try {
        recorder.stop();
      } catch {
        resolve(null);
      }
    });
  }

  function startListening() {
    setListening(true);
    setRecorderOnly(false);
    setSpeechError("");
    setInterim("");
    wantRef.current = true;
    heardRef.current = false;
    prefixRef.current = transcriptRef.current.trim();
    chunksRef.current = [];

    if (isIos()) {
      setRecorderOnly(true);
      try {
        iosRef.current = beginIosRecording();
        void iosRef.current.opened.catch((error: unknown) => {
          if (!wantRef.current) return;
          wantRef.current = false;
          setListening(false);
          iosRef.current?.cancel();
          iosRef.current = null;
          const name = error instanceof DOMException ? error.name : "";
          setSpeechError(
            name === "NotAllowedError" || name === "SecurityError"
              ? iosMicHelp()
              : "Couldn't use the iPhone microphone. Use Manual form, or try again.",
          );
        });
      } catch {
        wantRef.current = false;
        setListening(false);
        setSpeechError(iosMicHelp());
        return;
      }
      if (limitRef.current) window.clearTimeout(limitRef.current);
      limitRef.current = window.setTimeout(() => {
        if (wantRef.current) void stopListening();
      }, MAX_RECORD_MS);
      return;
    }

    const recognition = ensureRecognition();
    if (recognition) {
      recognition.lang = "en-IN";
      try {
        recognition.start();
      } catch {
        /* already started */
      }
    } else {
      setRecorderOnly(true);
    }

    if (limitRef.current) window.clearTimeout(limitRef.current);
    limitRef.current = window.setTimeout(() => {
      if (wantRef.current) void stopListening();
    }, MAX_RECORD_MS);

    if (!navigator.mediaDevices?.getUserMedia) {
      if (!recognition) {
        wantRef.current = false;
        setListening(false);
        setSpeechError("This phone has no voice capture. Type the note, or use Manual form.");
      }
      return;
    }

    void navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (!wantRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
        const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunksRef.current.push(event.data);
        };
        recorder.start();
        recorderRef.current = recorder;
      })
      .catch(() => {
        if (!recognition) {
          wantRef.current = false;
          setListening(false);
          setSpeechError("Microphone is blocked. Type the note, or use Manual form.");
        }
      });
  }

  async function stopListening() {
    wantRef.current = false;
    setListening(false);
    setInterim("");
    if (limitRef.current) window.clearTimeout(limitRef.current);
    const pending = interimRef.current.trim();
    if (pending) {
      remember(joinSpeech(transcriptRef.current, pending));
      interimRef.current = "";
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    const ios = iosRef.current;
    iosRef.current = null;
    if (ios) {
      setBusy(true);
      setSpeechError("");
      try {
        const recorded = await ios.finish();
        if (!recorded || recorded.seconds < 0.4) {
          setSpeechError("That was too short. Tap the mic, speak, then tap stop.");
          return;
        }
        if (recorded.peak < 0.01) {
          setSpeechError("The mic was on, but no voice came through. Speak closer and try again.");
          return;
        }
        const audioBase64 = await blobToBase64(recorded.blob);
        const result = await transcribeBooth({ data: { audioBase64, mime: "audio/wav" } });
        if (!result.ok) {
          setSpeechError(result.error);
          return;
        }
        const merged = joinSpeech(prefixRef.current, result.text);
        remember(merged);
        prefixRef.current = merged;
      } catch (error) {
        const name = error instanceof DOMException ? error.name : "";
        setSpeechError(name === "NotAllowedError" || name === "SecurityError" ? iosMicHelp() : "Couldn't use the iPhone microphone. Use Manual form, or try again.");
      } finally {
        setBusy(false);
      }
      return;
    }
    const blob = await stopRecorder();
    stopStream();
    prefixRef.current = transcriptRef.current.trim();
    if (heardRef.current && transcriptRef.current.trim().length >= 4) return;
    if (!blob) {
      if (!transcriptRef.current.trim()) {
        setSpeechError("No words came through. Type the note, or use Manual form.");
      }
      return;
    }
    setBusy(true);
    setSpeechError("");
    try {
      const audioBase64 = await blobToBase64(blob);
      const result = await transcribeBooth({ data: { audioBase64, mime: blob.type || "audio/mp4" } });
      if (!result.ok) {
        setSpeechError(result.error);
        return;
      }
      const merged = joinSpeech(prefixRef.current, result.text);
      remember(merged);
      prefixRef.current = merged;
    } catch {
      setSpeechError("Couldn't read that recording. Type the note, or use Manual form.");
    } finally {
      setBusy(false);
    }
  }

  async function onProcess() {
    if (listening) await stopListening();
    const text = recoverDoubledSpeech(transcriptRef.current.trim());
    remember(text);
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

  const status = listening
    ? recorderOnly
      ? "Recording. Tap stop and the words will appear."
      : "Listening. Tap stop when you are done."
    : "Tap the mic. Speak in English or Tamil.";

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
        <Waveform active={listening} disabled={busy} onToggle={() => (listening ? void stopListening() : startListening())} />
        <p className="text-sm text-muted" aria-live="polite">
          {busy && !listening ? "Reading what you said…" : status}
        </p>
      </div>

      {speechError ? <p className="text-sm text-danger">{speechError}</p> : null}

      <label className="glass flex flex-col gap-2 rounded-2xl p-3">
        <span className="px-1 text-sm font-medium">Live transcript</span>
        <Textarea
          value={transcript}
          onChange={(event) => {
            remember(event.target.value);
            prefixRef.current = event.target.value;
          }}
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
        Silence does not send anything. On iPhone, tap stop and wait for the words.
      </p>
    </div>
  );
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      resolve(value.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
