import { mapBrainToProfileQuestionViewModel } from "@/app/relationship-profile/mapBrainToProfileQuestionViewModel";
import { mapLegacyToProfileQuestionViewModel } from "@/app/relationship-profile/mapLegacyToProfileQuestionViewModel";
import type { ProfileQuestionViewModel } from "@/app/relationship-profile/profileQuestionViewModel";
import type { NextQuestion } from "@/app/relationship-profile/relationshipProfileDomain";
import type { ProductBrainDecision } from "@/app/product-brain/productBrainDecisionTypes";
import type { Recipient } from "@/lib/data";

export interface NextQuestionApiResponse {
  nextQuestion: NextQuestion | null;
  profileComplete: boolean;
  profileScore?: number;
}

export interface ProfileQuestionResolution {
  profileQuestion: ProfileQuestionViewModel | null;
  profileComplete?: boolean;
  profileScore?: number;
}

export function resolveFromBrain(
  decision: ProductBrainDecision,
): ProfileQuestionViewModel | null {
  if (!decision.selectedFollowUpQuestion) return null;
  return mapBrainToProfileQuestionViewModel(decision);
}

export function resolveProfileGapFallback(
  response: NextQuestionApiResponse,
  recipient?: Recipient,
): ProfileQuestionResolution {
  const profileComplete = response.profileComplete ?? false;
  const profileScore = response.profileScore ?? 0;

  if (response.nextQuestion?.mode !== "profile_gap") {
    return { profileQuestion: null, profileComplete, profileScore };
  }

  return {
    profileQuestion: mapLegacyToProfileQuestionViewModel(response.nextQuestion, recipient),
    profileComplete,
    profileScore,
  };
}

export async function resolveProfileQuestion(
  fetchBrain: () => Promise<ProductBrainDecision | null>,
  fetchNextQuestion: () => Promise<NextQuestionApiResponse | null>,
  recipient?: Recipient,
): Promise<ProfileQuestionResolution> {
  try {
    const brain = await fetchBrain();
    if (brain) {
      const fromBrain = resolveFromBrain(brain);
      if (fromBrain) {
        return { profileQuestion: fromBrain };
      }
    }
  } catch {
    /* fall through to profile-gap fallback */
  }

  const legacy = await fetchNextQuestion();
  if (!legacy) {
    return { profileQuestion: null };
  }

  return resolveProfileGapFallback(legacy, recipient);
}
