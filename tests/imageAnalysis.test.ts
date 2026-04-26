import { describe, expect, it } from "vitest";
import { buildImageAnalysisText } from "../src/lib/imageAnalysis";

describe("buildImageAnalysisText", () => {
  it("turns vision image signals into profile text for persona generation", () => {
    const text = buildImageAnalysisText([
      {
        url: "https://kpopping.com/documents/example.jpeg",
        alt: "feed image",
        source: "Instagram public mirror",
        tags: ["social-gathering"],
        visualDescription: "친구들과 트렌디한 실내 공간에서 사진을 남기는 장면입니다.",
        visualTags: ["photo-worthy"],
        visualMood: ["playful"],
        visualPlace: ["studio"],
        visualActivities: ["social-gathering"],
        analysisSource: "vision",
        analysisConfidence: 0.9
      }
    ]);

    expect(text).toContain("Gemini vision analysis");
    expect(text).toContain("친구들과 트렌디한 실내 공간");
    expect(text).toContain("photo-worthy");
    expect(text).toContain("social-gathering");
  });
});
