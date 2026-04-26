import { describe, expect, it } from "vitest";
import { analyzeSampleProfile } from "../src/lib/mockAnalysis";

describe("analyzeSampleProfile", () => {
  it("returns a travel persona from a sample profile", () => {
    const result = analyzeSampleProfile("cafe-gallery");
    expect(result.title).toContain("Urban");
    expect(result.tasteTags).toContain("cafes");
  });

  it("falls back to cafe-gallery for unknown samples", () => {
    const result = analyzeSampleProfile("unknown");
    expect(result.tasteTags.length).toBeGreaterThan(0);
  });
});
