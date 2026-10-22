/** A provider is anything that can turn a prompt into raw text. Classification
 * logic, retry, and validation live above this interface so swapping Gemini
 * for OpenAI/Claude later only means adding a new class here. */
export interface AIProvider {
  readonly name: string;
  generate(prompt: string): Promise<string>;
}
