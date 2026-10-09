import { createFileRoute } from "@tanstack/react-router";
import { ThanksView } from "@/components/thanks-view";

export const Route = createFileRoute("/thanks")({
  validateSearch: (search: Record<string, unknown>) => {
    const mail: "sent" | "skipped" | "none" =
      search.mail === "sent" || search.mail === "skipped" ? search.mail : "none";
    return {
      name: typeof search.name === "string" ? search.name.slice(0, 120) : "",
      mail,
    };
  },
  component: ThanksPage,
});

function ThanksPage() {
  const { name, mail } = Route.useSearch();
  return <ThanksView name={name} mail={mail} />;
}
