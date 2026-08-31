import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { resolve } from "node:path";
import { InteractiveCodexGateway, HELP } from "./interactive-codex-gateway.js";
const storeRoot = process.env.ORCHESTRA_ENGINEERING_STORE;
const gateway = new InteractiveCodexGateway({
  repository: resolve(process.env.ORCHESTRA_REPOSITORY_PATH ?? process.cwd()),
  ...(storeRoot ? { storeRoot } : {}),
});
const terminal = createInterface({ input: stdin, output: stdout });
stdout.write(`F.I. Forgot Interactive Codex Gateway\n${HELP}\n`);
try {
  while (true) {
    const line = await terminal.question("orchestra> ");
    if (["/exit", "/quit"].includes(line.trim().toLowerCase())) break;
    stdout.write(`${(await gateway.converse(line)).message}\n`);
  }
} finally { terminal.close(); }
