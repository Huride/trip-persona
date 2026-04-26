import type { DestinationRecommendation, TravelPersona, TripSurvey } from "./types";

export function buildPersonaPrompt(profileText: string): string {
  return `
You are TripPersona. Analyze only travel-relevant taste from public Instagram profile content.
Do not infer sensitive traits.

Profile content:
${profileText}

Return JSON with:
title, summary, tasteTags, pace, crowdTolerance, confidenceNotes.
`.trim();
}

export function buildConceptPrompt(persona: TravelPersona, survey: TripSurvey, destinations: DestinationRecommendation[]): string {
  return `
Create three travel concepts for this user.

Persona:
${JSON.stringify(persona)}

Survey:
${JSON.stringify(survey)}

Recommended destinations:
${JSON.stringify(destinations)}

Return JSON array with three objects:
name, type ("best-fit" | "unexpected-match" | "low-risk"), summary, fitReason.
`.trim();
}

export function buildItineraryPrompt(input: unknown): string {
  return `
Create a practical itinerary using only the provided seed places.
Do not invent places.
Return JSON with itinerary, whyThisFits, excludedPlaces.

Input:
${JSON.stringify(input)}
`.trim();
}
