import { z } from "zod";
import type { ItineraryItem, TravelConcept, TravelPersona } from "./types";

const travelPersonaSchema = z.object({
  title: z.string(),
  summary: z.string(),
  tasteTags: z.array(z.string()),
  tasteTagLabels: z.record(z.string()).optional(),
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
  const tasteTags = Array.isArray(record.tasteTags)
    ? record.tasteTags.map((tag) => String(tag).toLowerCase().replace(/\s+/g, "-"))
    : undefined;
  return {
    title: typeof record.title === "string" ? localizePersonaTitle(record.title, record.tasteTags) : undefined,
    summary: typeof record.summary === "string" ? localizePersonaSummary(record.summary, record.tasteTags) : undefined,
    tasteTags,
    tasteTagLabels: normalizeTasteTagLabels(record.tasteTagLabels, tasteTags),
    pace: normalizePace(record.pace),
    crowdTolerance: normalizeCrowdTolerance(record.crowdTolerance),
    confidenceNotes: Array.isArray(record.confidenceNotes)
      ? record.confidenceNotes.map(String)
      : typeof record.confidenceNotes === "string"
        ? [record.confidenceNotes]
        : []
  };
}

function normalizeTasteTagLabels(value: unknown, tasteTags?: string[]): Record<string, string> | undefined {
  if (!tasteTags || tasteTags.length === 0) return undefined;
  const labels: Record<string, string> = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, label] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, "-");
      if (tasteTags.includes(normalizedKey) && typeof label === "string" && /[가-힣]/.test(label)) {
        labels[normalizedKey] = label;
      }
    }
  }
  for (const tag of tasteTags) {
    labels[tag] = labels[tag] ?? localizeTasteTag(tag);
  }
  return labels;
}

function localizeTasteTag(tag: string): string {
  const labels: Record<string, string> = {
    food: "미식",
    "local-food": "로컬 미식",
    city: "도시 산책",
    urban: "도시 감도",
    night: "야간 무드",
    packed: "고밀도 일정",
    "social-gathering": "사람들과 함께하는 장면",
    "social-gatherings": "사교적 여행",
    "city-tour": "도시 투어",
    "activity-focused": "활동 중심",
    "trendy-spots": "트렌디한 장소",
    "photo-worthy": "사진 남기기 좋은 곳",
    "social-travel": "소셜 여행",
    "interactive-experiences": "참여형 경험",
    "vibrant-energy": "밝은 에너지",
    photography: "사진 중심",
    "active-vibes": "활기찬 분위기",
    "active-experience": "활기찬 체험",
    "pop-up-stores": "팝업 스토어",
    "collaboration-centric": "함께 즐기는 경험"
  };
  return labels[tag] ?? tag.split("-").filter(Boolean).map((word) => labels[word] ?? word).join(" ");
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

function localizePersonaTitle(title: string, rawTags: unknown): string {
  if (/[가-힣]/.test(title)) return title;
  const text = `${title} ${Array.isArray(rawTags) ? rawTags.join(" ") : ""}`.toLowerCase();

  if (/(eco|sustainable|trend|aesthetic|workshop|instagrammable)/.test(text)) return "활기찬 트렌드 탐험가";
  if (/(food|foodie|market|dining)/.test(text)) return "도시 미식 탐험가";
  if (/(coastal|ocean|beach|resort)/.test(text)) return "바다 휴식 여행자";
  if (/(design|gallery|art|culture)/.test(text)) return "감도 높은 문화 탐색가";
  if (/(quiet|local|slow|retro)/.test(text)) return "조용한 로컬 산책가";
  if (/(destination|photo|visual|travel)/.test(text)) return "비주얼 여행지 수집가";
  return "취향 기반 여행자";
}

function localizePersonaSummary(summary: string, rawTags: unknown): string {
  if (/[가-힣]/.test(summary)) return summary;
  const text = `${summary} ${Array.isArray(rawTags) ? rawTags.join(" ") : ""}`.toLowerCase();

  if (/(eco|sustainable|trend|aesthetic|workshop|instagrammable)/.test(text)) {
    return "트렌디한 감도, 공유하고 싶은 장면, 친환경적인 활동에 반응하는 여행 성향입니다. 도시 탐험과 체험형 코스를 빠르게 오가며, 사진으로 남기기 좋은 장소와 자연이 섞인 일정을 선호합니다.";
  }
  if (/(food|foodie|market|dining)/.test(text)) {
    return "로컬 미식과 활기 있는 거리 경험을 중심으로 여행 만족도가 높아지는 성향입니다. 짧은 시간 안에 맛집, 야시장, 도심 산책을 밀도 있게 묶는 일정이 잘 맞습니다.";
  }
  if (/(coastal|ocean|beach|resort)/.test(text)) {
    return "바다, 리조트, 노을처럼 휴식감이 큰 장면에 강하게 반응하는 성향입니다. 이동 피로를 낮추고 여유로운 사진 포인트를 넣은 일정이 잘 맞습니다.";
  }
  if (/(design|gallery|art|culture)/.test(text)) {
    return "전시, 디자인, 감도 높은 카페와 편집숍을 통해 여행지를 해석하는 성향입니다. 도시 안에서 취향이 분명한 동네를 연결하는 일정이 잘 맞습니다.";
  }
  if (/(destination|photo|visual|travel)/.test(text)) {
    return "사진으로 남기기 좋은 여행지와 상징적인 장면을 모아보는 성향입니다. 도시와 자연을 균형 있게 섞고, 대표 포토 스팟을 중심으로 일정을 잡는 편이 잘 맞습니다.";
  }
  return "프로필에서 반복되는 장소, 분위기, 활동 신호를 바탕으로 여행 취향을 정리했습니다.";
}
