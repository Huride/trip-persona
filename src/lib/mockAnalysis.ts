import { sampleProfiles } from "./sampleProfiles";
import { analyzeProfileText } from "./profileAnalysis";
import type { TravelPersona } from "./types";

export function analyzeSampleProfile(sampleId: string): TravelPersona {
  const profile = sampleProfiles.find((item) => item.id === sampleId) ?? sampleProfiles[0];
  const text = `${profile.bio} ${profile.captions.join(" ")} ${profile.hashtags.join(" ")} ${profile.imageDescriptions.join(" ")}`.toLowerCase();

  if (!sampleProfiles.some((item) => item.id === sampleId)) {
    return analyzeProfileText(sampleId, sampleId);
  }

  if (text.includes("ocean") || text.includes("바다") || text.includes("island")) {
    return {
      title: "Slow Coastal Rest Traveler",
      summary: "바다와 휴식, 낮은 이동 강도를 선호하는 여행자입니다.",
      tasteTags: ["coastal", "ocean", "slow", "rest", "photo"],
      pace: "slow",
      crowdTolerance: "low",
      confidenceNotes: ["sample profile: ocean-nature"]
    };
  }

  if (text.includes("food") || text.includes("맛집") || text.includes("night")) {
    return {
      title: "Dense City Food Explorer",
      summary: "로컬 미식과 도시 에너지를 짧고 밀도 있게 즐기는 여행자입니다.",
      tasteTags: ["food", "local-food", "city", "night", "packed"],
      pace: "packed",
      crowdTolerance: "medium",
      confidenceNotes: ["sample profile: food-city"]
    };
  }

  return {
    title: "Slow Urban Cafe Gallery Traveler",
    summary: "조용한 골목, 카페, 전시를 선호하는 도시형 여행자입니다.",
    tasteTags: ["cafes", "gallery", "slow", "urban", "design"],
    pace: "slow",
    crowdTolerance: "low",
    confidenceNotes: ["sample profile: cafe-gallery"]
  };
}
