export interface FiBrainPlaygroundFieldGridProps {
  fields: Array<{
    label: string;
    value: string | number | null | undefined;
    mono?: boolean;
  }>;
}

export function FiBrainPlaygroundFieldGrid({ fields }: FiBrainPlaygroundFieldGridProps) {
  return (
    <dl className="fi-brain-playground__field-grid">
      {fields.map((field) => (
        <div key={field.label} className="fi-brain-playground__field-row">
          <dt className="fi-brain-playground__field-label">{field.label}</dt>
          <dd
            className={`fi-brain-playground__field-value${field.mono ? " fi-brain-playground__field-value--mono" : ""}`}
          >
            {field.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
