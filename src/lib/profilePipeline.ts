import { generateJson } from "./gemini";
import { ingestInstagramProfile } from "./instagram";
import { analyzeSampleProfile } from "./mockAnalysis";
import { analyzeProfileText, buildProfileEvidence } from "./profileAnalysis";
import { buildPersonaPrompt } from "./prompts";
import { parseTravelPersona } from "./resultValidation";
import type { ProfileAnalysisResult } from "./types";

export async function analyzeInstagramProfile(instagramUrl: string): Promise<ProfileAnalysisResult> {
  const ingested = await ingestInstagramProfile(instagramUrl);
  const fallbackPersona = instagramUrl.startsWith("sample:")
    ? analyzeSampleProfile(instagramUrl.replace("sample:", ""))
    : analyzeProfileText(ingested.profileText, ingested.username);
  const persona = parseTravelPersona(
    await generateJson<unknown>(buildPersonaPrompt(ingested.profileText), fallbackPersona),
    fallbackPersona
  );

  return {
    persona,
    source: ingested.source,
    username: ingested.username,
    profileEvidence: buildProfileEvidence(persona, ingested.username, ingested.source),
    profileImages: ingested.profileImages ?? []
  };
}
