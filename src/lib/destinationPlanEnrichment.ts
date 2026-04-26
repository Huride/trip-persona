import { z } from "zod";
import { generateJson } from "./gemini";
import type { DestinationPlan, DestinationWeatherAdvice, ProfileEvidenceImage, TravelPersona, TripSurvey } from "./types";

const enrichmentItemSchema = z.object({
  placeName: z.string(),
  activity: z.string().optional(),
  fitRationale: z.string().optional(),
  planB: z.string().optional()
});

const enrichmentDaySchema = z.object({
  day: z.number(),
  title: z.string().optional(),
  items: z.array(enrichmentItemSchema).optional()
});

const weatherSchema = z.object({
  summary: z.string().optional(),
  preparation: z.array(z.string()).optional(),
  cautions: z.array(z.string()).optional()
});

const planEnrichmentSchema = z.object({
  destinationId: z.string(),
  reason: z.string().optional(),
  tradeOff: z.string().optional(),
  weather: weatherSchema.optional(),
  transport: z.object({ summary: z.string().optional(), why: z.string().optional() }).optional(),
  stays: z.object({ summary: z.string().optional(), why: z.string().optional() }).optional(),
  activities: z.object({ summary: z.string().optional(), why: z.string().optional() }).optional(),
  restaurants: z.object({ summary: z.string().optional(), why: z.string().optional() }).optional(),
  photoSpots: z.object({ summary: z.string().optional(), why: z.string().optional() }).optional(),
  dailyItinerary: z.array(enrichmentDaySchema).optional()
});

const enrichmentPayloadSchema = z.object({
  plans: z.array(planEnrichmentSchema)
});

type DestinationPlanEnrichmentPayload = z.infer<typeof enrichmentPayloadSchema>;

interface EnrichDestinationPlansInput {
  plans: DestinationPlan[];
  persona: TravelPersona;
  survey: TripSurvey;
  profileEvidence?: string[];
  profileImages?: ProfileEvidenceImage[];
}

export async function enrichDestinationPlansWithLlm(input: EnrichDestinationPlansInput): Promise<DestinationPlan[]> {
  if (input.plans.length === 0) return input.plans;
  const fallback: DestinationPlanEnrichmentPayload = { plans: [] };
  const raw = await generateJson<unknown>(buildDestinationPlanEnrichmentPrompt(input), fallback);
  return applyDestinationPlanEnrichment(input.plans, raw);
}

export function applyDestinationPlanEnrichment(plans: DestinationPlan[], value: unknown): DestinationPlan[] {
  const parsed = enrichmentPayloadSchema.safeParse(value);
  if (!parsed.success) return plans;

  const enrichmentById = new Map(parsed.data.plans.map((plan) => [plan.destinationId, plan]));

  return plans.map((plan) => {
    const enrichment = enrichmentById.get(plan.destination.destinationId);
    if (!enrichment) return plan;

    const dailyItinerary = mergeDailyItinerary(plan, enrichment.dailyItinerary);
    const hasItineraryChange = dailyItinerary !== plan.dailyItinerary;
    const weather = mergeWeather(plan.weather, enrichment.weather);

    return {
      ...plan,
      destination: {
        ...plan.destination,
        reason: enrichment.reason ?? plan.destination.reason,
        tradeOff: enrichment.tradeOff ?? plan.destination.tradeOff
      },
      weather,
      transport: mergeFirstRecommendation(plan.transport, enrichment.transport),
      stays: mergeFirstRecommendation(plan.stays, enrichment.stays),
      activities: mergeFirstRecommendation(plan.activities, enrichment.activities),
      restaurants: mergeFirstRecommendation(plan.restaurants, enrichment.restaurants),
      photoSpots: mergeFirstRecommendation(plan.photoSpots, enrichment.photoSpots),
      dailyItinerary,
      itinerary: hasItineraryChange ? dailyItinerary.flatMap((day) => day.items) : plan.itinerary
    };
  });
}

function mergeWeather(weather: DestinationWeatherAdvice, enrichment?: { summary?: string; preparation?: string[]; cautions?: string[] }): DestinationWeatherAdvice {
  if (!enrichment) return weather;
  return {
    ...weather,
    summary: enrichment.summary ?? weather.summary,
    preparation: mergeList(weather.preparation, enrichment.preparation),
    cautions: mergeList(weather.cautions, enrichment.cautions)
  };
}

function mergeFirstRecommendation<T extends { summary: string; why: string }>(items: T[], enrichment?: { summary?: string; why?: string }): T[] {
  if (!enrichment || items.length === 0) return items;
  return items.map((item, index) => index === 0 ? { ...item, summary: enrichment.summary ?? item.summary, why: enrichment.why ?? item.why } : item);
}

