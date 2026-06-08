import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getApiHeaders } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";

export const BROWNIE_AWARD_EVENT = "fi:brownie-award";

export interface BrownieAwardDetail {
  awarded:      number;
  newBalance:   number;
  toastMessage: string;
  milestone?:   { threshold: number; message: string };
}

export function dispatchBrownieAward(detail: BrownieAwardDetail): void {
  window.dispatchEvent(new CustomEvent(BROWNIE_AWARD_EVENT, { detail }));
}

interface BrowniePointsContextType {
  balance:  number;
  lifetime: number;
  loading:  boolean;
  refetch:  () => Promise<void>;
}

const BrowniePointsContext = createContext<BrowniePointsContextType>({
  balance: 0, lifetime: 0, loading: false, refetch: async () => {},
});

export function BrowniePointsProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [balance, setBalance]   = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [loading, setLoading]   = useState(false);

  const refetch = useCallback(async () => {
    if (!isLoggedIn) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;
    try {
      const res = await fetch("/api/v2/brownie-points/balance", { headers });
      if (!res.ok) return;
      const data = await res.json() as { balance: number; lifetime: number };
      setBalance(data.balance ?? 0);
      setLifetime(data.lifetime ?? 0);
    } catch { /* non-fatal */ }
  }, [isLoggedIn]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<BrownieAwardDetail>).detail;
      setBalance(detail.newBalance);
    };
    window.addEventListener(BROWNIE_AWARD_EVENT, handler);
    return () => window.removeEventListener(BROWNIE_AWARD_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setBalance(0); setLifetime(0); return; }
    setLoading(true);
    refetch().finally(() => setLoading(false));
  }, [isLoggedIn, refetch]);

  return (
    <BrowniePointsContext.Provider value={{ balance, lifetime, loading, refetch }}>
      {children}
    </BrowniePointsContext.Provider>
  );
}

export function useBrowniePoints(): BrowniePointsContextType {
  return useContext(BrowniePointsContext);
}
