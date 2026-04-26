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
    expect(plans[0].activities.length).toBeGreaterThan(0);
    expect(plans[0].restaurants.length).toBeGreaterThan(0);
    expect(plans[0].weather.summary).toContain("5월");
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
        mapUrl: expect.stringContaining("google.com/maps/search"),
        activity: expect.any(String),
        planB: expect.any(String)
      })
    );
  });

  it("does not repeat the same place within a day when a destination has few seed places", () => {
    const [plan] = buildDestinationPlans(
      [
        {
          destinationId: "osaka",
          destinationName: "오사카",
          fitScore: 94,
          reason: "미식과 도시 취향이 잘 맞습니다.",
          tradeOff: "인기 지역은 혼잡할 수 있습니다."
        }
      ],
      { ...survey, tripLength: "3n4d", include: ["맛집", "쇼핑", "사진"], pace: "packed" }
    );

    for (const day of plan.dailyItinerary) {
      const placeNames = day.items.map((item) => item.placeName);
      expect(new Set(placeNames).size).toBe(placeNames.length);
    }
  });

  it("builds more daily stops when the user asks for a packed pace", () => {
    const [plan] = buildDestinationPlans(
      [
        {
          destinationId: "tokyo",
          destinationName: "도쿄",
          fitScore: 94,
          reason: "도시 감도와 전시 취향이 잘 맞습니다.",
          tradeOff: "인기 지역은 혼잡할 수 있습니다."
        }
      ],
      { ...survey, tripLength: "2n3d", pace: "packed", include: ["전시", "쇼핑", "사진", "카페"] }
    );

    expect(plan.dailyItinerary[0].items).toHaveLength(5);
    expect(plan.dailyItinerary[0].items.map((item) => `${item.placeName} ${item.activity}`).join(" ")).toContain("전시");
  });

  it("keeps slow pace lighter than packed pace", () => {
    const [slowPlan] = buildDestinationPlans(recommendations, { ...survey, pace: "slow" });
    const [packedPlan] = buildDestinationPlans(recommendations, { ...survey, pace: "packed", include: ["전시", "쇼핑", "사진", "카페"] });

    expect(slowPlan.dailyItinerary[0].items.length).toBeLessThan(packedPlan.dailyItinerary[0].items.length);
  });

  it("adds weather preparation advice when the survey has a travel month", () => {
    const [plan] = buildDestinationPlans(
      [
        {
          destinationId: "bangkok",
          destinationName: "방콕",
          fitScore: 91,
          reason: "도시 미식과 야간 무드가 잘 맞습니다.",
          tradeOff: "더위와 소나기에 대비가 필요합니다."
        }
      ],
      { ...survey, travelWindow: "8월", travelRange: "long-flight" }
    );

    expect(plan.weather.title).toContain("8월");
    expect(plan.weather.seasonType).toBe("rainy");
    expect(plan.weather.preparation).toContain("작은 우산 또는 얇은 우비");
    expect(plan.weather.cautions.join(" ")).toContain("소나기");
  });
});
