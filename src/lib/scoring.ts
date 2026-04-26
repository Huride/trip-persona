import { destinations } from "./destinations";
import type { DestinationRecommendation, TravelPersona, TripSurvey } from "./types";

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

export function rankDestinations(persona: TravelPersona, survey: TripSurvey): DestinationRecommendation[] {
  const explicit = survey.destinationPreference !== "recommend" ? survey.destinationPreference : null;
  const desiredTags = new Set<string>([
    ...persona.tasteTags,
    survey.pace,
    ...survey.include.flatMap((item) => surveyKeywordMap[item] ?? [])
  ]);

  const ranked = destinations.map((destination) => {
    const matches = destination.personalityTags.filter((tag) => desiredTags.has(tag));
    const explicitBoost = explicit === destination.id ? 100 : 0;
    const fitScore = Math.min(100, explicitBoost + 50 + matches.length * 10);
    const reason = matches.length
      ? `${matches.join(", ")} 취향 신호와 잘 맞습니다.`
      : "명시 조건과 기본 여행 성향을 기준으로 무난하게 맞습니다.";
    const tradeOff = destination.personalityTags.includes("urban")
      ? "도시형 여행지는 혼잡도가 높을 수 있습니다."
      : "자연형 여행지는 이동 시간이 길어질 수 있습니다.";

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
