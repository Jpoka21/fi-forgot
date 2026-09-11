import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import { normalizeTimelineItem } from "@/app/timeline/timelineDomain";
import type { FiTimelineItem } from "@/app/timeline/timelineDomain";

export type { FiTimelineItem as TimelineItem };

export interface TimelineResponse {
  items: FiTimelineItem[];
}

/**
 * Timeline API over existing recipient endpoints.
 * Normalization lives in `@/app/timeline/timelineDomain`.
 */
export const timelineService = {
  async getTimeline(recipientId: string) {
    const result = await apiFetch<TimelineResponse>(
      API_ENDPOINTS.recipients.timeline(recipientId),
      { throwOnError: true },
    );

    if (!result.data || !Array.isArray(result.data.items)) {
      throw new Error("Timeline response is missing an items array");
    }
    const rawItems = result.data.items;

    return {
      items: rawItems
        .map((item) => normalizeTimelineItem(item))
        .filter((item): item is FiTimelineItem => item !== null),
    };
  },

  archiveAnswer(recipientId: string, itemId: string, expectedVersionId:string, operationId?:string) {
    return apiFetch(API_ENDPOINTS.recipients.archiveAnswer(recipientId, itemId), {
      method: "PATCH",
      json:{expectedVersionId,operationId},
      throwOnError: true,
    });
  },

  editAnswer(recipientId: string, itemId: string, answerText: string, expectedVersionId:string, operationId?:string) {
    return apiFetch(API_ENDPOINTS.recipients.editAnswer(recipientId, itemId), {
      method: "PATCH",
      json: { answerText,expectedVersionId,operationId },
      throwOnError: true,
    });
  },
  restoreAnswer(recipientId: string, itemId: string, expectedVersionId:string, operationId?:string) {
    return apiFetch(API_ENDPOINTS.recipients.restoreAnswer(recipientId, itemId), {
      method: "PATCH",
      json:{expectedVersionId,operationId},
      throwOnError: true,
    });
  },
  createInterpretation(recipientId:string, input:{text:string;dependencyVersionIds:string[];operationId:string}) {
    return apiFetch(API_ENDPOINTS.recipients.interpretations(recipientId), {method:"POST",json:input,throwOnError:true});
  },
  changeInterpretation(recipientId:string, interpretationId:string, action:"confirm"|"withdraw"|"reject"|"archive"|"restore", expectedRevision:number, operationId:string) {
    return apiFetch(API_ENDPOINTS.recipients.interpretationLifecycle(recipientId,interpretationId,action), {method:"PATCH",json:{expectedRevision,operationId},throwOnError:true});
  },
  changeHypothesis(recipientId:string,hypothesisId:string,action:"confirm"|"disagree"|"withdraw"|"reverse",expectedRevision:number,operationId:string){return apiFetch(API_ENDPOINTS.recipients.hypothesisLifecycle(recipientId,hypothesisId,action),{method:"PATCH",json:{expectedRevision,operationId},throwOnError:true});},
};
