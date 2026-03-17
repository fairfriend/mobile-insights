/**
 * Google Gemini AI client — lazy initialization.
 * All AI routes import from here.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

// gemini-2.5-flash is the current stable high-performance model
export const AI_MODEL = "gemini-2.5-flash";

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY environment variable is not set");
    _client = new GoogleGenerativeAI(key);
  }
  return _client;
}

/**
 * Get the generative model instance (lazy — safe to import at build time).
 */
export function getModel() {
  return getClient().getGenerativeModel({
    model: AI_MODEL,
    generationConfig: {
      temperature: 0.7,
    },
  });
}

/**
 * Parse JSON safely from an AI response.
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
 * Check if Gemini is configured (used in health checks).
 */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
