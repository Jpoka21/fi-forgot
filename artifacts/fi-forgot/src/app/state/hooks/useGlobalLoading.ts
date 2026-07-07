import { useLoadingOverlay } from "@/app/loading/LoadingOverlay";
import type { GlobalLoadingState } from "@/app/state/types";

export function useGlobalLoading(): GlobalLoadingState {
  return useLoadingOverlay();
}
