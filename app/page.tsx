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
    <main className="min-h-screen bg-mist px-5 py-6 text-ink">
      <section className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean">TripPersona</p>
          <h1 className="max-w-3xl text-4xl font-bold">인스타그램 취향을 실제 여행 일정으로 바꿔주는 AI</h1>
          <p className="max-w-2xl text-base text-neutral-600">
            Instagram 프로필 링크를 넣고 여행 조건을 답하면, 공개 피드의 취향 신호를 여행 페르소나와 일정으로 변환합니다.
          </p>
        </header>
        <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
        {isLoading ? <LoadingAnalysis /> : null}
        {error ? <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</section> : null}
        {result ? <ResultView result={result} /> : null}
      </section>
    </main>
  );
}
