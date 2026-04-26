import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDestinationPlans } from "@/src/lib/destinationPlans";
import { places } from "@/src/lib/destinations";
import { generateJson } from "@/src/lib/gemini";
import { analyzeInstagramProfile } from "@/src/lib/profilePipeline";
import { buildConceptPrompt, buildItineraryPrompt } from "@/src/lib/prompts";
import { parseItineraryPayload, parseTravelConcepts } from "@/src/lib/resultValidation";
import { rankDestinations } from "@/src/lib/scoring";
import type { ProfileAnalysisResult, TripSurvey } from "@/src/lib/types";

const profileAnalysisSchema = z.object({
  persona: z.object({
    title: z.string(),
    summary: z.string(),
    tasteTags: z.array(z.string()),
    pace: z.enum(["slow", "balanced", "packed"]),
    crowdTolerance: z.enum(["low", "medium", "high", "unknown"]),
    confidenceNotes: z.array(z.string())
  }),
  source: z.enum(["live", "sample", "pasted"]),
  username: z.string(),
  profileEvidence: z.array(z.string()),
  profileImages: z.array(z.object({ url: z.string(), alt: z.string(), source: z.string() })).optional()
});

const surveySchema = z.object({
  instagramUrl: z.string().min(1),
  travelWindow: z.string().min(1),
  tripLength: z.enum(["day-trip", "1n2d", "2n3d", "3n4d", "4plus"]),
  destinationPreference: z.union([
    z.enum([
      "seoul",
      "jeju",
      "busan",
      "mokpo",
      "namhae",
      "fukuoka",
      "sapporo",
      "kyoto",
      "tokyo",
      "osaka",
      "kamakura",
      "matsuyama",
      "miyakojima",
      "taipei",
      "tainan",
      "kaohsiung",
      "bangkok",
      "chiangmai",
      "danang",
      "hoian",
      "hanoi",
      "hochiminh",
      "bali",
      "cebu",
      "kualalumpur",
      "singapore",
      "hongkong",
      "macau"
    ]),
    z.literal("recommend")
  ]),
  regionPreference: z.enum(["domestic", "overseas", "anywhere"]),
  travelRange: z.enum(["nearby", "short-flight", "long-flight", "anywhere"]),
  budget: z.enum(["under-100k", "100k-300k", "300k-700k", "700k-1200k", "over-1200k"]),
  companions: z.enum(["solo", "partner", "friends", "family", "parents"]),
  pace: z.enum(["slow", "balanced", "packed"]),
  walkingLimit: z.enum(["under-5k", "under-10k", "no-limit"]),
  include: z.array(z.string()),
  avoid: z.array(z.string()),
  surveySkipped: z.boolean().optional(),
  profileAnalysis: profileAnalysisSchema.optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = surveySchema.parse(body);
  const { profileAnalysis, ...surveyInput } = parsed;
  const survey = surveyInput as TripSurvey;
  const profileResult = (profileAnalysis as ProfileAnalysisResult | undefined) ?? await analyzeInstagramProfile(survey.instagramUrl);
  const persona = profileResult.persona;

  const destinations = rankDestinations(persona, survey);
  const fallbackConcepts = [
    { name: "Best Fit", type: "best-fit" as const, summary: "취향과 조건에 가장 잘 맞는 일정입니다.", fitReason: "프로필 취향과 설문 조건을 함께 반영했습니다." },
    { name: "Unexpected Match", type: "unexpected-match" as const, summary: "취향을 살짝 확장한 의외의 선택입니다.", fitReason: "기존 취향과 연결되는 새로운 분위기를 제안합니다." },
    { name: "Low-Risk Plan", type: "low-risk" as const, summary: "동선과 비용 리스크를 줄인 안정적인 일정입니다.", fitReason: "피로도와 예산을 우선했습니다." }
  ];
  const concepts = parseTravelConcepts(
    await generateJson<unknown>(buildConceptPrompt(persona, survey, destinations), fallbackConcepts),
    fallbackConcepts
  );

  const selectedDestinationId = destinations[0].destinationId;
  const seedPlaces = places.filter((place) => place.destinationId === selectedDestinationId);
  const destinationPlans = buildDestinationPlans(destinations, survey);
  const fallbackItineraryPayload = {
    itinerary: seedPlaces.slice(0, 3).map((place, index) => ({
      time: ["10:00", "13:00", "16:00"][index] ?? "18:00",
      placeName: place.name,
      activity: place.description,
      fitRationale: `${place.vibeTags.join(", ")} 취향과 맞습니다.`,
      cost: place.estimatedCost,
      walkingLoad: place.walkingLoad,
      planB: "혼잡하거나 날씨가 좋지 않으면 가까운 카페/실내 장소로 대체하세요."
    })),
    whyThisFits: ["인스타그램 취향 신호와 설문 조건을 함께 반영했습니다."],
    excludedPlaces: ["조건과 맞지 않는 과도한 이동 장소는 제외했습니다."]
  };
  const itineraryPayload = parseItineraryPayload(
    await generateJson<unknown>(
      buildItineraryPrompt({ persona, survey, destination: destinations[0], concept: concepts[0], seedPlaces }),
      fallbackItineraryPayload
    ),
    fallbackItineraryPayload
  );

  return NextResponse.json({
    persona,
    destinations,
    concepts,
    itinerary: itineraryPayload.itinerary,
    whyThisFits: itineraryPayload.whyThisFits,
    excludedPlaces: itineraryPayload.excludedPlaces,
    destinationPlans,
    source: profileResult.source,
    profileUsername: profileResult.username,
    profileEvidence: profileResult.profileEvidence,
    profileImages: profileResult.profileImages
  });
}
