import { describe, expect, it } from "vitest";
import { parseItineraryPayload, parseTravelPersona } from "../src/lib/resultValidation";
import type { TravelPersona } from "../src/lib/types";

const fallbackPersona: TravelPersona = {
  title: "Fallback Persona",
  summary: "Fallback summary",
  tasteTags: ["cafes"],
  pace: "slow",
  crowdTolerance: "low",
  confidenceNotes: ["fallback"]
};

describe("result validation", () => {
  it("normalizes Gemini persona enum variants instead of dropping to fallback", () => {
    const parsed = parseTravelPersona(
      {
        title: "High-Density Urban Foodie",
        summary: "Likes food trips.",
        tasteTags: ["Food", "Urban"],
        pace: "Fast/High-Density",
        crowdTolerance: "High",
        confidenceNotes: "high confidence"
      },
      fallbackPersona
    );

    expect(parsed).toEqual(
      expect.objectContaining({
        title: "도시 미식 탐험가",
        tasteTags: ["food", "urban"],
        pace: "packed",
        crowdTolerance: "high",
        confidenceNotes: ["high confidence"]
      })
    );
    expect(parsed.summary).toContain("로컬 미식");
  });

  it("localizes English Gemini persona titles and summaries for display", () => {
    const parsed = parseTravelPersona(
      {
        title: "Energetic Trendsetter & Eco-Explorer",
        summary: "Based on the content associated with 'Chuu Can Do It,' the travel style is characterized by high-energy urban exploration, trendy aesthetic spots, and eco-friendly activities.",
        tasteTags: ["trendy-cafes", "eco-tourism", "hands-on-workshops", "instagrammable-spots"],
        pace: "Fast/High-Density",
        crowdTolerance: "High",
        confidenceNotes: []
      },
      fallbackPersona
    );

    expect(parsed.title).toBe("활기찬 트렌드 탐험가");
    expect(parsed.summary).toContain("도시 탐험");
    expect(parsed.summary).toContain("친환경");
  });

  it("falls back when itinerary payload does not match UI item shape", () => {
    const fallback = {
      itinerary: [
        {
          time: "10:00",
          placeName: "서촌 골목 산책",
          activity: "골목 산책",
          fitRationale: "cafes 취향과 맞습니다.",
          cost: "free" as const,
          walkingLoad: "medium" as const,
          planB: "실내 카페로 대체"
        }
      ],
      whyThisFits: ["취향과 맞습니다."],
      excludedPlaces: ["과도한 이동 장소"]
    };

    const parsed = parseItineraryPayload(
      {
        itinerary: [{ day: 1, activities: [{ name: "흰여울문화마을" }] }],
        whyThisFits: "string instead of array",
        excludedPlaces: []
      },
      fallback
    );

    expect(parsed).toEqual(fallback);
  });
});
