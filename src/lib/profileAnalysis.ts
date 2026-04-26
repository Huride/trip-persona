import type { TravelPersona } from "./types";

type PersonaTemplate = TravelPersona & { keywords: string[] };

const templates: PersonaTemplate[] = [
  {
    title: "Dense City Food Explorer",
    summary: "로컬 미식과 도시 에너지를 짧고 밀도 있게 즐기는 여행자입니다.",
    tasteTags: ["food", "local-food", "city", "night", "packed"],
    pace: "packed",
    crowdTolerance: "medium",
    confidenceNotes: ["keyword analysis: food-city"],
    keywords: ["food", "맛집", "restaurant", "dining", "night", "market", "izakaya", "bar", "street food", "야시장"]
  },
  {
    title: "Slow Coastal Rest Traveler",
    summary: "바다와 휴식, 낮은 이동 강도를 선호하는 여행자입니다.",
    tasteTags: ["coastal", "ocean", "slow", "rest", "photo"],
    pace: "slow",
    crowdTolerance: "low",
    confidenceNotes: ["keyword analysis: ocean-nature"],
    keywords: ["ocean", "sea", "beach", "바다", "island", "resort", "snorkeling", "sunset", "healing", "휴식"]
  },
  {
    title: "Design City Culture Seeker",
    summary: "도시의 디자인, 전시, 편집숍, 카페를 촘촘히 탐색하는 여행자입니다.",
    tasteTags: ["design", "gallery", "cafes", "shopping", "urban"],
    pace: "balanced",
    crowdTolerance: "medium",
    confidenceNotes: ["keyword analysis: design-city"],
    keywords: ["design", "gallery", "museum", "전시", "art", "bookstore", "shopping", "brand", "cafe", "coffee"]
  },
  {
    title: "Quiet Local Slow Traveler",
    summary: "유명 관광지보다 조용한 동네, 로컬 산책, 작은 식당을 선호하는 여행자입니다.",
    tasteTags: ["quiet", "local", "slow", "walk", "retro"],
    pace: "slow",
    crowdTolerance: "low",
    confidenceNotes: ["keyword analysis: quiet-local"],
    keywords: ["quiet", "local", "slow", "walk", "retro", "골목", "village", "old town", "calm"]
  }
];

export function analyzeProfileText(profileText: string, username = "instagram"): TravelPersona {
  const text = `${username} ${profileText}`.toLowerCase();
  const scored = templates.map((template) => ({
    template,
    score: template.keywords.reduce((sum, keyword) => sum + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0)
  }));

  const best = scored.sort((a, b) => b.score - a.score)[0];
  if (best.score > 0) {
    return {
      title: best.template.title,
      summary: best.template.summary,
      tasteTags: best.template.tasteTags,
      pace: best.template.pace,
      crowdTolerance: best.template.crowdTolerance,
      confidenceNotes: [...best.template.confidenceNotes, `matched keywords: ${best.score}`]
    };
  }

  const fallbackId = selectFallbackSampleId(username || profileText);
  const fallback = templates[fallbackId === "food-city" ? 0 : fallbackId === "ocean-nature" ? 1 : 2];
  return {
    title: fallback.title,
    summary: fallback.summary,
    tasteTags: fallback.tasteTags,
    pace: fallback.pace,
    crowdTolerance: fallback.crowdTolerance,
    confidenceNotes: [`distributed fallback: ${fallbackId}`]
  };
}

export function selectFallbackSampleId(input: string): "cafe-gallery" | "ocean-nature" | "food-city" {
  const normalized = input.toLowerCase();
  if (/(food|맛|restaurant|market|night|bar|izakaya)/.test(normalized)) return "food-city";
  if (/(ocean|sea|beach|바다|island|resort|sunset|healing)/.test(normalized)) return "ocean-nature";

  const hash = [...normalized].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (["cafe-gallery", "ocean-nature", "food-city"] as const)[hash % 3];
}
