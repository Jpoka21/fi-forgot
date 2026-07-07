import { useAppStateContext } from "@/app/state/AppStateProvider";

export function useConnectivity() {
  const { connectivity } = useAppStateContext();

  return connectivity;
}
