import { AIClassificationSchema, type AIClassification } from "@pulsedesk/shared";

export type ParseResult =
  | { success: true; data: AIClassification }
  | { success: false; error: string };

/** Strips ```json ... ``` / ``` ... ``` fences some models wrap JSON in. */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

/**
 * Parses and validates a raw AI response against AIClassificationSchema.
 * This runs regardless of which prompt produced the response — the prompt's
 * instructions are never trusted on their own (defense-in-depth).
 */
export function parseClassificationResponse(raw: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(stripCodeFences(raw));
  } catch (err) {
    return { success: false, error: `Response was not valid JSON: ${(err as Error).message}` };
  }

  const parsed = AIClassificationSchema.safeParse(json);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  return { success: true, data: parsed.data };
}
