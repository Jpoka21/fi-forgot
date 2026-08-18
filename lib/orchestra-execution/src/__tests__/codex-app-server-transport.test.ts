import {
  CodexAppServerMessageRouter,
  type AppServerNotification,
} from "../providers/codex/app-server-transport.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function fixture() {
  const sent: unknown[] = [];
  const notifications: AppServerNotification[] = [];
  const router = new CodexAppServerMessageRouter(
    (message) => sent.push(message),
    (notification) => notifications.push(notification),
  );
  return { router, sent, notifications };
}

async function tracked(promise: Promise<unknown>) {
  const state: { settled: boolean; value?: unknown; error?: Error } = { settled: false };
  promise.then(
    (value) => Object.assign(state, { settled: true, value }),
    (error) => Object.assign(state, { settled: true, error }),
  );
  await Promise.resolve();
  return state;
}

export async function runCodexAppServerTransportTests(): Promise<void> {
  section("Codex App Server transport routing");

  const normal = fixture();
  const normalState = await tracked(normal.router.register(1));
  normal.router.handleLine(JSON.stringify({ id: 1, result: { ok: true } }));
  await Promise.resolve();
  expect("normal response resolves matching request", normalState.value, { ok: true });

  const noncolliding = fixture();
  noncolliding.router.handleLine(JSON.stringify({ id: 41, method: "item/tool/requestApproval", params: {} }));
  expect("noncolliding provider request rejected", noncolliding.sent, [{
    id: 41,
    error: { code: -32601, message: "Orchestra read-only provider rejects unexpected server requests" },
  }]);
  expect("noncolliding provider request reported", noncolliding.notifications[0]?.method, "serverRequest/refused");

  const collision = fixture();
  const collisionState = await tracked(collision.router.register(7));
  collision.router.handleLine(JSON.stringify({ id: 7, method: "item/permissions/requestApproval", params: {} }));
  await Promise.resolve();
  expectFalse("colliding provider request does not settle local request", collisionState.settled);
  expect("colliding provider request is refused", collision.sent, [{
    id: 7,
    error: { code: -32601, message: "Orchestra read-only provider rejects unexpected server requests" },
  }]);
  collision.router.handleLine(JSON.stringify({ id: 7, result: { thread: { id: "real-thread" } } }));
  await Promise.resolve();
  expect("later legitimate response resolves local request", collisionState.value, { thread: { id: "real-thread" } });

  const unknownRequest = fixture();
  unknownRequest.router.handleLine(JSON.stringify({ id: "server-1", method: "unknown/request", params: {} }));
  expect("unknown provider request fails closed", unknownRequest.notifications[0]?.method, "serverRequest/refused");
  expectTrue("string provider request id echoed", JSON.stringify(unknownRequest.sent[0]).includes('"id":"server-1"'));

  const notification = fixture();
  notification.router.handleLine(JSON.stringify({ method: "turn/started", params: { turn: { id: "turn-1" } } }));
  expect("notification without id delivered", notification.notifications[0]?.method, "turn/started");
  expect("notification produces no response", notification.sent, []);

  const malformed = fixture();
  const malformedState = await tracked(malformed.router.register(9));
  malformed.router.handleLine(JSON.stringify({ id: 9 }));
  await Promise.resolve();
  expectTrue("malformed matching response rejects pending request", malformedState.error?.message.includes("response_shape_invalid") === true);
  expect("malformed response emits diagnostic", malformed.notifications[0]?.method, "transport/protocolError");

  const unknownResponse = fixture();
  unknownResponse.router.handleLine(JSON.stringify({ id: 999, result: {} }));
  expect("unknown response id is observable", unknownResponse.notifications[0]?.method, "transport/unknownResponse");

  const duplicate = fixture();
  const duplicateState = await tracked(duplicate.router.register(3));
  duplicate.router.handleLine(JSON.stringify({ id: 3, result: "first" }));
  duplicate.router.handleLine(JSON.stringify({ id: 3, result: "duplicate" }));
  await Promise.resolve();
  expect("first response wins", duplicateState.value, "first");
  expect("duplicate response becomes unknown response", duplicate.notifications[0]?.method, "transport/unknownResponse");

  const providerError = fixture();
  const errorState = await tracked(providerError.router.register(5));
  providerError.router.handleLine(JSON.stringify({
    id: 5,
    error: { code: 401, message: "unauthorized authorization: Bearer sk-supersecret123" },
  }));
  await Promise.resolve();
  expect(
    "provider error remains useful and redacted",
    errorState.error?.message,
    "Codex App Server JSON-RPC 401: unauthorized authorization: Bearer [REDACTED]",
  );

  const shutdown = fixture();
  const shutdownState = await tracked(shutdown.router.register(11));
  shutdown.router.rejectAll(new Error("Codex App Server transport closed"));
  await Promise.resolve();
  expect("shutdown rejects pending request", shutdownState.error?.message, "Codex App Server transport closed");

  const invalidJson = fixture();
  const invalidState = await tracked(invalidJson.router.register(13));
  invalidJson.router.handleLine("not-json api_key=sk-supersecret123");
  await Promise.resolve();
  expect("invalid JSON rejects pending request", invalidState.error?.message, "Codex App Server emitted invalid JSON");
  expect("invalid JSON emits sanitized diagnostic", invalidJson.notifications[0], {
    method: "transport/protocolError",
    params: { reason: "invalid_json" },
  });
}
