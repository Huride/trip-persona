import { destinations } from "./destinations";
import type { Destination, DestinationId, DestinationRecommendation, TravelPersona, TravelRange, TripSurvey } from "./types";

const surveyKeywordMap: Record<string, string[]> = {
  "카페": ["cafes", "coffee"],
  "맛집": ["food", "local-food"],
  "사진": ["photo"],
  "전시": ["gallery", "art", "design"],
  "쇼핑": ["shopping"],
  "자연": ["nature", "coastal"],
  "바다": ["coastal", "ocean", "beach"],
  "로컬": ["local", "local-food"],
  "휴식": ["rest", "healing", "quiet"]
};

const domesticIds = new Set<DestinationId>(["seoul", "jeju", "busan", "mokpo", "namhae"]);

const destinationTravelRange: Record<DestinationId, Exclude<TravelRange, "anywhere">> = {
  seoul: "nearby",
  jeju: "short-flight",
  busan: "nearby",
  mokpo: "nearby",
  namhae: "nearby",
  fukuoka: "short-flight",
  sapporo: "short-flight",
  kyoto: "short-flight",
  tokyo: "short-flight",
  osaka: "short-flight",
  kamakura: "short-flight",
  matsuyama: "short-flight",
  miyakojima: "short-flight",
  taipei: "short-flight",
  tainan: "short-flight",
  kaohsiung: "short-flight",
  bangkok: "long-flight",
  chiangmai: "long-flight",
  danang: "short-flight",
  hoian: "short-flight",
  hanoi: "short-flight",
  hochiminh: "long-flight",
  bali: "long-flight",
  cebu: "long-flight",
  kualalumpur: "long-flight",
  singapore: "long-flight",
  hongkong: "short-flight",
  macau: "short-flight"
};

export function rankDestinations(persona: TravelPersona, survey: TripSurvey): DestinationRecommendation[] {
  const explicit = survey.destinationPreference !== "recommend" ? survey.destinationPreference : null;
  const surveyTags = survey.surveySkipped ? [] : [survey.pace, ...survey.include.flatMap((item) => surveyKeywordMap[item] ?? [])];
  const desiredTags = new Set(expandRecommendationTags([
    ...persona.tasteTags,
    ...surveyTags
  ]));

  const ranked = destinations.map((destination) => {
    const matches = destination.personalityTags.filter((tag) => desiredTags.has(tag));
    const explicitBoost = explicit === destination.id ? 100 : 0;
    const travelScore = survey.surveySkipped ? 0 : scoreTravelCondition(destination, survey);
    const fitScore = Math.max(0, Math.min(100, explicitBoost + 44 + matches.length * 9 + travelScore));
    const reason = buildRecommendationReason(persona, destination, matches, survey);
    const tradeOff = buildTradeOff(destination, persona);

    return {
      destinationId: destination.id,
      destinationName: destination.name,
      fitScore,
      reason,
      tradeOff
    };
  });

  return ranked.sort((a, b) => b.fitScore - a.fitScore).slice(0, 3);
}

function buildRecommendationReason(persona: TravelPersona, destination: Destination, matches: string[], survey: TripSurvey): string {
  const personaSignal = describePersonaSignal(persona);
  const destinationSignal = describeDestinationSignal(destination, matches);
  const travelFit = describeTravelFit(destination, survey);

  return `${personaSignal} ${withTopicParticle(destination.name)} ${destinationSignal}. ${travelFit}`;
}

