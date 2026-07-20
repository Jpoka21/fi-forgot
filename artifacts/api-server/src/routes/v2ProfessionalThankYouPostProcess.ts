import {
  isProfessionalThankYouOccasion,
  signOffContainsGratitudeLanguage,
} from "./v2GenerateCardContextLines";

export type ProfessionalThankYouPostProcessOptions = {
  isProThankYou: boolean;
  signOff?: string | null;
};

export type ProfessionalThankYouPostProcessResult = {
  text: string;
  removedSentence: string | null;
  applied: boolean;
};

/** Deed thank names the specific act — always preserved. */
export function isDeedThankSentence(sentence: string): boolean {
  return (
    /\bthank(?:s| you)(?:\s+again)?\s+for\b/i.test(sentence) ||
    /\bthanks\s+for\b/i.test(sentence)
  );
}

/** Gratitude restatement carries gratitude language but is not a deed-thank. */
export function isGratitudeRestatementSentence(sentence: string): boolean {
  const trimmed = sentence.trim();
  if (!trimmed) return false;
  return signOffContainsGratitudeLanguage(trimmed) && !isDeedThankSentence(trimmed);
}

/** Split card text into sentences, preserving trailing punctuation. */
export function splitCardSentences(cardText: string): string[] {
  const sentences: string[] = [];
  let remainder = cardText;
  const re = /[^.!?]*[.!?]+["']?(\s*)/g;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cardText)) !== null) {
    sentences.push(m[0]);
    remainder = cardText.slice(re.lastIndex);
  }
  if (remainder.trim()) sentences.push(remainder);
  return sentences;
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function dashesNormalized(text: string): string {
  return text.replace(/[—–]/g, "-");
}

function collapseSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

type BodySignOffSplit = {
  body: string;
  signOffLine: string;
};

/**
 * Locate the user-supplied sign-off at the end of the card.
 * Fail-safe: returns null when the sign-off cannot be identified reliably.
 * Output always uses the exact user signOff string when a match is found.
 */
export function splitBodyAndSignOff(
  cardText: string,
  signOff: string,
): BodySignOffSplit | null {
  const trimmed = normalizeNewlines(cardText).trim();
  const exactSignOff = signOff.trim();
  if (!trimmed || !exactSignOff) return null;

  if (trimmed.endsWith(exactSignOff)) {
    const body = trimmed
      .slice(0, trimmed.length - exactSignOff.length)
      .replace(/[ \t]+$/, "")
      .replace(/\n+$/, "");
    return { body, signOffLine: exactSignOff };
  }

  const lines = trimmed.split("\n");
  const lastLine = lines[lines.length - 1] ?? "";

  if (lastLine.trim() === exactSignOff) {
    return {
      body: lines.slice(0, -1).join("\n").trimEnd(),
      signOffLine: exactSignOff,
    };
  }

  const idx = lastLine.lastIndexOf(exactSignOff);
  if (idx >= 0 && idx + exactSignOff.length === lastLine.length) {
    const beforeSignOff = lastLine.slice(0, idx).replace(/[.\s]+$/, "").trimEnd();
    const bodyLines = lines.slice(0, -1);
    if (beforeSignOff) bodyLines.push(beforeSignOff);
    return { body: bodyLines.join("\n").trimEnd(), signOffLine: exactSignOff };
  }

  const normalizedCard = dashesNormalized(trimmed);
  const normalizedSignOff = dashesNormalized(exactSignOff);
  if (!normalizedCard.endsWith(normalizedSignOff)) return null;

  const signOffStart = normalizedCard.length - normalizedSignOff.length;
  const originalSignOffStart = trimmed.length - exactSignOff.length;
  if (
    collapseSpaces(dashesNormalized(trimmed.slice(originalSignOffStart))) !==
    collapseSpaces(normalizedSignOff)
  ) {
    return null;
  }

  const body = trimmed.slice(0, originalSignOffStart).replace(/[ \t]+$/, "").replace(/\n+$/, "");
  return { body, signOffLine: exactSignOff };
}

function bodyHasDeedThank(body: string): boolean {
  return splitCardSentences(body).some((sentence) => isDeedThankSentence(sentence));
}

function removeLastSentenceFromBody(body: string, lastSentence: string): string {
  const trimmedSentence = lastSentence.trim();
  const lines = body.split("\n");
  const lastLine = lines[lines.length - 1]?.trim() ?? "";

  if (lastLine === trimmedSentence || lastLine.endsWith(trimmedSentence)) {
    const shortened = lastLine.slice(0, lastLine.length - trimmedSentence.length).replace(/[.\s]+$/, "").trimEnd();
    if (shortened) {
      lines[lines.length - 1] = shortened;
      return lines.join("\n").trimEnd();
    }
    return lines.slice(0, -1).join("\n").trimEnd();
  }

  const sentences = splitCardSentences(body);
  if (sentences.length <= 1) return body;
  return sentences
    .slice(0, -1)
    .join("")
    .replace(/\s{2,}/g, " ")
    .trimEnd();
}

function reassembleCard(body: string, signOffLine: string): string {
  const trimmedBody = body.trimEnd();
  if (!trimmedBody) return signOffLine;
  return `${trimmedBody}\n${signOffLine}`;
}

/**
 * Sprint 9B.2 attempt 3 — deterministic post-generation normalization for
 * professional Thank You cards with a gratitude-bearing sign-off.
 *
 * Removes only a redundant final-body gratitude restatement when a deed-thank
 * and gratitude sign-off are also present. Never invents replacement text.
 */
export function stripProfessionalThankYouGratitudeStack(
  cardText: string,
  signOff?: string | null,
): ProfessionalThankYouPostProcessResult {
  const unchanged = (text: string): ProfessionalThankYouPostProcessResult => ({
    text,
    removedSentence: null,
    applied: false,
  });

  if (!cardText?.trim() || !signOff?.trim()) return unchanged(cardText);
  if (!signOffContainsGratitudeLanguage(signOff)) return unchanged(cardText);

  const split = splitBodyAndSignOff(cardText, signOff);
  if (!split) return unchanged(cardText);

  const { body, signOffLine } = split;
  if (!body.trim()) return unchanged(cardText);
  if (!bodyHasDeedThank(body)) return unchanged(cardText);

  const sentences = splitCardSentences(body);
  if (sentences.length < 2) return unchanged(cardText);

  const lastSentence = sentences[sentences.length - 1]?.trim() ?? "";
  if (!isGratitudeRestatementSentence(lastSentence)) return unchanged(cardText);

  const newBody = removeLastSentenceFromBody(body, lastSentence);
  if (!newBody.trim()) return unchanged(cardText);

  return {
    text: reassembleCard(newBody, signOffLine),
    removedSentence: lastSentence,
    applied: true,
  };
}

export function applyProfessionalThankYouPostProcess(
  cardText: string,
  opts: ProfessionalThankYouPostProcessOptions,
): ProfessionalThankYouPostProcessResult {
  if (!opts.isProThankYou) {
    return { text: cardText, removedSentence: null, applied: false };
  }
  return stripProfessionalThankYouGratitudeStack(cardText, opts.signOff);
}

export { isProfessionalThankYouOccasion };
