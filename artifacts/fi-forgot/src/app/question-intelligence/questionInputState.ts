export interface QuestionInputRequestIdentity {
  recipientId: string;
  generation: number;
}

export function isCurrentQuestionInputRequest(
  request: QuestionInputRequestIdentity,
  currentRecipientId: string | null,
  currentGeneration: number,
): boolean {
  return currentRecipientId !== null
    && request.recipientId === currentRecipientId
    && request.generation === currentGeneration;
}
