import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AppDialogEntry {
  id: string;
  content: ReactNode;
}

interface DialogContextValue {
  dialogs: AppDialogEntry[];
  hasOpenDialogs: boolean;
  openDialog: (id: string, content: ReactNode) => void;
  closeDialog: (id: string) => void;
  closeAllDialogs: () => void;
  isDialogOpen: (id: string) => boolean;
}

const DialogContext = createContext<DialogContextValue | null>(null);

/**
 * Global dialog portal foundation.
 *
 * Registers dialog content by id. Screen-level dialog components are added later.
 */
export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<AppDialogEntry[]>([]);

  const openDialog = useCallback((id: string, content: ReactNode) => {
    setDialogs((current) => {
      const withoutId = current.filter((dialog) => dialog.id !== id);
      return [...withoutId, { id, content }];
    });
  }, []);

  const closeDialog = useCallback((id: string) => {
    setDialogs((current) => current.filter((dialog) => dialog.id !== id));
  }, []);

  const closeAllDialogs = useCallback(() => {
    setDialogs([]);
  }, []);

  const isDialogOpen = useCallback(
    (id: string) => dialogs.some((dialog) => dialog.id === id),
    [dialogs],
  );

  const value = useMemo(
    () => ({
      dialogs,
      hasOpenDialogs: dialogs.length > 0,
      openDialog,
      closeDialog,
      closeAllDialogs,
      isDialogOpen,
    }),
    [closeAllDialogs, closeDialog, dialogs, isDialogOpen, openDialog],
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      <div
        id="fi-dialog-portal"
        data-testid="dialog-portal"
        aria-hidden={dialogs.length === 0 ? true : undefined}
      >
        {dialogs.map((dialog) => (
          <div key={dialog.id} data-dialog-id={dialog.id}>
            {dialog.content}
          </div>
        ))}
      </div>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("useDialog must be used within DialogProvider");
  }

  return context;
}