function describePersonaSignal(persona: TravelPersona): string {
  const tags = new Set(persona.tasteTags);
  if (hasAny(tags, ["social-gathering", "social-gatherings", "social-travel", "social-oriented"])) {
    return "피드에서 함께 찍는 장면과 밝은 실내 공간이 반복돼, 혼자 조용히 쉬는 여행보다 장면을 함께 만드는 여행이 잘 맞습니다.";
  }
  if (hasAny(tags, ["photo-worthy", "photo-spots", "photography", "instagrammable"])) {
    return "이미지 분석에서 사진으로 남기기 좋은 배경과 포즈 신호가 강해, 이동 동선 안에 확실한 포토 포인트가 필요합니다.";
  }
  if (hasAny(tags, ["cafe-hopping", "specialty-coffee", "cafes"])) {
    return "카페와 실내 체류 신호가 보여, 일정 중간에 쉬어갈 수 있는 감도 있는 공간이 중요합니다.";
  }
  if (hasAny(tags, ["food", "local-food", "night-market"])) {
    return "로컬 미식과 거리 분위기 신호가 있어, 식사 자체가 여행 만족도를 크게 좌우합니다.";
  }
  if (hasAny(tags, ["coastal", "ocean", "beach", "rest"])) {
    return "바다와 휴식 장면에 반응하는 성향이라, 이동을 줄이고 머무는 시간이 확보될수록 만족도가 높습니다.";
  }
  return "프로필에서 반복된 장소, 활동, 분위기 신호를 기준으로 보면, 취향이 분명한 동네를 연결하는 일정이 잘 맞습니다.";
}

function describeDestinationSignal(destination: Destination, matches: string[]): string {
  const tags = new Set(destination.personalityTags);
  const matchedLabels = matches.map(labelTag).filter(Boolean).slice(0, 3);

  if (hasAny(tags, ["urban", "city", "dense", "design", "shopping"])) {
    return `${matchedLabels.length ? `${matchedLabels.join(", ")} 신호를 받아주면서 ` : ""}카페, 쇼핑, 사진 포인트를 짧은 동선 안에 묶기 쉬운 도시형 후보입니다`;
  }
  if (hasAny(tags, ["food", "local-food", "night-market"])) {
    return `${matchedLabels.length ? `${matchedLabels.join(", ")} 신호와 맞고 ` : ""}식사와 거리 탐색을 일정의 중심으로 두기 좋은 후보입니다`;
  }
  if (hasAny(tags, ["coastal", "ocean", "harbor", "resort"])) {
    return `${matchedLabels.length ? `${matchedLabels.join(", ")} 신호를 살리면서 ` : ""}바다 풍경과 사진, 휴식 시간을 함께 확보하기 좋은 후보입니다`;
  }
  if (hasAny(tags, ["culture", "gallery", "art", "retro", "walk"])) {
    return `${matchedLabels.length ? `${matchedLabels.join(", ")} 신호와 연결되고 ` : ""}골목, 전시, 로컬 장면을 천천히 쌓기 좋은 후보입니다`;
  }
  return `${destination.summary}라서 프로필 취향을 무리 없이 일정으로 옮기기 좋은 후보입니다`;
}

function buildTradeOff(destination: Destination, persona: TravelPersona): string {
  const tags = new Set(destination.personalityTags);
  if (hasAny(tags, ["urban", "city", "dense", "shopping", "night"])) {
    return persona.crowdTolerance === "low"
      ? "핫플과 쇼핑 동선은 혼잡할 수 있어 오전 방문, 예약 가능한 실내 공간, 근처 Plan B를 함께 잡는 편이 좋습니다."
      : "도시형 후보라 이동은 편하지만 인기 시간대에는 대기와 소음이 생길 수 있어 핵심 장소를 2-3개로 좁히는 편이 좋습니다.";
  }
  if (hasAny(tags, ["coastal", "ocean", "nature", "resort", "drive"])) {
    return "날씨와 이동 수단의 영향을 크게 받으므로, 실내 카페나 전망 좋은 숙소 시간을 Plan B로 잡아두는 편이 좋습니다.";
  }
  return "동네를 깊게 보는 후보라 즉흥성이 장점이지만, 영업시간과 휴무일 체크가 만족도를 좌우합니다.";
}

