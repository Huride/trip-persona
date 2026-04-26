import type { TripPersonaResult } from "@/src/lib/types";

export function ResultView({ result }: { result: TripPersonaResult }) {
  return (
    <section className="grid gap-5">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <p className="text-[12px] font-bold uppercase text-cyan-800">Travel Persona</p>
        <h2 className="mt-1 text-[24px] font-extrabold leading-7">{result.persona.title}</h2>
        <p className="mt-2 text-[15px] leading-[22px] text-muted">{result.persona.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {result.persona.tasteTags.map((tag) => (
            <span key={tag} className="rounded-full bg-cyan-50 px-3 py-1 text-[12px] font-medium text-cyan-900">{tag}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {result.destinations.map((destination) => (
          <article key={destination.destinationId} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-[12px] font-bold text-cyan-800">FIT {destination.fitScore}</p>
            <h3 className="mt-1 text-[20px] font-extrabold leading-6">{destination.destinationName}</h3>
            <p className="mt-2 text-[14px] leading-5 text-muted">{destination.reason}</p>
            <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-[12px] leading-4 text-neutral-600">{destination.tradeOff}</p>
          </article>
        ))}
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-[20px] font-extrabold leading-6">추천 컨셉</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {result.concepts.map((concept) => (
            <article key={concept.type} className="rounded-lg border border-line p-3">
              <p className="text-[12px] font-bold uppercase text-cyan-800">{concept.type}</p>
              <h4 className="mt-1 text-[16px] font-bold leading-5">{concept.name}</h4>
              <p className="mt-2 text-[14px] leading-5 text-muted">{concept.summary}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-[20px] font-extrabold leading-6">일정</h3>
        <div className="mt-4 grid gap-3">
          {result.itinerary.map((item) => (
            <article key={`${item.time}-${item.placeName}`} className="grid gap-1 rounded-lg border border-line p-4">
              <p className="text-[14px] font-bold text-cyan-800">{item.time}</p>
              <h4 className="text-[16px] font-bold leading-5">{item.placeName}</h4>
              <p className="text-[14px] leading-5 text-muted">{item.activity}</p>
              <p className="mt-2 rounded-lg bg-cyan-50 p-3 text-[12px] leading-4 text-cyan-900">Plan B: {item.planB}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
