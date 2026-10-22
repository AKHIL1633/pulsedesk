import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider } from "../types";
import { classifyAIError } from "../errors";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private readonly client: GoogleGenerativeAI;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is required to construct GeminiProvider");
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generate(prompt: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      throw classifyAIError(err);
    }
  }
}
