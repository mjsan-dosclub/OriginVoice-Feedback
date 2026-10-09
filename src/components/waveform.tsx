import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const BARS = 27;

export function Waveform({
  active,
  disabled,
  onToggle,
}: {
  active: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative flex h-44 w-full items-center justify-center">
      <div
        className={cn(
          "absolute inset-x-4 flex h-28 items-center justify-center gap-1",
          active ? "ios-live" : "ios-idle",
        )}
        aria-hidden="true"
      >
        {Array.from({ length: BARS }, (_, index) => (
          <span
            key={index}
            className="ios-bar"
            style={{
              ["--i" as string]: String(index),
              ["--n" as string]: String(index % 7),
            }}
          />
        ))}
      </div>
      {active ? <span className="ios-pulse" aria-hidden="true" /> : null}
      <button
        type="button"
        className="mic-disc press relative z-10 flex size-24 items-center justify-center rounded-full text-fg outline-none focus-visible:ring-2 focus-visible:ring-fg/30 disabled:opacity-40"
        data-live={active ? "true" : "false"}
        aria-pressed={active}
        aria-label={active ? "Stop recording" : "Start recording"}
        disabled={disabled}
        onClick={onToggle}
      >
        {active ? (
          <Square className="size-7 fill-current" strokeWidth={0} />
        ) : (
          <Mic className="size-8" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}
