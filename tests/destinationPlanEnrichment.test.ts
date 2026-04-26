import { describe, expect, it } from "vitest";
import { applyDestinationPlanEnrichment } from "../src/lib/destinationPlanEnrichment";
import type { DestinationPlan } from "../src/lib/types";

const basePlan: DestinationPlan = {
  destination: {
    destinationId: "osaka",
    destinationName: "오사카",
    fitScore: 91,
    reason: "도시 미식 취향이 잘 맞습니다.",
    tradeOff: "혼잡한 시간대를 피하는 편이 좋습니다."
  },
  photo: {
    url: "https://example.com/osaka.jpg",
    alt: "오사카",
    credit: "example"
  },
  weather: {
    title: "8월 오사카 날씨",
    seasonType: "summer",
    summary: "더위에 대비하세요.",
    preparation: ["선크림"],
    cautions: ["한낮 도보 주의"]
  },
  transport: [{ name: "간사이공항 이동", summary: "난바 중심 이동", why: "동선이 편합니다." }],
  stays: [{ name: "난바 호텔", summary: "밤 일정 접근성", why: "복귀가 쉽습니다." }],
  activities: [{ name: "도톤보리 푸드 워크", summary: "거리 미식", why: "취향과 맞습니다." }],
  restaurants: [{ name: "난바 미식 산책", summary: "타코야키", why: "오사카 미식입니다." }],
  photoSpots: [{ name: "도톤보리", summary: "네온", why: "사진 포인트입니다." }],
  itinerary: [],
  dailyItinerary: [
    {
      day: 1,
      title: "도착과 첫 취향 체크",
      items: [
        {
          time: "11:00",
          placeName: "난바",
          area: "난바",
          activity: "숙소 체크인 후 주변 탐색",
          fitRationale: "이동 피로를 줄입니다.",
          cost: "medium",
          walkingLoad: "low",
          planB: "카페로 대체",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%EB%82%9C%EB%B0%94"
        }
      ]
    }
  ]
};

describe("applyDestinationPlanEnrichment", () => {
  it("keeps the curated destination set and enriches copy from LLM payload", () => {
    const [plan] = applyDestinationPlanEnrichment([basePlan], {
      plans: [
        {
          destinationId: "osaka",
          reason: "피드의 활기 있는 도시 장면과 미식 신호가 오사카의 난바/호리에 동선과 잘 맞습니다.",
          tradeOff: "8월 더위가 강하므로 한낮에는 실내 쇼핑과 카페 시간을 넣는 편이 좋습니다.",
          weather: {
            summary: "8월 오사카는 덥고 습해 실내 대안을 함께 두는 편이 좋습니다.",
            preparation: ["선크림", "휴대용 물병"],
            cautions: ["한낮 도보를 줄이세요."]
          },
          dailyItinerary: [
            {
              day: 1,
              title: "난바에서 시작하는 미식과 네온",
              items: [
                {
                  placeName: "난바",
                  activity: "숙소 체크인 후 도보권 카페에서 쉬고 저녁 미식 동선을 확인합니다.",
                  fitRationale: "짧은 시간에 여러 장면을 담는 취향과 맞습니다.",
                  planB: "더우면 난바파크스나 지하상가로 이동하세요."
                }
              ]
            }
          ]
        }
      ]
    });

    expect(plan.destination.destinationId).toBe("osaka");
    expect(plan.destination.reason).toContain("난바/호리에");
    expect(plan.weather.preparation).toContain("휴대용 물병");
    expect(plan.dailyItinerary[0].title).toBe("난바에서 시작하는 미식과 네온");
    expect(plan.dailyItinerary[0].items[0]).toEqual(
      expect.objectContaining({
        time: "11:00",
        placeName: "난바",
        mapUrl: expect.stringContaining("google.com/maps/search"),
        activity: expect.stringContaining("체크인")
      })
    );
  });

  it("ignores unknown destinations and unknown itinerary places", () => {
    const [plan] = applyDestinationPlanEnrichment([basePlan], {
      plans: [
        {
          destinationId: "paris",
          reason: "다른 도시",
          dailyItinerary: []
        },
        {
          destinationId: "osaka",
          dailyItinerary: [
            {
              day: 1,
              title: "유효하지 않은 장소",
              items: [{ placeName: "없는 장소", activity: "새 장소 생성", fitRationale: "생성", planB: "생성" }]
            }
          ]
        }
      ]
    });

    expect(plan.destination.reason).toBe(basePlan.destination.reason);
    expect(plan.dailyItinerary[0].title).toBe(basePlan.dailyItinerary[0].title);
    expect(plan.dailyItinerary[0].items[0].placeName).toBe("난바");
  });
});
