"use client";

import { useRef, useState } from "react";
import { DestinationRecommendations } from "@/src/components/DestinationRecommendations";
import { FinalizingView } from "@/src/components/FinalizingView";
import { PersonaReveal } from "@/src/components/PersonaReveal";
import { ProfileEntry } from "@/src/components/ProfileEntry";
import { SurveyFlow } from "@/src/components/SurveyFlow";
import type { ProfileAnalysisResult, TripPersonaResult, TripSurvey } from "@/src/lib/types";

type FlowStage = "entry" | "survey" | "finalizing" | "persona" | "recommendations" | "error";
type ProfileAnalysisStatus = "idle" | "analyzing" | "ready" | "fallback" | "error";

export default function HomePage() {
  const [stage, setStage] = useState<FlowStage>("entry");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [result, setResult] = useState<TripPersonaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileAnalysisStatus>("idle");
  const profileAnalysisPromise = useRef<Promise<ProfileAnalysisResult | null> | null>(null);

  function handleStart(nextInstagramUrl: string) {
    setInstagramUrl(nextInstagramUrl);
    setResult(null);
    setError(null);
    setProfileStatus("analyzing");
    profileAnalysisPromise.current = fetch("/api/profile-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagramUrl: nextInstagramUrl })
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("프로필 분석 요청에 실패했습니다.");
        const data = (await response.json()) as ProfileAnalysisResult;
        setProfileStatus(data.source === "live" ? "ready" : "fallback");
        return data;
      })
      .catch(() => {
        setProfileStatus("error");
        return null;
      });
    setStage("survey");
  }

  async function handleSurveyComplete(survey: TripSurvey) {
    setStage("finalizing");
    setError(null);

    try {
      const profileAnalysis = await profileAnalysisPromise.current;
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...survey, profileAnalysis: profileAnalysis ?? undefined })
      });

      if (!response.ok) {
        throw new Error("분석 요청에 실패했습니다.");
      }

      const data = (await response.json()) as TripPersonaResult;
      setResult(data);
      setStage("persona");
    } catch (error) {
      setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
      setStage("error");
    }
  }

  function restart() {
    setStage("entry");
    setInstagramUrl("");
    setResult(null);
    setError(null);
    setProfileStatus("idle");
    profileAnalysisPromise.current = null;
  }

  if (stage === "entry") {
    return <ProfileEntry onStart={handleStart} />;
  }

  if (stage === "survey") {
    return <SurveyFlow instagramUrl={instagramUrl} profileStatus={profileStatus} onComplete={handleSurveyComplete} />;
  }

  if (stage === "finalizing") {
    return <FinalizingView profileStatus={profileStatus} />;
  }

  if (stage === "persona" && result) {
    return <PersonaReveal result={result} onContinue={() => setStage("recommendations")} onRestart={restart} />;
  }

  if (stage === "recommendations" && result) {
    return <DestinationRecommendations result={result} onBack={() => setStage("persona")} />;
  }

  return (
    <main className="flex min-h-screen items-center bg-mist px-5 py-8 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        <h1 className="text-[22px] font-extrabold">분석 요청에 실패했습니다</h1>
        <p className="text-[14px] leading-5">{error}</p>
        <button onClick={restart} className="h-12 rounded-lg bg-red-600 px-4 text-[15px] font-extrabold text-white">
          다시 시작하기
        </button>
      </section>
    </main>
  );
}
