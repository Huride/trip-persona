import { describe, expect, it } from "vitest";
import { analyzeProfileText, buildProfileEvidence, selectFallbackSampleId } from "../src/lib/profileAnalysis";

describe("analyzeProfileText", () => {
  it("detects food and night market profiles without using cafe-gallery fallback", () => {
    const result = analyzeProfileText("night market street food local restaurant izakaya", "foodie");
    expect(result.title).toContain("미식");
    expect(result.tasteTags).toContain("food");
    expect(result.pace).toBe("packed");
  });

  it("detects resort and ocean profiles", () => {
    const result = analyzeProfileText("ocean beach island resort snorkeling sunset", "beach");
    expect(result.title).toContain("바다");
    expect(result.tasteTags).toContain("ocean");
  });

  it("maps sparse cafe feed signals to local cafe taste instead of ocean", () => {
    const result = analyzeProfileText("Photo by Johan in 앤트러사이트 서교점.", "hsyang.johan");

    expect(result.title).toContain("카페");
    expect(result.tasteTags).toContain("specialty-coffee");
    expect(result.tasteTags).toContain("local-neighborhood");
    expect(result.tasteTags).not.toContain("ocean");
  });

  it("maps public mirror collaboration feeds to social trend taste instead of food fallback", () => {
    const result = analyzeProfileText("chuucandoit Instagram Update with NMIXX BAE Jiwoo Billlie Tsuki WOOAH Nana", "chuucandoit");

    expect(result.title).toContain("소셜");
    expect(result.tasteTags).toContain("social-gathering");
    expect(result.tasteTags).toContain("trendy-spots");
    expect(result.tasteTags).not.toContain("food");
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

  it("keeps deterministic fallback ids mapped to the right persona templates", () => {
    expect(analyzeProfileText("unreadable profile text", "aa").tasteTags).toContain("food");
    expect(analyzeProfileText("unreadable profile text", "ac").tasteTags).toContain("ocean");
  });
});

describe("buildProfileEvidence", () => {
  it("turns persona tags into readable Instagram analysis notes", () => {
    const persona = analyzeProfileText("night market street food local restaurant izakaya", "foodie");
    const evidence = buildProfileEvidence(persona, "foodie", "live");

    expect(evidence.join(" ")).toContain("@Foodie");
    expect(evidence.join(" ")).toContain("미식");
  });

  it("localizes Gemini-generated taste tag slugs in evidence", () => {
    const evidence = buildProfileEvidence(
      {
        title: "감성적인 공간과 커피를 즐기는 도심 산책가",
        summary: "조용한 로컬 카페와 감각적인 공간을 선호합니다.",
        tasteTags: ["specialty-coffee", "minimalist-aesthetic", "local-neighborhood", "urban-exploration"],
        pace: "slow",
        crowdTolerance: "low",
        confidenceNotes: []
      },
      "hsyang.johan",
      "live"
    );

    expect(evidence.join(" ")).toContain("스페셜티 커피");
    expect(evidence.join(" ")).toContain("미니멀한 미감");
    expect(evidence.join(" ")).not.toContain("specialty-coffee");
  });
});
