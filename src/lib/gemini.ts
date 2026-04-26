import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3-flash-preview";

function getGeminiApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6
  ]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));

  return [...new Set(keys)];
}

export function getGeminiClient() {
  const [apiKey] = getGeminiApiKeys();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env.local");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateJson<T>(prompt: string, fallback: T): Promise<T> {
  for (const apiKey of getGeminiApiKeys()) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text;
      if (!text) continue;
      return JSON.parse(text) as T;
    } catch {
      continue;
    }
  }

  return fallback;
}
