/**
 * Structured logging for every AI call — prompt, raw response, validation
 * result, and latency. This log is the source material for the README's
 * "Prompt Design" section and the main debugging aid when the model drifts
 * off-schema in production.
 */
export interface AICallLogEntry {
  provider: string;
  attempt: number;
  prompt: string;
  rawResponse: string | null;
  valid: boolean;
  validationError?: string;
  latencyMs: number;
  errorCode?: string;
}

export function logAICall(entry: AICallLogEntry): void {
  console.log(
    JSON.stringify({
      event: "ai_call",
      timestamp: new Date().toISOString(),
      ...entry,
    }),
  );
}
