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
  const normalized = normalizePersona(value);
  const parsed = travelPersonaSchema.safeParse(normalized);
  return parsed.success ? parsed.data : fallback;
}

export function parseTravelConcepts(value: unknown, fallback: TravelConcept[]): TravelConcept[] {
  const parsed = z.array(travelConceptSchema).length(3).safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function parseItineraryPayload(value: unknown, fallback: ItineraryPayload): ItineraryPayload {
  const parsed = itineraryPayloadSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

function normalizePersona(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  return {
    title: typeof record.title === "string" ? record.title : undefined,
    summary: typeof record.summary === "string" ? record.summary : undefined,
    tasteTags: Array.isArray(record.tasteTags)
      ? record.tasteTags.map((tag) => String(tag).toLowerCase().replace(/\s+/g, "-"))
      : undefined,
    pace: normalizePace(record.pace),
    crowdTolerance: normalizeCrowdTolerance(record.crowdTolerance),
    confidenceNotes: Array.isArray(record.confidenceNotes)
      ? record.confidenceNotes.map(String)
      : typeof record.confidenceNotes === "string"
        ? [record.confidenceNotes]
        : []
  };
}

function normalizePace(value: unknown): TravelPersona["pace"] | undefined {
  const text = String(value ?? "").toLowerCase();
  if (/(packed|fast|dense|high|빡|많이|밀도)/.test(text)) return "packed";
  if (/(slow|rest|calm|low|느긋|여유|휴식)/.test(text)) return "slow";
  if (/(balanced|medium|보통|균형)/.test(text)) return "balanced";
  return undefined;
}

function normalizeCrowdTolerance(value: unknown): TravelPersona["crowdTolerance"] | undefined {
  const text = String(value ?? "").toLowerCase();
  if (/(high|crowd|busy|높|혼잡 가능)/.test(text)) return "high";
  if (/(low|quiet|avoid|낮|조용|회피)/.test(text)) return "low";
  if (/(medium|moderate|보통|중간)/.test(text)) return "medium";
  if (/(unknown|unclear|모름)/.test(text)) return "unknown";
  return undefined;
}
