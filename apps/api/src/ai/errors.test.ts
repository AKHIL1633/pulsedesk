import { classifyAIError, AIProviderError } from "./errors";

describe("classifyAIError", () => {
  it("classifies HTTP 429 as RATE_LIMITED and retryable", () => {
    const err = classifyAIError({ status: 429, message: "Too many requests" });
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.retryable).toBe(true);
  });

  it("classifies a quota message as RATE_LIMITED even without a status code", () => {
    const err = classifyAIError(new Error("Quota exceeded for this project"));
    expect(err.code).toBe("RATE_LIMITED");
  });

  it("classifies AbortError as TIMEOUT and retryable", () => {
    const abortError = new Error("The operation was aborted");
    abortError.name = "AbortError";
    const err = classifyAIError(abortError);
    expect(err.code).toBe("TIMEOUT");
    expect(err.retryable).toBe(true);
  });

  it("classifies HTTP 500 as SERVER_ERROR and retryable", () => {
    const err = classifyAIError({ status: 503, message: "Service unavailable" });
    expect(err.code).toBe("SERVER_ERROR");
    expect(err.retryable).toBe(true);
  });

  it("classifies HTTP 400 as INVALID_REQUEST and not retryable", () => {
    const err = classifyAIError({ status: 400, message: "Bad request" });
    expect(err.code).toBe("INVALID_REQUEST");
    expect(err.retryable).toBe(false);
  });

  it("classifies an unrecognized error as UNKNOWN and not retryable", () => {
    const err = classifyAIError(new Error("something weird happened"));
    expect(err.code).toBe("UNKNOWN");
    expect(err.retryable).toBe(false);
  });

  it("passes through an existing AIProviderError unchanged", () => {
    const original = new AIProviderError("TIMEOUT", "already classified");
    expect(classifyAIError(original)).toBe(original);
  });
});
