export interface FiAuthModeToggleProps {
  mode: "signup" | "signin";
  onChange: (mode: "signup" | "signin") => void;
}

export function FiAuthModeToggle({ mode, onChange }: FiAuthModeToggleProps) {
  return (
    <div className="fi-auth-mode-toggle" role="tablist" aria-label="Authentication mode">
      {(["signup", "signin"] as const).map((item) => {
        const active = mode === item;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={active}
            className={`fi-auth-mode-toggle__btn${active ? " fi-auth-mode-toggle__btn--active" : ""}`}
            onClick={() => onChange(item)}
          >
            {item === "signup" ? "Get started" : "Sign in"}
          </button>
        );
      })}
    </div>
  );
}
