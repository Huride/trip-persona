import { afterEach, describe, expect, it } from "vitest";
import { getGeminiApiKeys } from "../src/lib/gemini";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getGeminiApiKeys", () => {
  it("reads numbered Gemini fallback keys in numeric order", () => {
    process.env.GEMINI_API_KEY = "main";
    process.env.GEMINI_API_KEY_8 = "late";
    process.env.GEMINI_API_KEY_2 = "second";
    process.env.GEMINI_API_KEY_9 = "main";

    expect(getGeminiApiKeys()).toEqual(["main", "second", "late"]);
  });
});