function labelTag(tag: string): string {
  const labels: Record<string, string> = {
    urban: "도시 감도",
    city: "도시 탐색",
    dense: "촘촘한 동선",
    design: "디자인 공간",
    shopping: "쇼핑",
    photo: "사진",
    cafes: "카페",
    food: "미식",
    "local-food": "로컬 미식",
    night: "야간 무드",
    coastal: "바다",
    ocean: "오션뷰",
    walk: "산책",
    gallery: "전시",
    art: "예술",
    local: "로컬",
    quiet: "조용한 동네",
    retro: "레트로",
    energy: "활기"
  };
  return labels[tag] ?? "";
}

function withTopicParticle(value: string): string {
  const last = value.charCodeAt(value.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return `${value}는`;
  return (last - 0xac00) % 28 === 0 ? `${value}는` : `${value}은`;
}

function hasAny(tags: Set<string>, candidates: string[]): boolean {
  return candidates.some((tag) => tags.has(tag));
}

function expandRecommendationTags(tags: string[]): string[] {
  const aliases: Record<string, string[]> = {
    "social-gathering": ["social-gathering", "social-gatherings", "energy", "city", "urban", "photo"],
    "social-gatherings": ["social-gatherings", "social-gathering", "energy", "city", "urban", "photo"],
    "social-travel": ["social-travel", "energy", "city", "shopping", "photo"],
    "social-oriented": ["social-oriented", "energy", "city", "urban", "photo"],
    "trendy-spots": ["trendy-spots", "trendy", "urban", "design", "shopping", "photo"],
    "photo-worthy": ["photo-worthy", "photo", "design", "urban"],
    "photo-spots": ["photo-spots", "photo", "design", "urban"],
    instagrammable: ["instagrammable", "photo", "trendy", "design"],
    photography: ["photography", "photo", "design"],
    "active-lifestyle": ["active-lifestyle", "energy", "city", "dense"],
    "active-experience": ["active-experience", "energy", "city", "dense"],
    "activity-focused": ["activity-focused", "energy", "city", "dense"],
    nightlife: ["nightlife", "night", "energy", "city"],
    "city-tour": ["city-tour", "city", "urban", "walk"]
  };

  return tags.flatMap((tag) => aliases[tag] ?? [tag]);
}

function scoreTravelCondition(destination: Destination, survey: TripSurvey): number {
  const isDomestic = domesticIds.has(destination.id);
  let score = 0;

  if (survey.regionPreference === "domestic") score += isDomestic ? 26 : -34;
  if (survey.regionPreference === "overseas") score += isDomestic ? -28 : 18;
  if (survey.regionPreference === "anywhere") score += 4;

  const destinationRange = destinationTravelRange[destination.id];
  if (survey.travelRange === "nearby") {
    score += destinationRange === "nearby" ? 20 : -24;
  } else if (survey.travelRange === "short-flight") {
    score += destinationRange === "short-flight" ? 15 : destinationRange === "nearby" ? 6 : -16;
  } else if (survey.travelRange === "long-flight") {
    score += destinationRange === "long-flight" ? 12 : destinationRange === "short-flight" ? 6 : 0;
  } else {
    score += 4;
  }

  return score;
}

function describeTravelFit(destination: Destination, survey: TripSurvey): string {
  if (survey.surveySkipped) return "설문을 건너뛰어 인스타 취향 분석을 우선 반영했습니다.";

  const isDomestic = domesticIds.has(destination.id);
  const regionLabel = isDomestic ? "국내 이동 조건" : "해외 이동 조건";
  const range = destinationTravelRange[destination.id];

  if (survey.travelRange === "nearby" && range !== "nearby") return `${regionLabel}보다 이동 부담이 조금 큽니다.`;
  if (survey.regionPreference === "domestic" && !isDomestic) return "국내 선호 조건과는 거리가 있어 의외의 후보입니다.";
  if (survey.regionPreference === "overseas" && isDomestic) return "해외 선호 조건과는 다르지만 취향 신호가 강합니다.";
  if (range === "nearby") return "기차나 차 중심의 짧은 이동으로 접근 가능합니다.";
  if (range === "short-flight") return "짧은 비행권 여행 조건에 잘 맞습니다.";
  return "장거리 이동을 감수할 때 만족도가 높은 후보입니다.";
}
