import { createFileRoute } from "@tanstack/react-router";
import { ConfirmationView } from "@/components/confirmation-view";

export const Route = createFileRoute("/confirmation")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : "",
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id, token } = Route.useSearch();
  return <ConfirmationView id={id} token={token} />;
}
