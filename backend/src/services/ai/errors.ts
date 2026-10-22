export type AIErrorCode =
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "SERVER_ERROR"
  | "INVALID_REQUEST"
  | "UNKNOWN";

export class AIProviderError extends Error {
  readonly code: AIErrorCode;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(code: AIErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
    this.retryable = code === "RATE_LIMITED" || code === "TIMEOUT" || code === "SERVER_ERROR";
    this.cause = cause;
  }
}

/**
 * Maps a raw error thrown by an AI SDK call (Gemini today, others later) into
 * a stable AIErrorCode. Providers are inconsistent about shape, so this reads
 * HTTP status codes, error names, and message substrings defensively.
 */
export function classifyAIError(err: unknown): AIProviderError {
  if (err instanceof AIProviderError) return err;

  const status = extractStatus(err);
  const message = err instanceof Error ? err.message : String(err);
  const lowerMessage = message.toLowerCase();

  if (status === 429 || lowerMessage.includes("rate limit") || lowerMessage.includes("quota")) {
    return new AIProviderError("RATE_LIMITED", message, err);
  }

  if (
    (err instanceof Error && err.name === "AbortError") ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("timed out") ||
    status === 408
  ) {
    return new AIProviderError("TIMEOUT", message, err);
  }

  if (status !== undefined && status >= 500) {
    return new AIProviderError("SERVER_ERROR", message, err);
  }

  if (status !== undefined && status >= 400) {
    return new AIProviderError("INVALID_REQUEST", message, err);
  }

  return new AIProviderError("UNKNOWN", message, err);
}

function extractStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const candidate = err as Record<string, unknown>;
  const status = candidate.status ?? candidate.statusCode ?? candidate.code;
  return typeof status === "number" ? status : undefined;
}
