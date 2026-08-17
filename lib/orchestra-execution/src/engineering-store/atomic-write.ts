import { createHash } from "node:crypto";
import { copyFileSync, closeSync, constants, fsyncSync, mkdirSync, openSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export function writeFileExclusiveAtomic(destination: string, contents: string): void {
  const directory = dirname(destination);
  mkdirSync(directory, { recursive: true });
  const tempPath = join(
    directory,
    `.${basename(destination)}.${process.pid}.${Date.now()}.tmp`,
  );
  const fd = openSync(tempPath, "w");
  try {
    writeFileSync(fd, contents, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    copyFileSync(tempPath, destination, constants.COPYFILE_EXCL);
  } finally {
    try {
      unlinkSync(tempPath);
    } catch {
      // Temp cleanup is best-effort; exclusive dest write is the durability point.
    }
  }
}

export function appendLineAtomic(destination: string, line: string): void {
  mkdirSync(dirname(destination), { recursive: true });
  const fd = openSync(destination, "a");
  try {
    writeFileSync(fd, line.endsWith("\n") ? line : `${line}\n`, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

export function sha256Utf8(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
