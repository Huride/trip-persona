"use client";

import { useState } from "react";
import { LoadingAnalysis } from "@/src/components/LoadingAnalysis";
import { ResultView } from "@/src/components/ResultView";
import { TripForm } from "@/src/components/TripForm";
import type { TripPersonaResult, TripSurvey } from "@/src/lib/types";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TripPersonaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(survey: TripSurvey) {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(survey)
      });

      if (!response.ok) {
        throw new Error("분석 요청에 실패했습니다.");
      }

      const data = (await response.json()) as TripPersonaResult;
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-mist px-4 py-5 text-ink sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-5">
        <header className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-3">
              <p className="text-[12px] font-bold uppercase text-cyan-800">TripPersona</p>
              <h1 className="max-w-3xl text-[28px] font-extrabold leading-[34px] sm:text-[32px] sm:leading-[38px]">
                인스타그램 취향을 실제 여행 일정으로 바꿔주는 AI
              </h1>
              <p className="max-w-2xl text-[15px] leading-[22px] text-muted">
                공개 프로필의 취향 신호와 여행 조건을 결합해 페르소나, 목적지, 컨셉, 일정을 한 번에 만듭니다.
              </p>
            </div>
            <div className="grid min-w-56 gap-2 rounded-xl bg-cyan-50 p-4 text-[13px] text-cyan-900">
              <p className="font-bold">Demo-ready</p>
              <p>샘플 입력으로 크롤링 실패 상황에서도 바로 심사 시연이 가능합니다.</p>
            </div>
          </div>
        </header>
        <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
        {isLoading ? <LoadingAnalysis /> : null}
        {error ? <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-700">{error}</section> : null}
        {result ? <ResultView result={result} /> : null}
      </section>
    </main>
  );
}
