import { normalizePathKey, pathMentionsProtected } from "../hooks/path-normalize.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

export function runPathNormalizationTests(): void {
  section("path normalization");
  expect("windows separators", normalizePathKey("C:\\tmp\\protected.txt"), "c:/tmp/protected.txt");
  expect("quoted path", normalizePathKey('"protected.txt"'), "protected.txt");
  expectTrue(
    "relative protected",
    pathMentionsProtected("protected.txt", ["protected.txt"]),
  );
  expectTrue(
    "absolute windows protected",
    pathMentionsProtected("C:\\work\\protected.txt", ["protected.txt"], "C:\\work"),
  );
  expectTrue(
    "quoted shell path",
    pathMentionsProtected('echo >> "protected.txt"', ["protected.txt"]),
  );
  expectFalse(
    "does not match similarly named file",
    pathMentionsProtected("unprotected.txt", ["protected.txt"]),
  );
  expectTrue(
    "case-insensitive on windows keys",
    pathMentionsProtected("Protected.TXT", ["protected.txt"]),
  );
}
