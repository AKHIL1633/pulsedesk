import type { AIProvider } from "./types";
import { GeminiProvider } from "./providers/geminiProvider";

let cachedProvider: AIProvider | undefined;

/**
 * Factory for the active AI provider, selected via AI_PROVIDER env var.
 * Mirrors the provider-factory pattern used elsewhere so a new provider
 * (OpenAI, Claude) only requires adding a case here — callers never
 * reference a concrete provider class.
 */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();

  switch (providerName) {
    case "gemini":
      cachedProvider = new GeminiProvider(
        process.env.GEMINI_API_KEY ?? "",
        process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
      );
      return cachedProvider;
    default:
      throw new Error(`Unknown AI_PROVIDER "${providerName}"`);
  }
}

/** Test-only escape hatch to inject a fake provider without env juggling. */
export function setAIProviderForTesting(provider: AIProvider): void {
  cachedProvider = provider;
}
