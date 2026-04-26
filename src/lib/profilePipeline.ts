import { generateJson } from "./gemini";
import { analyzeProfileImagesWithVision, buildImageAnalysisText } from "./imageAnalysis";
import { ingestInstagramProfile } from "./instagram";
import { analyzeSampleProfile } from "./mockAnalysis";
import { analyzeProfileText, buildProfileEvidence } from "./profileAnalysis";
import { buildPersonaPrompt } from "./prompts";
import { parseTravelPersona } from "./resultValidation";
import type { ProfileAnalysisResult } from "./types";

export async function analyzeInstagramProfile(instagramUrl: string): Promise<ProfileAnalysisResult> {
  const ingested = await ingestInstagramProfile(instagramUrl);
  const profileImages = await analyzeProfileImagesWithVision(ingested.profileImages ?? [], ingested.username);
  const profileText = [
    ingested.profileText,
    buildImageAnalysisText(profileImages)
  ].filter(Boolean).join("\n\n");
  const fallbackPersona = instagramUrl.startsWith("sample:")
    ? analyzeSampleProfile(instagramUrl.replace("sample:", ""))
    : analyzeProfileText(profileText, ingested.username);
  const persona = parseTravelPersona(
    await generateJson<unknown>(buildPersonaPrompt(profileText), fallbackPersona),
    fallbackPersona
  );

  return {
    persona,
    source: ingested.source,
    username: ingested.username,
    profileEvidence: buildProfileEvidence(persona, ingested.username, ingested.source),
    profileImages
  };
}
