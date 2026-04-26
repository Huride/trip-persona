import type { InstagramProfileContent } from "./instagram";
import type { TravelPersona } from "./types";

type PersonaTemplate = TravelPersona & { keywords: string[] };

const templates: PersonaTemplate[] = [
  {
    title: "비주얼 여행지 수집가",
    summary: "멋진 여행지와 사진이 잘 나오는 장면을 모아보는 여행자입니다.",
    tasteTags: ["photo", "nature", "coastal", "city", "travel"],
    pace: "balanced",
    crowdTolerance: "medium",
    confidenceNotes: ["keyword analysis: travel-destination"],
    keywords: ["travel", "trip", "destination", "destinations", "wanderlust", "journey", "explore", "hotel", "resort", "여행"]
  },
  {
    title: "도시 미식 탐험가",
    summary: "로컬 미식과 도시 에너지를 짧고 밀도 있게 즐기는 여행자입니다.",
    tasteTags: ["food", "local-food", "city", "night", "packed"],
    pace: "packed",
    crowdTolerance: "medium",
    confidenceNotes: ["keyword analysis: food-city"],
    keywords: ["food", "맛집", "restaurant", "dining", "night", "market", "izakaya", "bar", "street food", "야시장"]
  },
  {
    title: "바다 휴식 여행자",
    summary: "바다와 휴식, 낮은 이동 강도를 선호하는 여행자입니다.",
    tasteTags: ["coastal", "ocean", "slow", "rest", "photo"],
    pace: "slow",
    crowdTolerance: "low",
    confidenceNotes: ["keyword analysis: ocean-nature"],
    keywords: ["ocean", "sea", "beach", "바다", "island", "resort", "snorkeling", "sunset", "healing", "휴식"]
  },
  {
    title: "감성적인 로컬 카페 산책가",
    summary: "조용한 동네의 카페와 미니멀한 공간을 오래 머무르며 즐기는 여행자입니다.",
    tasteTags: ["specialty-coffee", "minimalist-aesthetic", "local-neighborhood", "cafe-hopping", "urban-exploration"],
    pace: "slow",
    crowdTolerance: "low",
    confidenceNotes: ["keyword analysis: cafe-local"],
    keywords: ["cafe", "coffee", "카페", "커피", "앤트러사이트", "서교점", "당산동", "minimal", "sketch", "drawing", "조용"]
  },
  {
    title: "감도 높은 문화 탐색가",
    summary: "도시의 디자인, 전시, 편집숍, 카페를 촘촘히 탐색하는 여행자입니다.",
    tasteTags: ["design", "gallery", "cafes", "shopping", "urban"],
    pace: "balanced",
    crowdTolerance: "medium",
    confidenceNotes: ["keyword analysis: design-city"],
    keywords: ["design", "gallery", "museum", "전시", "art", "bookstore", "shopping", "brand", "cafe", "coffee", "카페", "앤트러사이트", "서교점"]
  },
  {
    title: "조용한 로컬 산책가",
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
  const fallbackById: Record<ReturnType<typeof selectFallbackSampleId>, PersonaTemplate> = {
    "cafe-gallery": templates[3],
    "food-city": templates[1],
    "ocean-nature": templates[2]
  };
  const fallback = fallbackById[fallbackId];
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
    retro: "레트로",
    "cafe-hopping": "카페 탐방",
    minimalism: "미니멀한 공간",
    "urban-exploration": "도시 탐색",
    "quiet-places": "조용한 장소",
    "aesthetic-spaces": "감도 높은 공간",
    "hands-on-workshops": "체험형 활동",
    "instagrammable-spots": "사진 명소",
    "eco-tourism": "친환경 여행",
    "trendy-cafes": "트렌디한 카페",
    "specialty-coffee": "스페셜티 커피",
    "minimalist-aesthetic": "미니멀한 미감",
    "local-neighborhood": "로컬 동네",
    "eco-friendly": "친환경 감도",
    "sustainable-travel": "지속가능 여행",
    "trendy-spots": "트렌디한 장소",
    instagrammable: "사진 명소",
    active: "활동적인 경험",
    "pop-up-stores": "팝업 스토어",
    "aesthetic-cafes": "감성 카페",
    "social-travel": "소셜 여행",
    "interactive-experiences": "참여형 경험",
    "vibrant-energy": "밝은 에너지",
    "photo-worthy": "사진 남기기 좋은 곳",
    "collaboration-centric": "함께 즐기는 경험"
  };

  return labels[tag] ?? tag;
}
