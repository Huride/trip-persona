import { z } from "zod";
import type { ItineraryItem, TravelConcept, TravelPersona } from "./types";

const travelPersonaSchema = z.object({
  title: z.string(),
  summary: z.string(),
  tasteTags: z.array(z.string()),
  pace: z.enum(["slow", "balanced", "packed"]),
  crowdTolerance: z.enum(["low", "medium", "high", "unknown"]),
  confidenceNotes: z.array(z.string())
});

const travelConceptSchema = z.object({
  name: z.string(),
  type: z.enum(["best-fit", "unexpected-match", "low-risk"]),
  summary: z.string(),
  fitReason: z.string()
});

const itineraryItemSchema = z.object({
  time: z.string(),
  placeName: z.string(),
  activity: z.string(),
  fitRationale: z.string(),
  cost: z.enum(["free", "low", "medium", "high"]),
  walkingLoad: z.enum(["low", "medium", "high"]),
  planB: z.string()
});

const itineraryPayloadSchema = z.object({
  itinerary: z.array(itineraryItemSchema),
  whyThisFits: z.array(z.string()),
  excludedPlaces: z.array(z.string())
});

export interface ItineraryPayload {
  itinerary: ItineraryItem[];
  whyThisFits: string[];
  excludedPlaces: string[];
}

export function parseTravelPersona(value: unknown, fallback: TravelPersona): TravelPersona {
  return travelPersonaSchema.safeParse(value).success ? (value as TravelPersona) : fallback;
}

export function parseTravelConcepts(value: unknown, fallback: TravelConcept[]): TravelConcept[] {
  const parsed = z.array(travelConceptSchema).length(3).safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function parseItineraryPayload(value: unknown, fallback: ItineraryPayload): ItineraryPayload {
  const parsed = itineraryPayloadSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}
