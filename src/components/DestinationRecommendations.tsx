"use client";

import { ArrowLeft, Camera, Car, CloudSun, Hotel, MapPin, Plane, Ticket, Utensils } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { DestinationPlan, RecommendationItem, TripPersonaResult } from "@/src/lib/types";

interface DestinationRecommendationsProps {
  result: TripPersonaResult;
  onBack: () => void;
}

export function DestinationRecommendations({ result, onBack }: DestinationRecommendationsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDay, setActiveDay] = useState(1);
  const plans = result.destinationPlans.length > 0 ? result.destinationPlans : [];
  const active = plans[activeIndex];

  if (!active) {
    return null;
  }

  const days = active.dailyItinerary.length > 0 ? active.dailyItinerary : [{ day: 1, title: "추천 일정", items: active.itinerary }];
  const selectedDay = days.find((day) => day.day === activeDay) ?? days[0];

  return (
    <main className="min-h-screen bg-mist px-5 py-5 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-4">
        <button onClick={onBack} className="inline-flex w-max items-center gap-2 text-[13px] font-bold text-cyan-900">
          <ArrowLeft aria-hidden="true" size={16} />
          분석 결과로 돌아가기
        </button>

        <DestinationHero plan={active} />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {plans.map((plan, index) => (
            <button
              key={plan.destination.destinationId}
              onClick={() => {
                setActiveIndex(index);
                setActiveDay(1);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-extrabold ${
                activeIndex === index ? "bg-cyan-800 text-white" : "bg-white text-muted"
              }`}
            >
              {plan.destination.destinationName}
            </button>
          ))}
        </div>

        <WeatherCard plan={active} />

        <div className="grid grid-cols-2 gap-2">
          <RecommendationCard icon={<Plane size={17} />} title="항공/교통" item={active.transport[0]} />
          <RecommendationCard icon={<Hotel size={17} />} title="숙소" item={active.stays[0]} />
          <RecommendationCard icon={<Ticket size={17} />} title="레저" item={active.activities[0]} />
          <RecommendationCard icon={<Utensils size={17} />} title="맛집" item={active.restaurants[0]} />
          <RecommendationCard icon={<Camera size={17} />} title="사진" item={active.photoSpots[0]} />
          <RecommendationCard icon={<Car size={17} />} title="이동 팁" item={active.transport[0]} compact />
        </div>

        <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h2 className="text-[20px] font-extrabold">{active.destination.destinationName} 일정</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={`${active.destination.destinationId}-chip-${day.day}`}
                onClick={() => setActiveDay(day.day)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-extrabold ${
                  selectedDay.day === day.day ? "bg-cyan-800 text-white" : "bg-neutral-100 text-muted"
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          <section className="mt-4 grid gap-3 rounded-xl border border-line p-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[16px] font-extrabold">Day {selectedDay.day}</h3>
              <span className="text-right text-[12px] font-bold leading-4 text-muted">{selectedDay.title}</span>
            </div>
            <div className="grid gap-2">
              {selectedDay.items.map((item) => (
                <div key={`${active.destination.destinationId}-${selectedDay.day}-${item.time}-${item.placeName}`} className="grid grid-cols-[52px_1fr] gap-3 rounded-lg bg-neutral-50 p-3">
                  <span className="text-[13px] font-extrabold text-cyan-800">{item.time}</span>
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.mapUrl ? (
                        <a href={item.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[15px] font-extrabold text-ink underline decoration-cyan-300 underline-offset-4">
                          {item.placeName}
                          <MapPin aria-hidden="true" size={14} className="text-cyan-800" />
                        </a>
                      ) : (
                        <h4 className="text-[15px] font-extrabold">{item.placeName}</h4>
                      )}
                      {item.area ? <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-muted">{item.area}</span> : null}
                      {item.durationMinutes ? <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-muted">{item.durationMinutes}분</span> : null}
                    </div>
                    <p className="text-[13px] leading-5 text-muted">{item.activity}</p>
                    <p className="text-[12px] font-bold leading-4 text-cyan-950">{item.fitRationale}</p>
                    <p className="rounded-lg bg-cyan-50 p-2 text-[12px] leading-4 text-cyan-900">Plan B: {item.planB}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>
      </section>
    </main>
  );
}

function DestinationHero({ plan }: { plan: DestinationPlan }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="relative h-48 bg-cyan-100">
        <img src={plan.photo.url} alt={plan.photo.alt} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <p className="text-[12px] font-extrabold">Top match · FIT {plan.destination.fitScore}</p>
          <h1 className="text-[28px] font-extrabold leading-8">{plan.destination.destinationName}</h1>
        </div>
      </div>
      <div className="grid gap-2 p-4">
        <p className="text-[14px] leading-5 text-muted">{plan.destination.reason}</p>
        <p className="rounded-lg bg-neutral-50 p-3 text-[12px] leading-4 text-neutral-600">{plan.destination.tradeOff}</p>
      </div>
    </article>
  );
}

function WeatherCard({ plan }: { plan: DestinationPlan }) {
  return (
    <article className="grid gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[13px] font-extrabold text-cyan-900">
        <CloudSun aria-hidden="true" size={18} />
        여행 시기 체크
      </div>
      <div>
        <h2 className="text-[17px] font-extrabold">{plan.weather.title}</h2>
        <p className="mt-2 text-[13px] leading-5 text-cyan-950">{plan.weather.summary}</p>
      </div>
      <div className="grid gap-2">
        <div className="flex flex-wrap gap-2">
          {plan.weather.preparation.map((item) => (
            <span key={`prep-${item}`} className="rounded-full bg-white px-3 py-2 text-[12px] font-extrabold text-cyan-900">
              {item}
            </span>
          ))}
        </div>
        <ul className="grid gap-1 text-[12px] font-bold leading-4 text-cyan-950">
          {plan.weather.cautions.slice(0, 2).map((caution) => (
            <li key={`caution-${caution}`}>주의: {caution}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function RecommendationCard({ icon, title, item, compact = false }: { icon: ReactNode; title: string; item?: RecommendationItem; compact?: boolean }) {
  return (
    <article className="grid min-h-36 gap-2 rounded-xl border border-line bg-surface p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[13px] font-extrabold text-cyan-900">
        {icon}
        {title}
      </div>
      <div>
        <h3 className="text-[14px] font-extrabold leading-5">{item?.name}</h3>
        <p className="mt-1 text-[12px] leading-4 text-muted">{item?.summary}</p>
        {!compact && item?.why ? <p className="mt-2 rounded-lg bg-cyan-50 p-2 text-[11px] font-bold leading-4 text-cyan-950">{item.why}</p> : null}
        {item?.ctaUrl ? (
          <a href={item.ctaUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full justify-center rounded-lg bg-ink px-3 py-2 text-[12px] font-extrabold text-white">
            {item.ctaLabel ?? "확인하기"}
          </a>
        ) : null}
      </div>
    </article>
  );
}
