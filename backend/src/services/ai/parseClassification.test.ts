import { parseClassificationResponse } from "./parseClassification";

const VALID = {
  category: "BUG",
  priority: "HIGH",
  confidence: 0.85,
  draftResponse: "Thanks for reporting this, we're looking into it.",
};

describe("parseClassificationResponse", () => {
  it("parses a plain valid JSON response", () => {
    const result = parseClassificationResponse(JSON.stringify(VALID));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(VALID);
    }
  });

  it("strips ```json code fences before parsing", () => {
    const fenced = "```json\n" + JSON.stringify(VALID) + "\n```";
    const result = parseClassificationResponse(fenced);
    expect(result.success).toBe(true);
  });

  it("strips plain ``` code fences (no language tag) before parsing", () => {
    const fenced = "```\n" + JSON.stringify(VALID) + "\n```";
    const result = parseClassificationResponse(fenced);
    expect(result.success).toBe(true);
  });

  it("fails when the response is not valid JSON", () => {
    const result = parseClassificationResponse("this is not json at all");
    expect(result.success).toBe(false);
  });

  it("fails when category is not one of the allowed enum values", () => {
    const result = parseClassificationResponse(
      JSON.stringify({ ...VALID, category: "NOT_A_CATEGORY" }),
    );
    expect(result.success).toBe(false);
  });

  it("fails when confidence is outside the 0-1 range", () => {
    const result = parseClassificationResponse(JSON.stringify({ ...VALID, confidence: 1.5 }));
    expect(result.success).toBe(false);
  });

  it("fails when a required field is missing", () => {
    const { draftResponse, ...withoutDraft } = VALID;
    const result = parseClassificationResponse(JSON.stringify(withoutDraft));
    expect(result.success).toBe(false);
  });
});
