"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toProxiedImageUrl } from "@/src/lib/imageProxy";
import type { ProfileEvidenceImage, TripPersonaResult } from "@/src/lib/types";

interface PersonaRevealProps {
  result: TripPersonaResult;
  travelPlanStatus: "idle" | "planning" | "ready" | "error";
  travelPlanError?: string | null;
  onContinue: () => void;
  onRestart: () => void;
}

export function PersonaReveal({ result, travelPlanStatus, travelPlanError, onContinue, onRestart }: PersonaRevealProps) {
  const insightCards = buildInsightCards(result);
  const evidenceTags = buildEvidenceTags(result.profileImages ?? [], result.persona.tasteTagLabels);
  const [activeTag, setActiveTag] = useState(evidenceTags[0]?.tag ?? ALL_IMAGES_TAG);
  const selectedTag = evidenceTags.some((item) => item.tag === activeTag) ? activeTag : evidenceTags[0]?.tag ?? ALL_IMAGES_TAG;
  const visibleImages = getImagesForTag(result.profileImages ?? [], selectedTag);

  return (
    <main className="min-h-screen overflow-x-hidden bg-mist px-4 py-5 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-5">
        <p className="w-max rounded-full bg-cyan-100 px-3 py-2 text-[12px] font-extrabold text-cyan-900">
          {result.source === "live" ? "Instagram live taste report" : "Instagram taste report"}
        </p>
        <div className="grid gap-3">
          <h1 className="text-[30px] font-extrabold leading-[36px]">{result.persona.title}</h1>
        </div>

        <article className="grid gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-extrabold">인스타에서 읽은 취향</h2>
            {result.profileUsername ? <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-extrabold text-cyan-900">{formatInstagramHandle(result.profileUsername)}</span> : null}
          </div>

          {evidenceTags.length > 0 ? (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {evidenceTags.map((item) => {
                const isActive = selectedTag === item.tag;
                return (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setActiveTag(item.tag)}
                    className={`min-h-11 shrink-0 rounded-full border px-4 text-[13px] font-extrabold transition active:scale-[0.98] ${
                      isActive ? "border-cyan-800 bg-white text-cyan-900 shadow-sm" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {visibleImages.length > 0 ? (
            <div className="flex max-w-full snap-x gap-3 overflow-x-auto pb-1">
              {visibleImages.map((image) => (
                <figure key={`${selectedTag}-${image.url}`} className="w-40 max-w-[72vw] shrink-0 snap-start overflow-hidden rounded-xl bg-white shadow-sm">
                  <img src={toProxiedImageUrl(image.url)} alt={image.alt} className="aspect-square w-full object-cover" loading="eager" />
                  {image.visualDescription ? (
                    <figcaption className="min-h-16 px-3 py-2 text-[11px] font-bold leading-4 text-cyan-950">{image.visualDescription}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-white p-4 text-[13px] font-bold leading-5 text-cyan-950">이 키워드에 직접 연결된 피드 이미지는 아직 부족해요.</p>
          )}
        </article>

        <div className="grid gap-3">
          {insightCards.map((card) => (
            <article key={card.label} className="grid gap-2 rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <p className="text-[12px] font-extrabold text-cyan-800">{card.label}</p>
              <h2 className="text-[18px] font-extrabold leading-6">{card.title}</h2>
              <p className="text-[13px] leading-5 text-muted">{card.description}</p>
            </article>
          ))}
        </div>

        <article className="grid gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h2 className="text-[18px] font-extrabold">분석에 사용한 신호</h2>
          <div className="flex flex-wrap gap-2">
            {result.persona.tasteTags.map((tag) => (
              <span key={tag} className="rounded-full bg-cyan-50 px-3 py-2 text-[12px] font-bold text-cyan-900">{labelPersonaTag(tag, result.persona.tasteTagLabels)}</span>
            ))}
          </div>
          <PersonaMetric label="느린 일정 선호" value={result.persona.pace === "slow" ? 86 : result.persona.pace === "balanced" ? 64 : 38} />
          <PersonaMetric label="혼잡 회피 성향" value={result.persona.crowdTolerance === "low" ? 78 : result.persona.crowdTolerance === "medium" ? 52 : 28} />
        </article>

        <div className="grid gap-2">
          {travelPlanStatus === "planning" ? (
            <div className="grid gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-cyan-950">
              <div className="flex items-center gap-3">
                <span className="h-5 w-5 shrink-0 rounded-full border-4 border-cyan-100 border-t-cyan-800 animate-spin" />
                <p className="text-[14px] font-extrabold">여행지와 날짜별 일정을 만드는 중<span className="loading-dots" /></p>
              </div>
              <p className="text-[12px] font-bold leading-4 text-cyan-900">취향 분석은 완료됐어요. 항공/교통, 숙소, 맛집, 레저 구좌까지 묶는 동안 잠시만 기다려주세요.</p>
            </div>
          ) : null}

          {travelPlanStatus === "error" ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[13px] font-bold leading-5 text-red-700">
              여행 계획 생성에 실패했습니다. {travelPlanError ?? "잠시 후 다시 시도해주세요."}
            </p>
          ) : null}

          <button
            onClick={onContinue}
            disabled={travelPlanStatus !== "ready"}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-[16px] font-extrabold transition ${
              travelPlanStatus === "ready" ? "bg-cyan-800 text-white" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            {travelPlanStatus === "ready" ? "추천 여행지 확인하기" : "추천 여행지 준비 중"}
            {travelPlanStatus === "ready" ? <ArrowRight aria-hidden="true" size={18} /> : null}
          </button>
          <button onClick={onRestart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-white px-4 text-[15px] font-extrabold text-cyan-900">
            <RotateCcw aria-hidden="true" size={17} />
            다시 분석하기
          </button>
        </div>
      </section>
    </main>
  );
}

const ALL_IMAGES_TAG = "__all_images__";

function buildEvidenceTags(images: ProfileEvidenceImage[], dynamicLabels?: Record<string, string>): Array<{ tag: string; label: string }> {
  const imageIndexesByTag = new Map<string, number[]>();
  for (const [index, image] of images.entries()) {
    for (const tag of image.tags ?? []) {
      imageIndexesByTag.set(tag, [...(imageIndexesByTag.get(tag) ?? []), index]);
    }
  }

  const seenImageSets = new Set<string>();
  const tags = [...imageIndexesByTag.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .flatMap(([tag, indexes]) => {
      const imageSetKey = indexes.join(",");
      if (seenImageSets.has(imageSetKey)) return [];
      seenImageSets.add(imageSetKey);
      return [{ tag, label: labelPersonaTag(tag, dynamicLabels) }];
    })
    .slice(0, 7);

  return tags.length > 0 ? tags : [{ tag: ALL_IMAGES_TAG, label: "피드 이미지" }];
}

function getImagesForTag(images: ProfileEvidenceImage[], tag?: string): ProfileEvidenceImage[] {
  if (!tag || tag === ALL_IMAGES_TAG || images.length === 0) return images.slice(0, 12);
  return images.filter((image) => image.tags?.includes(tag)).slice(0, 12);
}

function formatInstagramHandle(username: string): string {
  const normalized = username.replace(/^@/, "");
  if (!normalized) return "@instagram";
  return `@${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

function buildInsightCards(result: TripPersonaResult) {
  const tags = result.persona.tasteTags;
  const evidence = result.profileEvidence ?? [];
  const mood = hasAnyTag(tags, ["social-gathering", "social-gatherings", "social-travel", "social-oriented", "collaboration-centric"])
    ? "사람들과 함께 즐기는 트렌디한 장면"
    : hasAnyTag(tags, ["trendy-spots", "photo-worthy", "photography", "photo-spots", "instagrammable", "instagrammable-spots"])
      ? "사진으로 남기기 좋은 트렌디한 장소"
      : hasAnyTag(tags, ["active", "active-vibes", "active-experience", "active-lifestyle", "activity-focused", "interactive-experiences"])
        ? "활기 있는 체험과 도심 핫플"
        : tags.includes("ocean") || tags.includes("coastal") || tags.includes("beach")
          ? "바다와 여유가 있는 장면"
          : tags.includes("food") || tags.includes("local-food")
            ? "로컬 미식과 활기 있는 거리"
            : tags.includes("specialty-coffee") || tags.includes("cafe-hopping") || tags.includes("minimalist-aesthetic") || tags.includes("local-neighborhood")
              ? "조용한 카페와 감도 높은 동네"
              : tags.includes("gallery") || tags.includes("design") || tags.includes("art")
                ? "전시, 디자인, 감도 높은 동네"
                : "프로필 신호를 바탕으로 한 개인화된 여행 취향";
  const paceLabel = result.persona.pace === "slow" ? "하루 2-3곳을 깊게 보는 일정" : result.persona.pace === "packed" ? "하루 5곳 이상 촘촘한 일정" : "대표 코스와 여유를 섞는 일정";
  const crowdLabel = result.persona.crowdTolerance === "low" ? "혼잡을 피하는 쪽" : result.persona.crowdTolerance === "high" ? "활기 있는 장소도 괜찮은 쪽" : "혼잡도는 중간 수준까지 허용";
  const evidenceTitle = evidence[0] ?? result.persona.confidenceNotes[0] ?? "프로필 텍스트와 설문 답변을 함께 반영했습니다.";

  return [
    { label: "좋아하는 분위기", title: mood, description: result.persona.summary },
    { label: "여행 속도", title: paceLabel, description: evidence[1] ?? "프로필의 활동 밀도와 설문 답변을 함께 보고 하루 일정 수를 조절합니다." },
    { label: "혼잡 민감도", title: crowdLabel, description: evidence[2] ?? "추천지의 시간대와 Plan B를 고를 때 이 기준을 반영합니다." },
    { label: "추천 근거", title: evidenceTitle, description: "아래 추천 여행지는 이 분석 결과와 이동 가능 범위를 함께 적용해 정렬됩니다." }
  ];
}

function hasAnyTag(tags: string[], candidates: string[]): boolean {
  return candidates.some((tag) => tags.includes(tag));
}

function labelPersonaTag(tag: string, dynamicLabels?: Record<string, string>): string {
  if (dynamicLabels?.[tag]) return dynamicLabels[tag];
  const labels: Record<string, string> = {
    food: "미식",
    "local-food": "로컬 미식",
    city: "도시 산책",
    urban: "도시 감도",
    night: "야간 무드",
    packed: "고밀도 일정",
    coastal: "바다",
    ocean: "오션뷰",
    beach: "해변",
    slow: "느린 여행",
    rest: "휴식",
    photo: "사진",
    design: "디자인",
    gallery: "전시",
    cafes: "카페",
    shopping: "쇼핑",
    quiet: "조용한 동네",
    local: "로컬",
    walk: "산책",
    retro: "레트로",
    "cafe-hopping": "카페 탐방",
    minimalism: "미니멀한 공간",
    "urban-exploration": "도시 탐색",
    "quiet-places": "조용한 장소",
    "aesthetic-spaces": "감도 높은 공간",
    "hands-on-workshops": "체험형 활동",
    "instagrammable-spots": "사진 명소",
    "eco-tourism": "친환경 여행",
    "trendy-cafes": "트렌디한 카페",
    "specialty-coffee": "스페셜티 커피",
    "minimalist-aesthetic": "미니멀한 미감",
    "local-neighborhood": "로컬 동네",
    "eco-friendly": "친환경 감도",
    "sustainable-travel": "지속가능 여행",
    "trendy-spots": "트렌디한 장소",
    instagrammable: "사진 명소",
    active: "활동적인 경험",
    "pop-up-stores": "팝업 스토어",
    "aesthetic-cafes": "감성 카페",
    "social-travel": "소셜 여행",
    "social-gatherings": "사교적 여행",
    "interactive-experiences": "참여형 경험",
    "vibrant-energy": "밝은 에너지",
    "photo-worthy": "사진 남기기 좋은 곳",
    photography: "사진 중심",
    "active-vibes": "활기찬 분위기",
    "active-experience": "활기찬 체험",
    "collaboration-centric": "함께 즐기는 경험",
    "social-gathering": "사람들과 함께하는 장면",
    "city-tour": "도시 투어",
    "activity-focused": "활동 중심",
    "social-oriented": "함께하는 여행",
    "active-lifestyle": "에너제틱 활동",
    "photo-spots": "인생샷 스팟",
    nightlife: "야간 무드",
    nature: "자연",
    studio: "스튜디오",
    indoor: "실내 공간",
    "photo-studio": "사진 스튜디오",
    "cafe": "카페",
    street: "거리",
    "mirror-selfie": "거울 셀피",
    "selfie": "셀피",
    "creative-space": "창작 공간",
    "indoor-space": "실내 공간",
    cheerful: "밝은 분위기",
    friendly: "친근한 분위기",
    playful: "장난스러운 무드",
    vibrant: "활기찬 분위기",
    cozy: "아늑한 공간",
    stylish: "스타일리시한 무드",
    bright: "밝은 무드",
    warm: "따뜻한 무드",
    youthful: "영한 감도",
    relaxed: "편안한 분위기",
    energetic: "에너제틱한 무드",
    fun: "즐거운 분위기"
  };

  return labels[tag] ?? tag.split("-").filter(Boolean).map((word) => labels[word] ?? word).join(" ");
}

function PersonaMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-[13px] font-bold">
        <span>{label}</span>
        <span className="text-cyan-800">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-cyan-100">
        <div className="h-full rounded-full bg-cyan-800" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
