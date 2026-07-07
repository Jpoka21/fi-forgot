import { useAppStateContext } from "@/app/state/AppStateProvider";
import type { AuthRefreshState } from "@/app/state/types";

export function useAuthRefresh(): AuthRefreshState {
  const { authRefresh } = useAppStateContext();

  return authRefresh;
}
