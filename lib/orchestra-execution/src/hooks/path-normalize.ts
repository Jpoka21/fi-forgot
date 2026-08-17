export function normalizeSeparators(value: string): string {
  return value.replace(/\\/g, "/");
}

export function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Windows-appropriate path comparison key.
 * Does not claim symlink containment.
 */
export function normalizePathKey(value: string): string {
  return normalizeSeparators(stripWrappingQuotes(value)).replace(/\/+/g, "/").replace(/\/$/, "").toLowerCase();
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function pathMentionsProtected(
  candidate: string,
  protectedPaths: string[],
  repositoryPath?: string,
): boolean {
  const candidateKey = normalizePathKey(candidate);
  if (!candidateKey) return false;
  for (const protectedPath of protectedPaths) {
    const protectedKey = normalizePathKey(protectedPath);
    if (!protectedKey) continue;
    const base = protectedKey.split("/").pop() ?? protectedKey;
    if (candidateKey === protectedKey) return true;
    if (candidateKey.endsWith(`/${protectedKey}`)) return true;
    if (candidateKey.endsWith(`/${base}`)) return true;
    const quoted = new RegExp(`(^|[\\s"'=])${escapeRegExp(base)}(\\b|["'])`, "i");
    if (quoted.test(candidate)) return true;
    if (repositoryPath) {
      const absolute = normalizePathKey(`${normalizeSeparators(repositoryPath)}/${protectedKey}`);
      if (candidateKey === absolute || candidateKey.endsWith(absolute)) return true;
    }
  }
  return false;
}

export function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      out.push(key);
      collectStrings(item, out);
    }
  }
  return out;
}

export const STRUCTURED_PATH_KEYS = ["path", "file_path", "filePath", "target_file", "target", "filename", "uri"];

export function extractStructuredPaths(toolInput: unknown): string[] {
  if (!toolInput || typeof toolInput !== "object") return [];
  const record = toolInput as Record<string, unknown>;
  const paths: string[] = [];
  for (const key of STRUCTURED_PATH_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) paths.push(value);
  }
  return paths;
}

export function structuredPathMissing(toolInput: unknown): boolean {
  return extractStructuredPaths(toolInput).length === 0;
}
