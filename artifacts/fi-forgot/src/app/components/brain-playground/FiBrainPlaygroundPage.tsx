import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { brainPlaygroundDefaults } from "@/app/brain-playground/brainPlaygroundDomain";
import { useBrainPlayground } from "@/app/brain-playground/hooks/useBrainPlayground";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { FiBrainPlaygroundStateMessage } from "./FiBrainPlaygroundStateMessage";
import { FiBrainPlaygroundToolbar } from "./FiBrainPlaygroundToolbar";
import { FiProductBrainDecisionPanel } from "./FiProductBrainDecisionPanel";

import "./brain-playground.css";

export function FiBrainPlaygroundPage() {
  const playground = useBrainPlayground();

  return (
    <div className="fi-brain-playground" tabIndex={-1}>
      <header className="fi-brain-playground__header">
        <h1 className="fi-brain-playground__title">{brainPlaygroundDefaults.title}</h1>
        <p className="fi-brain-playground__subtitle">{brainPlaygroundDefaults.subtitle}</p>
      </header>

      {playground.recipients.length === 0 ? (
        <FiBrainPlaygroundStateMessage>
          <p>{brainPlaygroundDefaults.noRecipientsMessage}</p>
          <FiButton asChild variant="secondary" size="sm">
            <Link href={ROUTE_PATHS.people}>{brainPlaygroundDefaults.peopleLinkLabel}</Link>
          </FiButton>
        </FiBrainPlaygroundStateMessage>
      ) : (
        <>
          <FiBrainPlaygroundToolbar
            recipients={playground.recipients}
            selectedRecipientId={playground.selectedRecipientId}
            onSelectRecipient={playground.selectRecipient}
            onRefresh={() => void playground.refresh()}
            status={playground.status}
            fetchedAt={playground.fetchedAt}
          />

          {playground.queryRecipientUnknown ? (
            <FiBrainPlaygroundStateMessage tone="error">
              Recipient id in URL is not in the local list. The fetch will still run if the
              recipient exists on the server.
            </FiBrainPlaygroundStateMessage>
          ) : null}

          {!playground.selectedRecipientId ? (
            <FiBrainPlaygroundStateMessage>
              {brainPlaygroundDefaults.noRecipientSelectedMessage}
            </FiBrainPlaygroundStateMessage>
          ) : null}

          {playground.selectedRecipientId && playground.status === "loading" ? (
            <FiBrainPlaygroundStateMessage>
              {brainPlaygroundDefaults.loadingMessage}
            </FiBrainPlaygroundStateMessage>
          ) : null}

          {playground.selectedRecipientId && playground.status === "error" ? (
            <FiBrainPlaygroundStateMessage tone="error">
              {playground.errorMessage ?? "Failed to load Product Brain decision."}
            </FiBrainPlaygroundStateMessage>
          ) : null}

          {playground.decision ? (
            <FiProductBrainDecisionPanel decision={playground.decision} />
          ) : null}
        </>
      )}
    </div>
  );
}
