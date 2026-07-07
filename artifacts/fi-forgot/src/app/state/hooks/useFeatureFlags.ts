import { useAppStateContext } from "@/app/state/AppStateProvider";

export function useFeatureFlags() {
  const { featureFlags, setFeatureFlag } = useAppStateContext();

  return {
    flags: featureFlags,
    setFeatureFlag,
  };
}
