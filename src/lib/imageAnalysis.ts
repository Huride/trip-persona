import { createPartFromBase64, type Part } from "@google/genai";
import { generateJsonFromParts } from "./gemini";
import { isAllowedProxyImageUrl } from "./imageProxy";
import type { ProfileEvidenceImage } from "./types";

interface VisionImageAnalysis {
  imageId: string;
  description: string;
  visualTags: string[];
  moodTags: string[];
  placeTags: string[];
  activityTags: string[];
  confidence: number;
}

const BATCH_SIZE = 6;
const MAX_IMAGE_BYTES = 4_500_000;
const MAX_VISION_IMAGES = 36;

export async function analyzeProfileImagesWithVision(images: ProfileEvidenceImage[], username: string): Promise<ProfileEvidenceImage[]> {
  if (images.length === 0) return images;

  const visionImages = images.slice(0, MAX_VISION_IMAGES);
  const prepared = await Promise.all(visionImages.map((image, index) => prepareImagePart(image, index)));
  const results = new Map<string, VisionImageAnalysis>();

  for (let start = 0; start < prepared.length; start += BATCH_SIZE) {
    const batch = prepared.slice(start, start + BATCH_SIZE).filter((item): item is PreparedImage => Boolean(item));
    if (batch.length === 0) continue;

    const fallback: VisionImageAnalysis[] = [];
    const parts: Part[] = [{ text: buildImageVisionPrompt(username, batch) }];
    for (const item of batch) {
      parts.push({ text: `imageId: ${item.imageId}\nalt: ${item.image.alt}\nsource: ${item.image.source}` });
      parts.push(item.part);
    }

    const analyzed = normalizeVisionAnalyses(await generateJsonFromParts<unknown>(parts, fallback));
    for (const item of analyzed) {
      results.set(item.imageId, item);
    }
  }

  return images.map((image, index) => {
    const analysis = results.get(makeImageId(index));
    if (!analysis) {
      return {
        ...image,
        analysisSource: image.tags && image.tags.length > 0 ? "metadata" : undefined
      };
    }

    const visionTags = unique([
      ...analysis.visualTags,
      ...analysis.moodTags,
      ...analysis.placeTags,
      ...analysis.activityTags
    ]);

    return {
      ...image,
      tags: unique([...(image.tags ?? []), ...visionTags]),
      visualDescription: analysis.description,
      visualTags: analysis.visualTags,
      visualMood: analysis.moodTags,
      visualPlace: analysis.placeTags,
      visualActivities: analysis.activityTags,
      analysisSource: "vision",
      analysisConfidence: analysis.confidence
    };
  });
}

export function buildImageAnalysisText(images: ProfileEvidenceImage[]): string {
  const analyzed = images.filter((image) => image.visualDescription || image.visualTags?.length);
  if (analyzed.length === 0) return "";

  return [
    "Gemini vision analysis of available feed images:",
    ...analyzed.map((image, index) => {
      const tags = unique([
        ...(image.visualTags ?? []),
        ...(image.visualMood ?? []),
        ...(image.visualPlace ?? []),
        ...(image.visualActivities ?? [])
      ]);
      return [
        `vision image ${index + 1}: ${image.visualDescription ?? image.alt}`,
        tags.length > 0 ? `vision tags: ${tags.join(", ")}` : "",
        typeof image.analysisConfidence === "number" ? `vision confidence: ${image.analysisConfidence}` : ""
      ].filter(Boolean).join("\n");
    })
  ].join("\n");
}

interface PreparedImage {
  imageId: string;
  image: ProfileEvidenceImage;
  part: Part;
}

async function prepareImagePart(image: ProfileEvidenceImage, index: number): Promise<PreparedImage | null> {
  if (!isAllowedProxyImageUrl(image.url)) return null;

  try {
    const response = await fetch(image.url, {
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) return null;
    const mimeType = normalizeMimeType(response.headers.get("content-type"), image.url);
    if (!mimeType) return null;

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0 || arrayBuffer.byteLength > MAX_IMAGE_BYTES) return null;

    return {
      imageId: makeImageId(index),
      image,
      part: createPartFromBase64(Buffer.from(arrayBuffer).toString("base64"), mimeType)
    };
  } catch {
    return null;
  }
}

function buildImageVisionPrompt(username: string, batch: PreparedImage[]): string {
  return `
Analyze all provided Instagram feed images for travel preference only.
Do not identify people. Do not infer sensitive traits.
Use every provided image in this batch.

Account: ${username}
Image ids: ${batch.map((item) => item.imageId).join(", ")}

Return JSON array. Each item must contain:
imageId, description, visualTags, moodTags, placeTags, activityTags, confidence.

Rules:
- imageId must exactly match one of the provided ids.
- description must be one concise Korean sentence about the visible scene.
- tags must be lowercase English slugs useful for travel recommendation.
- prefer concrete travel slugs such as social-gathering, trendy-spots, photo-worthy, cafe-hopping, local-food, city-tour, gallery, design, coastal, nature, quiet, active-experience, nightlife, shopping, rest.
- confidence is a number from 0 to 1.
`.trim();
}

function normalizeVisionAnalyses(value: unknown): VisionImageAnalysis[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): VisionImageAnalysis[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const imageId = typeof record.imageId === "string" ? record.imageId : "";
    if (!/^img-\d+$/.test(imageId)) return [];

    return [{
      imageId,
      description: typeof record.description === "string" ? record.description : "",
      visualTags: normalizeTags(record.visualTags),
      moodTags: normalizeTags(record.moodTags),
      placeTags: normalizeTags(record.placeTags),
      activityTags: normalizeTags(record.activityTags),
      confidence: clampConfidence(record.confidence)
    }];
  });
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return unique(value.map((item) => normalizeTag(String(item))).filter(Boolean));
}

function normalizeTag(value: string): string {
  const tag = value.toLowerCase().trim().replace(/\s+/g, "-");
  const aliases: Record<string, string> = {
    indoors: "indoor",
    "indoor-space": "indoor",
    "photo-studios": "photo-studio",
    "photo-booth": "photo-studio",
    "selfies": "selfie"
  };
  return aliases[tag] ?? tag;
}

function normalizeMimeType(contentType: string | null, url: string): string | null {
  const mimeType = contentType?.split(";")[0]?.trim().toLowerCase();
  if (mimeType?.startsWith("image/")) return mimeType;
  if (/\.png(?:\?|$)/i.test(url)) return "image/png";
  if (/\.webp(?:\?|$)/i.test(url)) return "image/webp";
  if (/\.(?:jpg|jpeg)(?:\?|$)/i.test(url)) return "image/jpeg";
  return null;
}

function clampConfidence(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0.5;
  return Math.max(0, Math.min(1, numeric));
}

function makeImageId(index: number): string {
  return `img-${index}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
