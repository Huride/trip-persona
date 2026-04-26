import { describe, expect, it } from "vitest";
import type { TravelPersona, TripSurvey } from "../src/lib/types";
import { rankDestinations } from "../src/lib/scoring";

const persona: TravelPersona = {
  title: "Slow coastal cafe traveler",
  summary: "Likes calm coastal places and cafes.",
  tasteTags: ["coastal", "cafes", "slow", "photo"],
  pace: "slow",
  crowdTolerance: "low",
  confidenceNotes: ["sample profile"]
};

const survey: TripSurvey = {
  instagramUrl: "https://www.instagram.com/sample",
  travelWindow: "spring",
  tripLength: "1n2d",
  destinationPreference: "recommend",
  budget: "medium",
  companions: "partner",
  pace: "slow",
  walkingLimit: "under-10k",
  include: ["카페", "사진", "바다"],
  avoid: ["혼잡"]
};

describe("rankDestinations", () => {
  it("returns three ranked destinations", () => {
    const result = rankDestinations(persona, survey);
    expect(result).toHaveLength(3);
    expect(result[0].fitScore).toBeGreaterThanOrEqual(result[1].fitScore);
  });

  it("respects explicit destination preference", () => {
    const result = rankDestinations(persona, { ...survey, destinationPreference: "jeju" });
    expect(result[0].destinationId).toBe("jeju");
  });
});
