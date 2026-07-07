import { useAppStateContext } from "@/app/state/AppStateProvider";

export function useAppError() {
  const { error, setAppError, clearAppError } = useAppStateContext();

  return {
    error,
    setAppError,
    clearAppError,
    hasError: Boolean(error.message),
  };
}
