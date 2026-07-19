import { classifyTicket } from "./classifyTicket";
import { setAIProviderForTesting } from "./providerFactory";
import { AIProviderError } from "./errors";
import type { AIProvider } from "./types";

const VALID_RESPONSE = JSON.stringify({
  category: "BUG",
  priority: "HIGH",
  confidence: 0.85,
  draftResponse: "Thanks for reporting this, we're looking into it.",
});

function fakeProvider(generate: jest.Mock): AIProvider {
  return { name: "fake", generate };
}

describe("classifyTicket", () => {
  it("returns the parsed classification when the provider responds with valid JSON", async () => {
    const generate = jest.fn().mockResolvedValue(VALID_RESPONSE);
    setAIProviderForTesting(fakeProvider(generate));

    const result = await classifyTicket("Login broken", "Can't log in on Safari");

    expect(result).toEqual({
      category: "BUG",
      priority: "HIGH",
      confidence: 0.85,
      draftResponse: "Thanks for reporting this, we're looking into it.",
    });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("retries once with a strict prompt when the first response fails schema validation, and succeeds", async () => {
    const generate = jest
      .fn()
      .mockResolvedValueOnce("here is your answer: " + VALID_RESPONSE) // not valid JSON
      .mockResolvedValueOnce(VALID_RESPONSE); // strict retry succeeds
    setAIProviderForTesting(fakeProvider(generate));

    const result = await classifyTicket("Login broken", "Can't log in on Safari");

    expect(result).not.toBeNull();
    expect(generate).toHaveBeenCalledTimes(2);
    // second call must be the stricter, JSON-only prompt
    const secondPrompt = generate.mock.calls[1][0] as string;
    expect(secondPrompt).toMatch(/ONLY valid JSON/);
  });

  it("returns null when both the normal and strict-retry responses fail validation", async () => {
    const generate = jest.fn().mockResolvedValue("not json at all");
    setAIProviderForTesting(fakeProvider(generate));

    const result = await classifyTicket("Login broken", "Can't log in on Safari");

    expect(result).toBeNull();
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("retries a retryable error (RATE_LIMITED) with backoff and eventually succeeds", async () => {
    const generate = jest
      .fn()
      .mockRejectedValueOnce(new AIProviderError("RATE_LIMITED", "slow down"))
      .mockResolvedValueOnce(VALID_RESPONSE);
    setAIProviderForTesting(fakeProvider(generate));

    const result = await classifyTicket("Login broken", "Can't log in on Safari");

    expect(result).not.toBeNull();
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-retryable error (INVALID_REQUEST) and returns null immediately", async () => {
    const generate = jest.fn().mockRejectedValue(new AIProviderError("INVALID_REQUEST", "bad request"));
    setAIProviderForTesting(fakeProvider(generate));

    const result = await classifyTicket("Login broken", "Can't log in on Safari");

    expect(result).toBeNull();
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("gives up and returns null after exhausting retries on a persistent SERVER_ERROR", async () => {
    const generate = jest.fn().mockRejectedValue(new AIProviderError("SERVER_ERROR", "down"));
    setAIProviderForTesting(fakeProvider(generate));

    const result = await classifyTicket("Login broken", "Can't log in on Safari");

    expect(result).toBeNull();
    // Transport failure exhausts all 3 backoff attempts for the normal prompt;
    // the strict-prompt retry is reserved for schema-validation failures, not
    // transport errors, so it's never attempted here.
    expect(generate).toHaveBeenCalledTimes(3);
  });
});
