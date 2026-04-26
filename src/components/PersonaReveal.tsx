"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toProxiedImageUrl } from "@/src/lib/imageProxy";
import type { ProfileEvidenceImage, TripPersonaResult } from "@/src/lib/types";

interface PersonaRevealProps {
  result: TripPersonaResult;
  onContinue: () => void;
  onRestart: () => void;
}

export function PersonaReveal({ result, onContinue, onRestart }: PersonaRevealProps) {
  const insightCards = buildInsightCards(result);
  const tasteTags = result.persona.tasteTags.slice(0, 5);
  const [activeTag, setActiveTag] = useState(tasteTags[0] ?? "");
  const selectedTag = tasteTags.includes(activeTag) ? activeTag : tasteTags[0];
  const visibleImages = getImagesForTag(result.profileImages ?? [], selectedTag);

  return (
    <main className="min-h-screen bg-mist px-5 py-6 text-ink">
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
            {result.profileUsername ? <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-extrabold text-cyan-900">@{result.profileUsername}</span> : null}
          </div>

          {tasteTags.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tasteTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={`h-10 shrink-0 rounded-full border px-4 text-[13px] font-extrabold transition ${
                      isActive ? "border-cyan-800 bg-white text-cyan-900 shadow-sm" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                    }`}
                  >
                    {labelPersonaTag(tag)}
                  </button>
                );
              })}
            </div>
          ) : null}

          {visibleImages.length > 0 ? (
            <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
              {visibleImages.map((image) => (
                <figure key={`${selectedTag}-${image.url}`} className="w-40 shrink-0 snap-start overflow-hidden rounded-xl bg-white shadow-sm">
                  <img src={toProxiedImageUrl(image.url)} alt={image.alt} className="aspect-square w-full object-cover" loading="eager" />
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
              <span key={tag} className="rounded-full bg-cyan-50 px-3 py-2 text-[12px] font-bold text-cyan-900">{labelPersonaTag(tag)}</span>
            ))}
          </div>
          <PersonaMetric label="느린 일정 선호" value={result.persona.pace === "slow" ? 86 : result.persona.pace === "balanced" ? 64 : 38} />
          <PersonaMetric label="혼잡 회피 성향" value={result.persona.crowdTolerance === "low" ? 78 : result.persona.crowdTolerance === "medium" ? 52 : 28} />
        </article>

        <div className="grid gap-2">
          <button onClick={onContinue} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-4 text-[16px] font-extrabold text-white">
            추천 여행지 확인하기
            <ArrowRight aria-hidden="true" size={18} />
          </button>
          <button onClick={onRestart} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-white px-4 text-[15px] font-extrabold text-cyan-900">
            <RotateCcw aria-hidden="true" size={17} />
            다시 분석하기
          </button>
        </div>
      </section>
    </main>
  );
}

function getImagesForTag(images: ProfileEvidenceImage[], tag?: string): ProfileEvidenceImage[] {
  if (!tag || images.length === 0) return images;
  return images.filter((image, index) => imageMatchesTag(image, tag, index)).slice(0, 6);
}

function imageMatchesTag(image: ProfileEvidenceImage, tag: string, index: number): boolean {
  const text = `${image.alt} ${image.source}`.toLowerCase();
  if (text.includes("instagram public mirror")) return true;
  if (
    [
      "eco-friendly",
      "sustainable-travel",
      "trendy-spots",
      "instagrammable",
      "active",
      "pop-up-stores",
      "aesthetic-cafes",
      "social-travel",
      "interactive-experiences",
      "vibrant-energy",
      "photo-worthy",
      "collaboration-centric"
    ].includes(tag)
  ) {
    return /instagram public mirror|chuucandoit|instagram update|photo by|cafe|coffee|카페/.test(text);
  }
  if (["specialty-coffee", "cafe-hopping", "trendy-cafes", "cafes"].includes(tag)) {
    return /cafe|coffee|카페|커피|앤트러사이트|서교/.test(text);
  }
  if (["minimalism", "minimalist-aesthetic", "aesthetic-spaces", "design", "gallery"].includes(tag)) {
    return /sketch|drawing|art|gallery|전시|미술|앤트러사이트|서교/.test(text) || [0, 1, 3, 4].includes(index);
  }
  if (["local-neighborhood", "urban-exploration", "city", "urban", "walk", "local"].includes(tag)) {
    return /서울|당산|서교|local|city|street|neighborhood|in\s/.test(text);
  }
  if (["coastal", "ocean", "beach"].includes(tag)) {
    return /sea|ocean|beach|바다|해변|island/.test(text);
  }
  if (["food", "local-food"].includes(tag)) {
    return /food|restaurant|cafe|맛|식당|카페|market/.test(text);
  }
  return false;
}

function buildInsightCards(result: TripPersonaResult) {
  const tags = result.persona.tasteTags;
  const evidence = result.profileEvidence ?? [];
  const mood = tags.includes("ocean") || tags.includes("coastal") || tags.includes("beach")
    ? "바다와 여유가 있는 장면"
    : tags.includes("food") || tags.includes("local-food")
      ? "로컬 미식과 활기 있는 거리"
      : tags.includes("specialty-coffee") || tags.includes("cafe-hopping") || tags.includes("minimalist-aesthetic") || tags.includes("local-neighborhood")
        ? "조용한 카페와 감도 높은 동네"
        : tags.includes("gallery") || tags.includes("design") || tags.includes("art")
        ? "전시, 디자인, 감도 높은 동네"
        : "카페와 산책이 섞인 도시 취향";
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

function labelPersonaTag(tag: string): string {
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
    "interactive-experiences": "참여형 경험",
    "vibrant-energy": "밝은 에너지",
    "photo-worthy": "사진 남기기 좋은 곳",
    "collaboration-centric": "함께 즐기는 경험"
  };

  return labels[tag] ?? tag;
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
