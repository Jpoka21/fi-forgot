import { Redirect, useRoute } from "wouter";
import { RecipientProfilePage } from "@/app/routes/lazyPages";
import { ROUTE_PATHS } from "@/app/routes/routePaths";

export function RecipientProfileGate() {
  const [, params] = useRoute(ROUTE_PATHS.recipientProfile);
  const isEdit =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("edit") === "1";

  if (!isEdit && params?.id) {
    return <Redirect to={`/relationship/${params.id}`} />;
  }

  return <RecipientProfilePage />;
}
