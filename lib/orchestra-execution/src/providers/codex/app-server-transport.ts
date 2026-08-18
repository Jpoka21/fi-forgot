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

interface RpcResponse {
  id?: number;
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

function rpcError(error: RpcResponse["error"]): Error {
  const code = error?.code === undefined ? "unknown" : String(error.code);
  return new Error(`Codex App Server JSON-RPC ${code}: ${redact(error?.message ?? "unknown error")}`);
}

function redact(value: string): string {
  return value
    .replace(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, "[REDACTED]")
    .replace(/(authorization\s*:\s*bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .replace(/((?:api[_-]?key|token)\s*[=:]\s*)[^\s,;]+/gi, "$1[REDACTED]");
}

export class StdioCodexAppServerTransport implements CodexAppServerTransport {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly pending = new Map<number, PendingRequest>();
  private readonly listeners = new Set<(notification: AppServerNotification) => void>();
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
    this.child.stderr.on("data", (chunk: string) => {
      this.stderr = `${this.stderr}${chunk}`.slice(-8_192);
    });
    this.child.once("error", (error) => this.rejectAll(error));
    this.child.once("exit", (code, signal) => {
      if (!this.closed) {
        this.rejectAll(
          new Error(
            `Codex App Server exited (${signal ? `signal ${signal}` : `code ${code ?? 1}`}): ${redact(this.stderr)}`,
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
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.child.stdin.write(`${JSON.stringify({ id, method, params })}\n`, (error) => {
        if (!error) return;
        this.pending.delete(id);
        reject(error);
      });
    });
  }

  onNotification(listener: (notification: AppServerNotification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private handleLine(line: string): void {
    let message: RpcResponse;
    try {
      message = JSON.parse(line) as RpcResponse;
    } catch {
      this.rejectAll(new Error("Codex App Server emitted invalid JSON"));
      return;
    }
    if (
      typeof message.id === "number" &&
      typeof message.method === "string" &&
      !this.pending.has(message.id)
    ) {
      this.child.stdin.write(
        `${JSON.stringify({
          id: message.id,
          error: {
            code: -32601,
            message: "Orchestra read-only provider rejects unexpected server requests",
          },
        })}\n`,
      );
      const notification = { method: "serverRequest/refused", params: { requestMethod: message.method } };
      for (const listener of this.listeners) listener(notification);
      return;
    }
    if (typeof message.id === "number") {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(rpcError(message.error));
      else pending.resolve(message.result);
      return;
    }
    if (typeof message.method === "string") {
      const notification = { method: message.method, params: message.params };
      for (const listener of this.listeners) listener(notification);
    }
  }

  private rejectAll(error: Error): void {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.rejectAll(new Error("Codex App Server transport closed"));
    this.child.stdin.end();
    if (!this.child.killed) this.child.kill();
  }
}
