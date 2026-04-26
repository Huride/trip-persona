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
  const desiredTags = new Set<string>([
    ...persona.tasteTags,
    survey.pace,
    ...survey.include.flatMap((item) => surveyKeywordMap[item] ?? [])
  ]);

  const ranked = destinations.map((destination) => {
    const matches = destination.personalityTags.filter((tag) => desiredTags.has(tag));
    const explicitBoost = explicit === destination.id ? 100 : 0;
    const travelScore = scoreTravelCondition(destination, survey);
    const fitScore = Math.max(0, Math.min(100, explicitBoost + 44 + matches.length * 9 + travelScore));
    const reason = matches.length
      ? `${matches.join(", ")} 취향 신호와 잘 맞고, ${describeTravelFit(destination, survey)}`
      : `명시 조건과 기본 여행 성향을 기준으로 무난하며, ${describeTravelFit(destination, survey)}`;
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
