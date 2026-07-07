import { useMemo, useState } from "react";

import { trackAdminEvent } from "@/app/admin/adminAnalytics";
import { ILLUSTRATION_ASSETS, adminDefaults } from "@/app/admin/adminDomain";
import {
  filterIllustrations,
  getIllustrationCategories,
  readIllustrationActivation,
  writeIllustrationActivation,
} from "@/app/admin/adminEngine";
import { FiButton } from "@/app/components/button/FiButton";
import { FiInput } from "@/app/components/input/FiInput";
import { FiSelect } from "@/app/components/input/FiSelect";
import { FiSwitch } from "@/app/components/input/FiSwitch";
import { FiInformationDialog } from "@/app/components/dialog/FiDialogPresets";

export function FiAdminIllustrationLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [activation, setActivation] = useState(() => readIllustrationActivation());
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [uploadInfoOpen, setUploadInfoOpen] = useState(false);

  const categories = useMemo(() => getIllustrationCategories(), []);
  const assets = useMemo(
    () => filterIllustrations(ILLUSTRATION_ASSETS, query, category),
    [category, query],
  );

  const toggleActive = (id: string, path: string, active: boolean) => {
    const next = { ...activation, [path]: active };
    setActivation(next);
    writeIllustrationActivation(next);
    trackAdminEvent("admin_illustration_toggled", { id, active });
  };

  return (
    <section aria-labelledby="admin-illustrations-title">
      <header className="fi-admin__panel-header">
        <h2 id="admin-illustrations-title" className="fi-admin__panel-title">
          {adminDefaults.illustrationsTitle}
        </h2>
        <p className="fi-admin__panel-subtitle">{adminDefaults.illustrationsSubtitle}</p>
        <FiButton variant="secondary" size="sm" onClick={() => setUploadInfoOpen(true)}>
          Upload / replace
        </FiButton>
      </header>

      <div className="fi-admin__filters">
        <FiInput
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter illustrations"
          aria-label="Filter illustrations"
        />
        <FiSelect value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FiSelect>
      </div>

      <div className="fi-admin__grid">
        {assets.map((asset) => {
          const isActive = activation[asset.path] !== false;
          return (
            <article key={asset.id} className="fi-admin__asset-card">
              <button type="button" onClick={() => setSelectedPath(asset.path)} aria-label={`Preview ${asset.title}`}>
                <img src={asset.path} alt={asset.alt} className="fi-admin__asset-preview" loading="lazy" />
              </button>
              <div>
                <strong>{asset.title}</strong>
                <p className="fi-admin__metric-label">{asset.category}</p>
                <p className="fi-admin__metric-label">{asset.path}</p>
              </div>
              <FiSwitch
                checked={isActive}
                onCheckedChange={(checked) => toggleActive(asset.id, asset.path, checked)}
                aria-label={`Activate ${asset.title}`}
                label="Active in library"
              />
            </article>
          );
        })}
      </div>

      {selectedPath ? (
        <dialog open className="fi-admin__asset-card" style={{ marginTop: "1rem" }}>
          <p className="fi-admin__panel-subtitle">Preview: {selectedPath}</p>
          <img src={selectedPath} alt="" className="fi-admin__asset-preview" />
          <FiButton variant="ghost" size="sm" onClick={() => setSelectedPath(null)}>
            Close preview
          </FiButton>
        </dialog>
      ) : null}

      <FiInformationDialog
        open={uploadInfoOpen}
        onOpenChange={setUploadInfoOpen}
        title="Asset upload"
        description={adminDefaults.uploadDeferredNotice}
      />
    </section>
  );
}
