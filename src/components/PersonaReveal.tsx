"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import type { TripPersonaResult } from "@/src/lib/types";

interface PersonaRevealProps {
  result: TripPersonaResult;
  onContinue: () => void;
  onRestart: () => void;
}

export function PersonaReveal({ result, onContinue, onRestart }: PersonaRevealProps) {
  return (
    <main className="min-h-screen bg-mist px-5 py-6 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-5">
        <p className="w-max rounded-full bg-cyan-100 px-3 py-2 text-[12px] font-extrabold text-cyan-900">Instagram taste report</p>
        <div className="grid gap-3">
          <h1 className="text-[30px] font-extrabold leading-[36px]">{result.persona.title}</h1>
          <p className="text-[15px] leading-[22px] text-muted">{result.persona.summary}</p>
        </div>

        <div className="relative h-40 overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
          <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-2 text-[12px] font-extrabold text-cyan-900 shadow-sm">{result.persona.tasteTags[0] ?? "travel"}</span>
          <span className="absolute right-5 top-16 rounded-full bg-white px-3 py-2 text-[12px] font-extrabold text-cyan-900 shadow-sm">{result.persona.tasteTags[1] ?? "local"}</span>
          <span className="absolute bottom-5 left-20 rounded-full bg-white px-3 py-2 text-[12px] font-extrabold text-cyan-900 shadow-sm">{result.persona.tasteTags[2] ?? "photo"}</span>
        </div>

        <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h2 className="text-[18px] font-extrabold">프로필에서 찾은 취향 신호</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.persona.tasteTags.map((tag) => (
              <span key={tag} className="rounded-full bg-cyan-50 px-3 py-2 text-[12px] font-bold text-cyan-900">{tag}</span>
            ))}
          </div>
        </article>

        <article className="grid gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h2 className="text-[18px] font-extrabold">여행 성향</h2>
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
