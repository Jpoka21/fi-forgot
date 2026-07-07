import { browniePointsService } from "@/app/api/services/browniePointsService";
import {
  normalizeBrownieTransaction,
  type FiBrowniePointTransaction,
  type FiBrowniePointsAccountResponse,
} from "@/app/brownie-points/browniePointsDomain";

export interface FiBrowniePointsAccount {
  balance: number;
  lifetime: number;
  recent: FiBrowniePointTransaction[];
}

export async function fetchBrowniePointsAccount(): Promise<FiBrowniePointsAccount> {
  const result = await browniePointsService.getAccount();
  const body = (result.data ?? {}) as Partial<FiBrowniePointsAccountResponse>;
  const recent = Array.isArray(body.recent) ? body.recent : [];

  return {
    balance: typeof body.balance === "number" ? body.balance : 0,
    lifetime: typeof body.lifetime === "number" ? body.lifetime : 0,
    recent: recent
      .map((item) => normalizeBrownieTransaction(item))
      .filter((item): item is FiBrowniePointTransaction => item !== null),
  };
}
