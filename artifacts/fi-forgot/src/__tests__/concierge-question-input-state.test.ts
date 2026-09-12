import {
  isCurrentQuestionInputRequest,
} from "../app/question-intelligence/questionInputState.js";

const request = { recipientId: "recipient-a", generation: 7 };
if (!isCurrentQuestionInputRequest(request, "recipient-a", 7)) throw new Error("current request rejected");
for (const [recipientId, generation] of [["recipient-b", 7], ["recipient-a", 8], [null, 7]] as const) {
  if (isCurrentQuestionInputRequest(request, recipientId, generation)) throw new Error("stale request accepted");
}
console.log("Concierge render/request identity guard PASS");
