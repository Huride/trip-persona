interface FinalizingViewProps {
  profileStatus: "idle" | "analyzing" | "ready" | "fallback" | "error";
}

export function FinalizingView({ profileStatus }: FinalizingViewProps) {
  const stages = [
    profileStatus === "ready" || profileStatus === "fallback" ? "인스타 취향 분석 완료" : "인스타 취향 분석 마무리",
    "설문 답변과 취향 신호 결합",
    "여행지별 일차 일정 생성"
  ];

  return (
    <main className="flex min-h-screen items-center bg-mist px-5 py-8 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-5 text-center">
        <div className="mx-auto h-16 w-16 rounded-full border-8 border-cyan-100 border-t-cyan-800 animate-spin" />
        <div className="grid gap-2">
          <p className="text-[13px] font-extrabold text-cyan-800">설문 완료</p>
          <h1 className="text-[26px] font-extrabold leading-8">최종 여행 계획을 정리하는 중</h1>
          <p className="text-[14px] leading-5 text-muted">프로필 분석과 여행 조건을 합쳐 여행지별 일정, 교통편, 숙소, 맛집 후보를 묶고 있습니다<span className="loading-dots" /></p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-line bg-surface p-5 text-left shadow-sm">
          <div className="grid gap-2">
            {stages.map((stage, index) => (
              <div key={stage} className="flex items-center gap-2 text-[13px] font-bold text-cyan-900">
                <span className={`h-2 w-2 rounded-full ${index === 2 ? "bg-cyan-800 animate-pulse" : "bg-cyan-300"}`} />
                <span>{stage}<span className={index === 2 ? "loading-dots" : ""} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
