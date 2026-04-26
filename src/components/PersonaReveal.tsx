"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import type { TripPersonaResult } from "@/src/lib/types";

interface PersonaRevealProps {
  result: TripPersonaResult;
  onContinue: () => void;
  onRestart: () => void;
}

export function PersonaReveal({ result, onContinue, onRestart }: PersonaRevealProps) {
  const insightCards = buildInsightCards(result);

  return (
    <main className="min-h-screen bg-mist px-5 py-6 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-5">
        <p className="w-max rounded-full bg-cyan-100 px-3 py-2 text-[12px] font-extrabold text-cyan-900">
          {result.source === "live" ? "Instagram live taste report" : "Instagram taste report"}
        </p>
        <div className="grid gap-3">
          <h1 className="text-[30px] font-extrabold leading-[36px]">{result.persona.title}</h1>
          <p className="text-[15px] leading-[22px] text-muted">{result.persona.summary}</p>
        </div>

        <article className="grid gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-extrabold">인스타에서 읽은 취향</h2>
            {result.profileUsername ? <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-extrabold text-cyan-900">@{result.profileUsername}</span> : null}
          </div>
          <div className="grid gap-2">
            {(result.profileEvidence ?? ["프로필의 장소, 분위기, 활동 신호를 여행 조건과 함께 분석했습니다."]).map((note) => (
              <p key={note} className="rounded-xl bg-white p-3 text-[13px] font-bold leading-5 text-cyan-950">{note}</p>
            ))}
          </div>
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
              <span key={tag} className="rounded-full bg-cyan-50 px-3 py-2 text-[12px] font-bold text-cyan-900">{tag}</span>
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

function buildInsightCards(result: TripPersonaResult) {
  const tags = result.persona.tasteTags;
  const mood = tags.includes("ocean") || tags.includes("coastal") || tags.includes("beach")
    ? "바다와 여유가 있는 장면"
    : tags.includes("food") || tags.includes("local-food")
      ? "로컬 미식과 활기 있는 거리"
      : tags.includes("gallery") || tags.includes("design") || tags.includes("art")
        ? "전시, 디자인, 감도 높은 동네"
        : "카페와 산책이 섞인 도시 취향";
  const paceLabel = result.persona.pace === "slow" ? "하루 2-3곳을 깊게 보는 일정" : result.persona.pace === "packed" ? "하루 5곳 이상 촘촘한 일정" : "대표 코스와 여유를 섞는 일정";
  const crowdLabel = result.persona.crowdTolerance === "low" ? "혼잡을 피하는 쪽" : result.persona.crowdTolerance === "high" ? "활기 있는 장소도 괜찮은 쪽" : "혼잡도는 중간 수준까지 허용";
  const evidence = result.profileEvidence?.[0] ?? result.persona.confidenceNotes[0] ?? "프로필 텍스트와 설문 답변을 함께 반영했습니다.";

  return [
    { label: "좋아하는 분위기", title: mood, description: "프로필에서 반복되는 장소와 활동 신호를 여행 컨셉으로 번역했습니다." },
    { label: "여행 속도", title: paceLabel, description: "설문 답변과 프로필의 활동 밀도를 함께 보고 하루 일정 수를 조절합니다." },
    { label: "혼잡 민감도", title: crowdLabel, description: "추천지의 시간대와 Plan B를 고를 때 이 기준을 반영합니다." },
    { label: "추천 근거", title: evidence, description: "아래 추천 여행지는 이 분석 결과와 이동 가능 범위를 함께 적용해 정렬됩니다." }
  ];
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
