"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { BudgetBand, TripLength, TripSurvey, WalkingLimit, TravelPace } from "@/src/lib/types";

type SurveyAnswers = Omit<TripSurvey, "instagramUrl" | "destinationPreference">;

interface SurveyFlowProps {
  instagramUrl: string;
  onComplete: (survey: TripSurvey) => void;
}

type QuestionKey = keyof SurveyAnswers;

interface Choice<T extends string = string> {
  value: T;
  label: string;
  helper?: string;
}

interface Question {
  key: QuestionKey;
  title: string;
  helper?: string;
  type: "single" | "multi" | "text";
  choices?: Choice[];
}

const questions: Question[] = [
  {
    key: "travelWindow",
    title: "언제 떠나나요?",
    helper: "대략적인 계절이나 월만 알려줘도 충분해요.",
    type: "text"
  },
  {
    key: "tripLength",
    title: "며칠 동안 떠나나요?",
    type: "single",
    choices: [
      { value: "day-trip", label: "당일치기", helper: "숙박 없이 하루 안에 이동" },
      { value: "1n2d", label: "1박 2일", helper: "주말 짧은 여행" },
      { value: "2n3d", label: "2박 3일", helper: "대표 코스와 여유를 함께" },
      { value: "3n4d", label: "3박 4일", helper: "여러 동네를 천천히" },
      { value: "4plus", label: "4박 이상", helper: "현지에 머무는 여행" }
    ]
  },
  {
    key: "companions",
    title: "누구와 함께 가나요?",
    type: "single",
    choices: [
      { value: "solo", label: "혼자" },
      { value: "partner", label: "연인과" },
      { value: "friends", label: "친구와" },
      { value: "family", label: "가족과" },
      { value: "parents", label: "부모님과" }
    ]
  },
  {
    key: "budget",
    title: "1인 총예산은 어느 정도인가요?",
    helper: "항공/교통, 숙소, 식비, 입장료를 모두 포함한 대략적인 금액입니다.",
    type: "single",
    choices: [
      { value: "under-100k", label: "10만원 이하", helper: "근거리 당일/가성비 중심" },
      { value: "100k-300k", label: "10만-30만원", helper: "국내 1박 또는 짧은 근교 여행" },
      { value: "300k-700k", label: "30만-70만원", helper: "국내 2박 또는 일본/대만 짧은 일정" },
      { value: "700k-1200k", label: "70만-120만원", helper: "숙소와 식사를 넉넉하게" },
      { value: "over-1200k", label: "120만원 이상", helper: "리조트/프리미엄 경험 우선" }
    ]
  },
  {
    key: "pace",
    title: "하루 일정 밀도는 어느 정도가 좋아요?",
    type: "single",
    choices: [
      { value: "slow", label: "하루 2-3곳", helper: "카페와 휴식 시간이 필요해요" },
      { value: "balanced", label: "하루 3-4곳", helper: "대표 코스와 여유를 균형 있게" },
      { value: "packed", label: "하루 5곳 이상", helper: "짧은 시간에 많이 보고 싶어요" }
    ]
  },
  {
    key: "walkingLimit",
    title: "하루에 어느 정도 걸어도 괜찮나요?",
    type: "single",
    choices: [
      { value: "under-5k", label: "5천 보 이하", helper: "차량/대중교통 중심" },
      { value: "under-10k", label: "1만 보 이하", helper: "가벼운 산책 가능" },
      { value: "no-limit", label: "1만 보 이상도 괜찮음", helper: "골목과 자연 산책도 좋아요" }
    ]
  },
  {
    key: "include",
    title: "꼭 포함하고 싶은 것은?",
    type: "multi",
    choices: ["카페", "맛집", "사진", "전시", "쇼핑", "자연", "바다", "로컬", "휴식"].map((item) => ({ value: item, label: item }))
  },
  {
    key: "avoid",
    title: "피하고 싶은 것은?",
    type: "multi",
    choices: ["혼잡", "긴 이동", "비싼 식당", "관광지", "야외 위주"].map((item) => ({ value: item, label: item }))
  }
];

const defaults: SurveyAnswers = {
  travelWindow: "이번 봄",
  tripLength: "2n3d",
  budget: "300k-700k",
  companions: "partner",
  pace: "balanced",
  walkingLimit: "under-10k",
  include: ["바다", "카페", "사진"],
  avoid: ["혼잡"]
};

export function SurveyFlow({ instagramUrl, onComplete }: SurveyFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>(defaults);
  const question = questions[step];
  const progress = Math.min(92, 24 + step * 9);

  const selectedValues = useMemo(() => {
    const value = answers[question.key];
    return Array.isArray(value) ? value : [String(value)];
  }, [answers, question.key]);

  function setAnswer(value: string) {
    setAnswers((current) => ({ ...current, [question.key]: value }));
  }

  function toggleAnswer(value: string) {
    setAnswers((current) => {
      const existing = current[question.key];
      const list = Array.isArray(existing) ? existing : [];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [question.key]: next };
    });
  }

  function goNext() {
    if (step < questions.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    onComplete({
      ...answers,
      instagramUrl,
      destinationPreference: "recommend",
      tripLength: answers.tripLength as TripLength,
      budget: answers.budget as BudgetBand,
      pace: answers.pace as TravelPace,
      walkingLimit: answers.walkingLimit as WalkingLimit
    });
  }

  return (
    <main className="min-h-screen bg-mist px-5 py-5 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-4">
        <div className="sticky top-4 z-10 grid gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900 shadow-sm">
          <div className="flex items-center justify-between text-[13px] font-extrabold">
            <span>여행 취향 분석 중</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cyan-100">
            <div className="h-full rounded-full bg-cyan-800 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[12px] leading-4">프로필의 장소, 분위기, 활동 신호를 읽고 있어요. 답변할수록 추천이 더 정확해집니다.</p>
        </div>

        <div className="flex items-center justify-between text-[12px] font-bold text-muted">
          <span>질문 {step + 1}/{questions.length}</span>
          <span>약 30초</span>
        </div>

        <article className="grid gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="grid gap-2">
            <h1 className="text-[24px] font-extrabold leading-[30px]">{question.title}</h1>
            {question.helper ? <p className="text-[13px] leading-5 text-muted">{question.helper}</p> : null}
          </div>

          {question.type === "text" ? (
            <input
              value={String(answers[question.key])}
              onChange={(event) => setAnswer(event.target.value)}
              className="h-12 rounded-lg border border-line px-3 text-[15px] outline-none focus:border-cyan-800 focus:ring-2 focus:ring-cyan-100"
            />
          ) : null}

          {question.type !== "text" ? (
            <div className="grid gap-2">
              {question.choices?.map((choice) => {
                const isSelected = selectedValues.includes(choice.value);
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => (question.type === "multi" ? toggleAnswer(choice.value) : setAnswer(choice.value))}
                    className={`grid gap-1 rounded-xl border p-4 text-left transition ${
                      isSelected ? "border-cyan-800 bg-cyan-50 text-cyan-900" : "border-line bg-white text-ink"
                    }`}
                  >
                    <span className="text-[15px] font-extrabold">{choice.label}</span>
                    {choice.helper ? <span className="text-[12px] leading-4 text-muted">{choice.helper}</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </article>

        <button onClick={goNext} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-4 text-[16px] font-extrabold text-white">
          {step === questions.length - 1 ? "결과 만들기" : "다음"}
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </section>
    </main>
  );
}
