import { createFileRoute } from "@tanstack/react-router";
import { CapturePage } from "@/components/capture-page";

export const Route = createFileRoute("/form")({
  component: FormPage,
});

function FormPage() {
  return <CapturePage initialMode="manual" />;
}
