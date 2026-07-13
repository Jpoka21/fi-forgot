import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;

  return Boolean(target.closest("[contenteditable='true']"));
}

export function useSearchKeyboardShortcut(onToggle: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (typeof event.key !== "string") return;
      const key = event.key.toLowerCase();
      const isShortcut = key === "k" && (event.metaKey || event.ctrlKey);
      if (!isShortcut) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      onToggle();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onToggle]);
}

export function getSearchShortcutHint(): string {
  if (typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform)) {
    return "⌘ K";
  }
  return "Ctrl K";
}
