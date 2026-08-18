import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

export interface AppServerNotification {
  method: string;
  params?: unknown;
}

export interface CodexAppServerTransport {
  request<T>(method: string, params: unknown): Promise<T>;
  onNotification(listener: (notification: AppServerNotification) => void): () => void;
  close(): Promise<void>;
}

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

interface RpcMessage {
  id?: number | string | null;
  result?: unknown;
  error?: { code?: number; message?: string };
  method?: string;
  params?: unknown;
}

function resolveCodexLauncher(): string {
  const require = createRequire(import.meta.url);
  const packageJson = require.resolve("@openai/codex/package.json");
  return join(dirname(packageJson), "bin", "codex.js");
}

function rpcError(error: RpcMessage["error"]): Error {
  const code = error?.code === undefined ? "unknown" : String(error.code);
  return new Error(`Codex App Server JSON-RPC ${code}: ${redactCodexText(error?.message ?? "unknown error")}`);
}

export function redactCodexText(value: string): string {
  return value
    .replace(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, "[REDACTED]")
    .replace(/(authorization\s*:\s*bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .replace(/((?:api[_-]?key|token)\s*[=:]\s*)[^\s,;]+/gi, "$1[REDACTED]");
}

function hasOwn(record: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

/** Routes the documented App Server request/response/notification shapes without relying on ID uniqueness across directions. */
export class CodexAppServerMessageRouter {
  private readonly pending = new Map<number, PendingRequest>();

  constructor(
    private readonly send: (message: unknown) => void,
    private readonly notify: (notification: AppServerNotification) => void,
  ) {}

  register(id: number): Promise<unknown> {
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  reject(id: number, error: Error): void {
    const pending = this.pending.get(id);
    if (!pending) return;
    this.pending.delete(id);
    pending.reject(error);
  }

  handleLine(line: string): void {
    let message: RpcMessage;
    try {
      message = JSON.parse(line) as RpcMessage;
    } catch {
      this.rejectAll(new Error("Codex App Server emitted invalid JSON"));
      this.notify({ method: "transport/protocolError", params: { reason: "invalid_json" } });
      return;
    }

    if (!message || typeof message !== "object" || Array.isArray(message)) {
      this.rejectAll(new Error("Codex App Server emitted a malformed JSON-RPC message"));
      this.notify({ method: "transport/protocolError", params: { reason: "message_not_object" } });
      return;
    }

    if (hasOwn(message, "method")) {
      if (typeof message.method !== "string") {
        this.failMalformedResponse(message, "method_not_string");
        return;
      }
      if (hasOwn(message, "id")) {
        if (typeof message.id !== "number" && typeof message.id !== "string") {
          this.notify({ method: "transport/protocolError", params: { reason: "request_id_invalid" } });
          return;
        }
        this.send({
          id: message.id,
          error: {
            code: -32601,
            message: "Orchestra read-only provider rejects unexpected server requests",
          },
        });
        this.notify({ method: "serverRequest/refused", params: { requestMethod: message.method } });
        return;
      }
      this.notify({ method: message.method, params: message.params });
      return;
    }

    if (typeof message.id === "number") {
      const hasResult = hasOwn(message, "result");
      const hasError = hasOwn(message, "error");
      if (hasResult === hasError || (hasError && (!message.error || typeof message.error !== "object"))) {
        this.failMalformedResponse(message, "response_shape_invalid");
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) {
        this.notify({ method: "transport/unknownResponse", params: { responseId: message.id } });
        return;
      }
      this.pending.delete(message.id);
      if (hasError) pending.reject(rpcError(message.error));
      else pending.resolve(message.result);
      return;
    }

    this.notify({ method: "transport/protocolError", params: { reason: "unrecognized_message_shape" } });
  }

  private failMalformedResponse(message: RpcMessage, reason: string): void {
    const error = new Error(`Codex App Server emitted malformed JSON-RPC: ${reason}`);
    if (typeof message.id === "number" && this.pending.has(message.id)) this.reject(message.id, error);
    this.notify({ method: "transport/protocolError", params: { reason, responseId: message.id } });
  }

  rejectAll(error: Error): void {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }
}

export class StdioCodexAppServerTransport implements CodexAppServerTransport {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly listeners = new Set<(notification: AppServerNotification) => void>();
  private readonly router: CodexAppServerMessageRouter;
  private readonly ready: Promise<void>;
  private nextId = 1;
  private closed = false;
  private stderr = "";

  constructor() {
    this.child = spawn(process.execPath, [resolveCodexLauncher(), "app-server", "--listen", "stdio://"], {
      env: process.env,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.child.stderr.setEncoding("utf8");
    this.router = new CodexAppServerMessageRouter(
      (message) => this.child.stdin.write(`${JSON.stringify(message)}\n`),
      (notification) => {
        for (const listener of this.listeners) listener(notification);
      },
    );
    this.child.stderr.on("data", (chunk: string) => {
      this.stderr = `${this.stderr}${chunk}`.slice(-8_192);
    });
    this.child.once("error", (error) => this.rejectAll(error));
    this.child.once("exit", (code, signal) => {
      if (!this.closed) {
        this.rejectAll(
          new Error(
            `Codex App Server exited (${signal ? `signal ${signal}` : `code ${code ?? 1}`}): ${redactCodexText(this.stderr)}`,
          ),
        );
      }
    });
    const lines = createInterface({ input: this.child.stdout, crlfDelay: Infinity });
    lines.on("line", (line) => this.handleLine(line));
    this.ready = this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.requestRaw("initialize", {
      clientInfo: { name: "orchestra-execution", title: "Orchestra Execution Provider", version: "0.0.0" },
      capabilities: {},
    });
    this.child.stdin.write(`${JSON.stringify({ method: "initialized", params: {} })}\n`);
  }

  async request<T>(method: string, params: unknown): Promise<T> {
    if (method !== "initialize") await this.ready;
    return this.requestRaw(method, params) as Promise<T>;
  }

  private requestRaw(method: string, params: unknown): Promise<unknown> {
    if (this.closed) return Promise.reject(new Error("Codex App Server transport is closed"));
    const id = this.nextId++;
    const pending = this.router.register(id);
    this.child.stdin.write(`${JSON.stringify({ id, method, params })}\n`, (error) => {
      if (!error) return;
      this.router.reject(id, error);
    });
    return pending;
  }

  onNotification(listener: (notification: AppServerNotification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private handleLine(line: string): void {
    this.router.handleLine(line);
  }

  private rejectAll(error: Error): void {
    this.router.rejectAll(error);
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.rejectAll(new Error("Codex App Server transport closed"));
    this.child.stdin.end();
    if (!this.child.killed) this.child.kill();
  }
}
