import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { VisitorFrame } from "@/components/visitor-frame";

export function ThanksView({ name, mail }: { name: string; mail: "sent" | "skipped" | "none" }) {
  const who = name.trim();
  return (
    <VisitorFrame>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-10 pb-24">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface ring-1 ring-border">
          <Check className="size-5" strokeWidth={1.75} />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {who ? `Thank you, ${who}.` : "Thank you."}
        </h1>
        <p className="mt-3 text-base text-muted">The booth team has your details and will follow up.</p>
        {mail === "sent" ? (
          <p className="mt-3 text-sm text-subtle">A thank-you note is on its way to your email.</p>
        ) : null}
        {mail === "skipped" ? (
          <p className="mt-3 text-sm text-subtle">
            Saved. Email delivery isn't connected on this deployment, so no message was sent.
          </p>
        ) : null}
        <Link
          to="/"
          className="press mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-base font-medium text-accent-fg"
        >
          Capture another
        </Link>
      </main>
    </VisitorFrame>
  );
}
