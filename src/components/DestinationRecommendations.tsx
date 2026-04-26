"use client";

import { ArrowLeft, Camera, Car, Hotel, Utensils } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { DestinationPlan, TripPersonaResult } from "@/src/lib/types";

interface DestinationRecommendationsProps {
  result: TripPersonaResult;
  onBack: () => void;
}

export function DestinationRecommendations({ result, onBack }: DestinationRecommendationsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const plans = result.destinationPlans.length > 0 ? result.destinationPlans : [];
  const active = plans[activeIndex];

  if (!active) {
    return null;
  }

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
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-extrabold ${
                activeIndex === index ? "bg-cyan-800 text-white" : "bg-white text-muted"
              }`}
            >
              {plan.destination.destinationName}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <RecommendationCard icon={<Car size={17} />} title="교통" item={active.transport[0]} />
          <RecommendationCard icon={<Hotel size={17} />} title="숙소" item={active.stays[0]} />
          <RecommendationCard icon={<Utensils size={17} />} title="맛집" item={active.restaurants[0]} />
          <RecommendationCard icon={<Camera size={17} />} title="사진 포인트" item={active.photoSpots[0]} />
        </div>

        <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h2 className="text-[20px] font-extrabold">{active.destination.destinationName} 일정</h2>
          <div className="mt-4 grid gap-3">
            {active.itinerary.map((item) => (
              <div key={`${active.destination.destinationId}-${item.time}-${item.placeName}`} className="grid grid-cols-[52px_1fr] gap-3 rounded-xl border border-line p-3">
                <span className="text-[13px] font-extrabold text-cyan-800">{item.time}</span>
                <div className="grid gap-1">
                  <h3 className="text-[15px] font-extrabold">{item.placeName}</h3>
                  <p className="text-[13px] leading-5 text-muted">{item.activity}</p>
                  <p className="rounded-lg bg-cyan-50 p-2 text-[12px] leading-4 text-cyan-900">Plan B: {item.planB}</p>
                </div>
              </div>
            ))}
          </div>
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

function RecommendationCard({ icon, title, item }: { icon: ReactNode; title: string; item?: { name: string; summary: string; why: string } }) {
  return (
    <article className="grid min-h-32 gap-2 rounded-xl border border-line bg-surface p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[13px] font-extrabold text-cyan-900">
        {icon}
        {title}
      </div>
      <div>
        <h3 className="text-[14px] font-extrabold leading-5">{item?.name}</h3>
        <p className="mt-1 text-[12px] leading-4 text-muted">{item?.summary}</p>
      </div>
    </article>
  );
}
