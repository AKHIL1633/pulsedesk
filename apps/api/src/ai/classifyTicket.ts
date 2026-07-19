import type { AIClassification } from "@pulsedesk/shared";
import { getAIProvider } from "./providerFactory";
import { buildClassificationPrompt } from "./prompt";
import { parseClassificationResponse } from "./parseClassification";
import { classifyAIError, AIProviderError } from "./errors";
import { fullJitterBackoffMs, sleep } from "./backoff";
import { logAICall } from "./logger";
import type { AIProvider } from "./types";

const MAX_TRANSIENT_ATTEMPTS = 3;

/**
 * Calls `provider.generate(prompt)`, retrying on retryable errors
 * (RATE_LIMITED, TIMEOUT, SERVER_ERROR) with full-jitter exponential
 * backoff. Non-retryable errors (INVALID_REQUEST, UNKNOWN) surface
 * immediately. Every attempt is logged.
 */
async function generateWithBackoff(
  provider: AIProvider,
  prompt: string,
  promptLabel: string,
  maxAttempts: number,
): Promise<string> {
  let lastError: AIProviderError | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const start = Date.now();
    try {
      const raw = await provider.generate(prompt);
      logAICall({
        provider: provider.name,
        attempt: attempt + 1,
        prompt: promptLabel,
        rawResponse: raw,
        valid: true,
        latencyMs: Date.now() - start,
      });
      return raw;
    } catch (err) {
      const aiError = classifyAIError(err);
      lastError = aiError;
      logAICall({
        provider: provider.name,
        attempt: attempt + 1,
        prompt: promptLabel,
        rawResponse: null,
        valid: false,
        latencyMs: Date.now() - start,
        errorCode: aiError.code,
      });

      const isLastAttempt = attempt === maxAttempts - 1;
      if (!aiError.retryable || isLastAttempt) {
        throw aiError;
      }

      await sleep(fullJitterBackoffMs(attempt));
    }
  }

  throw lastError ?? new AIProviderError("UNKNOWN", "Exhausted retries with no captured error");
}

/**
 * Classifies a ticket via the active AI provider. Never throws — on any
 * unrecoverable failure (transient error exhausted, or two consecutive
 * schema-invalid responses) it returns null so the caller can still save
 * the ticket without blocking on AI availability.
 */
export async function classifyTicket(
  title: string,
  description: string,
): Promise<AIClassification | null> {
  const provider = getAIProvider();

  let raw: string;
  try {
    raw = await generateWithBackoff(
      provider,
      buildClassificationPrompt(title, description),
      "classification",
      MAX_TRANSIENT_ATTEMPTS,
    );
  } catch (err) {
    return null;
  }

  const firstResult = parseClassificationResponse(raw);
  if (firstResult.success) {
    logValidation("classification", raw, firstResult);
    return firstResult.data;
  }
  logValidation("classification", raw, firstResult);

  // Defense-in-depth retry: the prompt's instructions weren't followed, so
  // ask again with a stricter, JSON-only prompt.
  let strictRaw: string;
  try {
    strictRaw = await generateWithBackoff(
      provider,
      buildClassificationPrompt(title, description, { strict: true }),
      "classification-strict-retry",
      MAX_TRANSIENT_ATTEMPTS,
    );
  } catch (err) {
    return null;
  }

  const strictResult = parseClassificationResponse(strictRaw);
  logValidation("classification-strict-retry", strictRaw, strictResult);

  return strictResult.success ? strictResult.data : null;
}

function logValidation(
  promptLabel: string,
  raw: string,
  result: ReturnType<typeof parseClassificationResponse>,
): void {
  logAICall({
    provider: getAIProvider().name,
    attempt: 0,
    prompt: `${promptLabel}:validation`,
    rawResponse: raw,
    valid: result.success,
    validationError: result.success ? undefined : result.error,
    latencyMs: 0,
  });
}
