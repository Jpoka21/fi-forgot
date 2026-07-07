import { useAppStateContext } from "@/app/state/AppStateProvider";

export function useAppSettings() {
  const { settings, updateAppSettings } = useAppStateContext();

  return {
    settings,
    updateAppSettings,
  };
}
