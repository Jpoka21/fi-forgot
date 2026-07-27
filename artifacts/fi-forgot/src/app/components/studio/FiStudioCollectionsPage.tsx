import { useState } from "react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { FiButton } from "@/app/components/button/FiButton";
import { NewCollectionDialog } from "@/app/components/studio/NewCollectionDialog";
import { useStudioCollectionsList } from "@/app/studio/hooks/useStudioCollectionsList";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import {
  STUDIO_OCCASION_LABELS,
  STUDIO_RELATIONSHIP_LABELS,
  STUDIO_STATUS_LABELS,
  STUDIO_STYLE_LABELS,
  formatCollectionDate,
  studioCollectionsDefaults,
  type StudioCollection,
} from "@/app/studio/collectionsDomain";
import { PB } from "@/lib/personal-brand";

function CollectionRow({ collection }: { collection: StudioCollection }) {
  return (
    <article
      style={{
        border: `1px solid ${PB.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        background: PB.white,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>{collection.name}</h2>
          <p style={{ margin: "4px 0 0", color: PB.mid, fontSize: "0.9rem" }}>
            {STUDIO_OCCASION_LABELS[collection.occasion]} ·{" "}
            {STUDIO_RELATIONSHIP_LABELS[collection.relationship]}
            {collection.style ? ` · ${STUDIO_STYLE_LABELS[collection.style]}` : ""}
          </p>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: PB.mid,
            whiteSpace: "nowrap",
          }}
        >
          {STUDIO_STATUS_LABELS[collection.status]}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: PB.mid }}>
          Created {formatCollectionDate(collection.createdAt)}
        </span>
        <FiButton asChild variant="secondary" size="sm">
          <Link href={ROUTE_PATHS.studio.collectionById(collection.id)}>
            {studioCollectionsDefaults.openLabel}
          </Link>
        </FiButton>
      </div>
    </article>
  );
}

export function FiStudioCollectionsPage() {
  const list = useStudioCollectionsList();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>
          {studioCollectionsDefaults.pageTitle}
        </h1>
        <FiButton variant="primary" onClick={() => setDialogOpen(true)}>
          {studioCollectionsDefaults.newCollectionLabel}
        </FiButton>
      </header>

      {list.loading ? (
        <div
          role="status"
          style={{ display: "flex", alignItems: "center", gap: 8, color: PB.mid, padding: "24px 0" }}
        >
          <Loader2 className="animate-spin" size={18} aria-hidden />
          Loading collections…
        </div>
      ) : null}

      {list.error ? (
        <div
          role="alert"
          style={{
            border: `1px solid ${PB.border}`,
            borderRadius: 12,
            padding: 20,
            background: PB.white,
          }}
        >
          <p style={{ margin: "0 0 12px" }}>{list.error}</p>
          <FiButton variant="secondary" onClick={() => void list.reload()}>
            Try again
          </FiButton>
        </div>
      ) : null}

      {!list.loading && !list.error && list.isEmpty ? (
        <div
          style={{
            border: `1px dashed ${PB.border}`,
            borderRadius: 12,
            padding: "40px 24px",
            textAlign: "center",
            background: PB.white,
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>
            {studioCollectionsDefaults.emptyTitle}
          </h2>
          <p style={{ margin: "0 0 20px", color: PB.mid }}>
            {studioCollectionsDefaults.emptyDescription}
          </p>
          <FiButton variant="primary" onClick={() => setDialogOpen(true)}>
            {studioCollectionsDefaults.newCollectionLabel}
          </FiButton>
        </div>
      ) : null}

      {!list.loading && !list.error && list.collections.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.collections.map((collection) => (
            <CollectionRow key={collection.id} collection={collection} />
          ))}
        </div>
      ) : null}

      <NewCollectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={list.addCollection}
      />
    </div>
  );
}
