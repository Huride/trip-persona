export function FinalizingView() {
  return (
    <main className="flex min-h-screen items-center bg-mist px-5 py-8 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-5 text-center">
        <div className="mx-auto h-14 w-14 rounded-full border-8 border-cyan-100 border-t-cyan-800" />
        <div className="grid gap-2">
          <p className="text-[13px] font-extrabold text-cyan-800">설문 완료</p>
          <h1 className="text-[26px] font-extrabold leading-8">최종 여행 계획을 정리하는 중</h1>
          <p className="text-[14px] leading-5 text-muted">프로필 분석과 여행 조건을 합쳐 여행지별 일정, 교통편, 숙소, 맛집 후보를 묶고 있습니다.</p>
        </div>
      </section>
    </main>
  );
}
