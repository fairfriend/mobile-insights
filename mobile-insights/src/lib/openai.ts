/**
 * OpenAI client singleton with shared config.
 * All AI routes import from here.
 */
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 60_000, // 60s timeout for long generations
});

export const AI_MODEL = "gpt-4o-mini";

/**
 * Parse JSON safely from an AI response.
 * Falls back to empty object if the response is malformed.
 */
export function safeParseJson(text: string | null | undefined): Record<string, unknown> {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    // Strip markdown code fences if present
    const stripped = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    try {
      return JSON.parse(stripped);
    } catch {
      return {};
    }
  }
}

/**
 * Check if OpenAI is configured (used in health checks).
 */
export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
