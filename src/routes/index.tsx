import { createFileRoute } from "@tanstack/react-router";
import { CapturePage } from "@/components/capture-page";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <CapturePage initialMode="voice" />;
}
