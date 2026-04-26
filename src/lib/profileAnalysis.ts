import type { InstagramProfileContent } from "./instagram";
import type { TravelPersona } from "./types";

type PersonaTemplate = TravelPersona & { keywords: string[] };

const templates: PersonaTemplate[] = [
  {
    title: "Visual Destination Collector",
    summary: "멋진 여행지와 사진이 잘 나오는 장면을 모아보는 여행자입니다.",
    tasteTags: ["photo", "nature", "coastal", "city", "travel"],
    pace: "balanced",
    crowdTolerance: "medium",
    confidenceNotes: ["keyword analysis: travel-destination"],
    keywords: ["travel", "trip", "destination", "destinations", "wanderlust", "journey", "explore", "hotel", "resort", "여행"]
  },
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

export function buildProfileEvidence(persona: TravelPersona, username: string, source: InstagramProfileContent["source"]): string[] {
  const tagLabels = persona.tasteTags.map(labelTasteTag).filter(Boolean);
  const uniqueLabels = [...new Set(tagLabels)];
  const sourceLabel = source === "live" ? "실제 공개 프로필" : "접근 제한으로 보정한 프로필 샘플";
  const paceLabel = persona.pace === "packed" ? "짧은 시간에 여러 장면을 담는 고밀도 여행" : persona.pace === "slow" ? "한 장소를 오래 즐기는 여유형 여행" : "대표 코스와 여유를 섞는 균형형 여행";
  const crowdLabel = persona.crowdTolerance === "low" ? "혼잡한 장소는 피하는 쪽" : persona.crowdTolerance === "high" ? "활기 있는 장소도 무리 없는 쪽" : "혼잡도는 중간 수준까지 허용";

  return [
    `${username}의 ${sourceLabel}에서 ${uniqueLabels.slice(0, 4).join(", ")} 신호가 두드러졌어요.`,
    `일정은 ${paceLabel}으로 잡는 편이 어울립니다.`,
    `${crowdLabel}이라 시간대와 Plan B를 함께 제안합니다.`
  ];
}

function labelTasteTag(tag: string): string {
  const labels: Record<string, string> = {
    food: "미식",
    "local-food": "로컬 미식",
    city: "도시 산책",
    urban: "도시 감도",
    night: "야간 무드",
    packed: "고밀도 일정",
    coastal: "바다",
    ocean: "오션뷰",
    beach: "해변",
    slow: "느린 여행",
    rest: "휴식",
    photo: "사진",
    design: "디자인",
    gallery: "전시",
    cafes: "카페",
    shopping: "쇼핑",
    quiet: "조용한 동네",
    local: "로컬",
    walk: "산책",
    retro: "레트로"
  };

  return labels[tag] ?? tag;
}
