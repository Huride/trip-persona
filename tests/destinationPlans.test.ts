import { describe, expect, it } from "vitest";
import { buildDestinationPlans } from "../src/lib/destinationPlans";
import type { DestinationRecommendation, TripSurvey } from "../src/lib/types";

const survey: TripSurvey = {
  instagramUrl: "sample:ocean-nature",
  travelWindow: "5월",
  tripLength: "3n4d",
  destinationPreference: "recommend",
  regionPreference: "anywhere",
  travelRange: "short-flight",
  budget: "300k-700k",
  companions: "partner",
  pace: "slow",
  walkingLimit: "under-5k",
  include: ["바다", "휴식"],
  avoid: ["혼잡"]
};

const recommendations: DestinationRecommendation[] = [
  {
    destinationId: "jeju",
    destinationName: "제주",
    fitScore: 92,
    reason: "바다와 휴식 취향이 잘 맞습니다.",
    tradeOff: "렌터카 이동이 필요할 수 있습니다."
  },
  {
    destinationId: "namhae",
    destinationName: "남해",
    fitScore: 86,
    reason: "조용한 바다 취향이 잘 맞습니다.",
    tradeOff: "대중교통 이동은 제한적입니다."
  }
];

describe("buildDestinationPlans", () => {
  it("creates one rich plan for each recommended destination", () => {
    const plans = buildDestinationPlans(recommendations, survey);

    expect(plans).toHaveLength(2);
    expect(plans[0].destination.destinationId).toBe("jeju");
    expect(plans[0].photo.url).toContain("images.unsplash.com");
    expect(plans[0].transport.length).toBeGreaterThan(0);
    expect(plans[0].stays.length).toBeGreaterThan(0);
    expect(plans[0].restaurants.length).toBeGreaterThan(0);
    expect(plans[0].itinerary.length).toBeGreaterThan(0);
    expect(plans[0].dailyItinerary).toHaveLength(4);
    expect(plans[0].dailyItinerary[0].items.length).toBeGreaterThanOrEqual(3);
  });

  it("keeps fallback itinerary shape compatible with the result UI", () => {
    const [plan] = buildDestinationPlans(recommendations, survey);

    expect(plan.itinerary[0]).toEqual(
      expect.objectContaining({
        time: expect.any(String),
        placeName: expect.any(String),
        activity: expect.any(String),
        planB: expect.any(String)
      })
    );
  });
});
