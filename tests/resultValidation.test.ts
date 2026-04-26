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

    expect(parsed).toEqual({
      title: "High-Density Urban Foodie",
      summary: "Likes food trips.",
      tasteTags: ["food", "urban"],
      pace: "packed",
      crowdTolerance: "high",
      confidenceNotes: ["high confidence"]
    });
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
