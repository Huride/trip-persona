import { describe, expect, it } from "vitest";
import { analyzeProfileText, selectFallbackSampleId } from "../src/lib/profileAnalysis";

describe("analyzeProfileText", () => {
  it("detects food and night market profiles without using cafe-gallery fallback", () => {
    const result = analyzeProfileText("night market street food local restaurant izakaya", "foodie");
    expect(result.title).toContain("Food");
    expect(result.tasteTags).toContain("food");
    expect(result.pace).toBe("packed");
  });

  it("detects resort and ocean profiles", () => {
    const result = analyzeProfileText("ocean beach island resort snorkeling sunset", "beach");
    expect(result.title).toContain("Coastal");
    expect(result.tasteTags).toContain("ocean");
  });
});

describe("selectFallbackSampleId", () => {
  it("does not always choose cafe-gallery for unknown URLs", () => {
    const ids = [
      selectFallbackSampleId("https://www.instagram.com/food_trip"),
      selectFallbackSampleId("https://www.instagram.com/ocean_days"),
      selectFallbackSampleId("https://www.instagram.com/random_user_123")
    ];

    expect(new Set(ids).size).toBeGreaterThan(1);
  });
});