function mergeDailyItinerary(plan: DestinationPlan, enrichmentDays?: Array<{ day: number; title?: string; items?: Array<{ placeName: string; activity?: string; fitRationale?: string; planB?: string }> }>): DestinationPlan["dailyItinerary"] {
  if (!enrichmentDays || enrichmentDays.length === 0) return plan.dailyItinerary;
  let changed = false;

  const merged = plan.dailyItinerary.map((day) => {
    const enrichment = enrichmentDays.find((item) => item.day === day.day);
    if (!enrichment?.items?.length) return day;

    const items = day.items.map((item) => {
      const itemEnrichment = enrichment.items?.find((candidate) => candidate.placeName === item.placeName);
      if (!itemEnrichment) return item;
      changed = true;
      return {
        ...item,
        activity: itemEnrichment.activity ?? item.activity,
        fitRationale: itemEnrichment.fitRationale ?? item.fitRationale,
        planB: itemEnrichment.planB ?? item.planB
      };
    });

    const dayChanged = items.some((item, index) => item !== day.items[index]);
    return dayChanged ? { ...day, title: enrichment.title ?? day.title, items } : day;
  });

  return changed ? merged : plan.dailyItinerary;
}

function mergeList(base: string[], incoming?: string[]): string[] {
  if (!incoming?.length) return base;
  return [...new Set([...incoming, ...base])].slice(0, 5);
}

function buildDestinationPlanEnrichmentPrompt(input: EnrichDestinationPlansInput): string {
  const compactPlans = input.plans.map((plan) => ({
    destinationId: plan.destination.destinationId,
    destinationName: plan.destination.destinationName,
    reason: plan.destination.reason,
    tradeOff: plan.destination.tradeOff,
    weather: plan.weather,
    commerceSlots: {
      transport: plan.transport[0],
      stays: plan.stays[0],
      activities: plan.activities[0],
      restaurants: plan.restaurants[0],
      photoSpots: plan.photoSpots[0]
    },
    dailyItinerary: plan.dailyItinerary.map((day) => ({
      day: day.day,
      title: day.title,
      allowedPlaceNames: day.items.map((item) => item.placeName),
      items: day.items.map((item) => ({
        placeName: item.placeName,
        area: item.area,
        activity: item.activity,
        fitRationale: item.fitRationale,
        planB: item.planB
      }))
    }))
  }));

  const visualSignals = input.profileImages?.slice(0, 30).map((image) => ({
    alt: image.alt,
    tags: image.tags,
    visualDescription: image.visualDescription,
    visualTags: image.visualTags,
    visualMood: image.visualMood,
    visualPlace: image.visualPlace,
    visualActivities: image.visualActivities
  }));

  return `
You are a Korean travel product planner.
Keep the provided destination set and allowed itinerary place names. Do not add new destinations or new place names.
Enrich copy so the result feels personalized from Instagram profile signals and survey answers.
Use Korean only.

Rules:
- destinationId must be one of the provided destinationIds.
- For dailyItinerary.items, placeName must exactly match one of the allowedPlaceNames for that day.
- Improve reason, tradeOff, weather summary, commerce slot why text, itinerary activity, fitRationale, and planB.
- Connect Instagram image/metadata signals to each city and route.
- Mention travel month weather only when survey.travelWindow has month information.
- Keep wording practical, specific, and concise. Avoid generic "카페/산책" repetition.

Persona:
${JSON.stringify(input.persona)}

Survey:
${JSON.stringify(input.survey)}

Profile evidence:
${JSON.stringify(input.profileEvidence ?? [])}

Image signals:
${JSON.stringify(visualSignals ?? [])}

Curated base plans:
${JSON.stringify(compactPlans)}

Return JSON:
{
  "plans": [
    {
      "destinationId": "same id",
      "reason": "Korean personalized reason",
      "tradeOff": "Korean practical tradeoff",
      "weather": {
        "summary": "Korean weather planning note",
        "preparation": ["items"],
        "cautions": ["notes"]
      },
      "transport": {"summary": "copy", "why": "copy"},
      "stays": {"summary": "copy", "why": "copy"},
      "activities": {"summary": "copy", "why": "copy"},
      "restaurants": {"summary": "copy", "why": "copy"},
      "photoSpots": {"summary": "copy", "why": "copy"},
      "dailyItinerary": [
        {
          "day": 1,
          "title": "Korean day title",
          "items": [
            {
              "placeName": "must match allowedPlaceNames",
              "activity": "Korean concrete activity",
              "fitRationale": "Korean personalized rationale",
              "planB": "Korean practical alternative"
            }
          ]
        }
      ]
    }
  ]
}
`.trim();
}
