import { runOwnerCli } from "./owner-cli.js";

const result = await runOwnerCli(process.argv.slice(2), {
  out: (value) => process.stdout.write(`${value}\n`),
  err: (value) => process.stderr.write(`${value}\n`),
});
process.exitCode = result.exitCode;
