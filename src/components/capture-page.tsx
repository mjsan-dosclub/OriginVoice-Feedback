import { Link } from "@tanstack/react-router";
import { ClipboardList, Mic } from "lucide-react";
import { useState } from "react";
import { ManualPanel } from "@/components/manual-panel";
import { OriginLogo } from "@/components/mark";
import { VisitorFrame } from "@/components/visitor-frame";
import { VoicePanel } from "@/components/voice-panel";
import { cn } from "@/lib/utils";

type Mode = "voice" | "manual";

export function CapturePage({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <VisitorFrame>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pt-5 pb-3">
          <div className="min-w-0">
            <OriginLogo className="h-10 w-auto max-w-full object-contain object-left" />
            <p className="mt-1 text-xs font-medium tracking-wide text-muted">VidyaConnect</p>
          </div>
          <Link to="/admin" className="shrink-0 text-sm font-medium text-fg">
            Desk
          </Link>
        </header>

        <div className="px-4">
          <p className="text-sm text-muted">A minute with the booth. Speak it, or write it.</p>
          <div className="glass mt-4 grid grid-cols-2 rounded-full p-1" role="group" aria-label="Capture mode">
            {(
              [
                { id: "voice" as const, label: "Voice mode", icon: Mic },
                { id: "manual" as const, label: "Manual form", icon: ClipboardList },
              ]
            ).map((option) => {
              const selected = mode === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMode(option.id)}
                  className={cn(
                    "press flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium",
                    selected ? "bg-accent text-accent-fg" : "text-muted",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex-1 px-4">
          {mode === "voice" ? <VoicePanel /> : <ManualPanel />}
        </div>
      </main>
    </VisitorFrame>
  );
}
