"use client";

import { useEffect, useRef, useState } from "react";
import { DestinationRecommendations } from "@/src/components/DestinationRecommendations";
import { FinalizingView } from "@/src/components/FinalizingView";
import { PersonaReveal } from "@/src/components/PersonaReveal";
import { ProfileEntry } from "@/src/components/ProfileEntry";
import { SurveyFlow } from "@/src/components/SurveyFlow";
import type { ProfileAnalysisResult, TripPersonaResult, TripSurvey } from "@/src/lib/types";

type FlowStage = "entry" | "survey" | "finalizing" | "persona" | "recommendations" | "error";
type ProfileAnalysisStatus = "idle" | "analyzing" | "ready" | "fallback" | "error";
type TravelPlanStatus = "idle" | "planning" | "ready" | "error";

export default function HomePage() {
  const [stage, setStage] = useState<FlowStage>("entry");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [result, setResult] = useState<TripPersonaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileAnalysisStatus>("idle");
  const [travelPlanStatus, setTravelPlanStatus] = useState<TravelPlanStatus>("idle");
  const profileAnalysisPromise = useRef<Promise<ProfileAnalysisResult | null> | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [stage]);

  function handleStart(nextInstagramUrl: string) {
    setInstagramUrl(nextInstagramUrl);
    setResult(null);
    setError(null);
    setProfileStatus("analyzing");
    setTravelPlanStatus("idle");
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
      const initialResult = buildProfileOnlyResult(profileAnalysis, survey);
      setResult(initialResult);
      setTravelPlanStatus("planning");
      setStage("persona");

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
      setTravelPlanStatus("ready");
    } catch (error) {
      setTravelPlanStatus("error");
      setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
      setStage((current) => current === "persona" ? current : "error");
    }
  }

  function restart() {
    setStage("entry");
    setInstagramUrl("");
    setResult(null);
    setError(null);
    setProfileStatus("idle");
    setTravelPlanStatus("idle");
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
    return (
      <PersonaReveal
        result={result}
        travelPlanStatus={travelPlanStatus}
        travelPlanError={error}
        onContinue={() => setStage("recommendations")}
        onRestart={restart}
      />
    );
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

function buildProfileOnlyResult(profileAnalysis: ProfileAnalysisResult | null, survey: TripSurvey): TripPersonaResult {
  const fallbackPersona: ProfileAnalysisResult["persona"] = {
    title: "인스타 취향 분석 완료",
    summary: "프로필 신호와 설문 답변을 바탕으로 여행 취향을 정리했습니다. 지금 여행지와 날짜별 일정을 생성하고 있습니다.",
    tasteTags: survey.include.length > 0 ? survey.include : ["personalized-travel"],
    pace: survey.pace,
    crowdTolerance: survey.avoid.includes("혼잡") ? "low" : "medium",
    confidenceNotes: ["설문 답변을 바탕으로 먼저 취향 요약을 만들고 있습니다."]
  };

  return {
    persona: profileAnalysis?.persona ?? fallbackPersona,
    destinations: [],
    concepts: [],
    itinerary: [],
    whyThisFits: [],
    excludedPlaces: [],
    destinationPlans: [],
    source: profileAnalysis?.source,
    profileUsername: profileAnalysis?.username,
    profileEvidence: profileAnalysis?.profileEvidence ?? [],
    profileImages: profileAnalysis?.profileImages ?? []
  };
}
