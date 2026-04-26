import type { TripPersonaResult } from "@/src/lib/types";

export function ResultView({ result }: { result: TripPersonaResult }) {
  return (
    <section className="grid gap-5">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-ocean">Travel Persona</p>
        <h2 className="mt-1 text-2xl font-bold">{result.persona.title}</h2>
        <p className="mt-2 text-neutral-600">{result.persona.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.persona.tasteTags.map((tag) => (
            <span key={tag} className="rounded-full bg-mist px-3 py-1 text-xs">{tag}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {result.destinations.map((destination) => (
          <article key={destination.destinationId} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-coral">FIT {destination.fitScore}</p>
            <h3 className="mt-1 text-xl font-bold">{destination.destinationName}</h3>
            <p className="mt-2 text-sm text-neutral-600">{destination.reason}</p>
            <p className="mt-2 text-xs text-neutral-500">{destination.tradeOff}</p>
          </article>
        ))}
      </div>
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold">추천 컨셉</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {result.concepts.map((concept) => (
            <article key={concept.type} className="rounded-md border border-neutral-200 p-3">
              <p className="text-xs font-semibold uppercase text-ocean">{concept.type}</p>
              <h4 className="mt-1 font-bold">{concept.name}</h4>
              <p className="mt-2 text-sm text-neutral-600">{concept.summary}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold">일정</h3>
        <div className="mt-4 grid gap-3">
          {result.itinerary.map((item) => (
            <article key={`${item.time}-${item.placeName}`} className="grid gap-1 border-l-4 border-ocean pl-4">
              <p className="text-sm font-semibold text-ocean">{item.time}</p>
              <h4 className="font-bold">{item.placeName}</h4>
              <p className="text-sm text-neutral-600">{item.activity}</p>
              <p className="text-xs text-neutral-500">Plan B: {item.planB}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
