import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3-flash-preview";

export function getGeminiApiKeys(): string[] {
  const keys = Object.entries(process.env)
    .map(([name, value]) => {
      const match = /^GEMINI_API_KEY(?:_(\d+))?$/.exec(name);
      if (!match) return null;
      return {
        order: match[1] ? Number(match[1]) : 0,
        value
      };
    })
    .filter((entry): entry is { order: number; value: string | undefined } => Boolean(entry))
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.value?.trim())
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
