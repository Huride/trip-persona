"use client";

import { Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import type { TripSurvey } from "@/src/lib/types";

interface TripFormProps {
  onSubmit: (survey: TripSurvey) => void;
  isLoading: boolean;
}

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      instagramUrl: String(form.get("instagramUrl") || "sample:cafe-gallery"),
      travelWindow: String(form.get("travelWindow") || "이번 봄"),
      tripLength: form.get("tripLength") as TripSurvey["tripLength"],
      destinationPreference: form.get("destinationPreference") as TripSurvey["destinationPreference"],
      budget: form.get("budget") as TripSurvey["budget"],
      companions: form.get("companions") as TripSurvey["companions"],
      pace: form.get("pace") as TripSurvey["pace"],
      walkingLimit: form.get("walkingLimit") as TripSurvey["walkingLimit"],
      include: form.getAll("include").map(String),
      avoid: form.getAll("avoid").map(String)
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <label className="grid gap-2 text-sm font-medium">
        Instagram profile URL
        <input
          name="instagramUrl"
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
          placeholder="https://www.instagram.com/username 또는 sample:cafe-gallery"
        />
        <span className="text-xs font-normal text-neutral-500">
          데모가 필요하면 sample:cafe-gallery, sample:ocean-nature, sample:food-city 중 하나를 입력하세요.
        </span>
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          여행 시기
          <input name="travelWindow" className="rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20" defaultValue="이번 봄" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          일정
          <select name="tripLength" className="rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20" defaultValue="1n2d">
            <option value="day-trip">당일치기</option>
            <option value="1n2d">1박 2일</option>
            <option value="2n3d">2박 3일</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          목적지
          <select name="destinationPreference" className="rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20" defaultValue="recommend">
            <option value="recommend">추천받기</option>
            <option value="seoul">서울</option>
            <option value="jeju">제주</option>
            <option value="busan">부산</option>
            <option value="mokpo">목포</option>
            <option value="namhae">남해</option>
            <option value="tokyo">도쿄</option>
            <option value="osaka">오사카</option>
            <option value="kamakura">가마쿠라</option>
            <option value="matsuyama">마쓰야마</option>
            <option value="miyakojima">미야코지마</option>
            <option value="kaohsiung">가오슝</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <select name="budget" aria-label="예산" className="rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20" defaultValue="medium">
          <option value="low">낮은 예산</option>
          <option value="medium">중간 예산</option>
          <option value="high">높은 예산</option>
        </select>
        <select name="companions" aria-label="동행" className="rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20" defaultValue="solo">
          <option value="solo">혼자</option>
          <option value="partner">연인</option>
          <option value="friends">친구</option>
          <option value="family">가족</option>
          <option value="parents">부모님</option>
        </select>
        <select name="pace" aria-label="여행 템포" className="rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20" defaultValue="balanced">
          <option value="slow">여유롭게</option>
          <option value="balanced">보통</option>
          <option value="packed">빡빡하게</option>
        </select>
        <select name="walkingLimit" aria-label="도보 허용 범위" className="rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20" defaultValue="under-10k">
          <option value="under-5k">5천 보 이하</option>
          <option value="under-10k">1만 보 이하</option>
          <option value="no-limit">많이 걸어도 됨</option>
        </select>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">포함하고 싶은 것</legend>
        <div className="flex flex-wrap gap-2 text-sm">
          {["카페", "맛집", "사진", "전시", "쇼핑", "자연", "바다", "로컬", "휴식"].map((item) => (
            <label key={item} className="rounded-full border border-neutral-300 px-3 py-1">
              <input type="checkbox" name="include" value={item} className="mr-2" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">피하고 싶은 것</legend>
        <div className="flex flex-wrap gap-2 text-sm">
          {["혼잡", "긴 이동", "비싼 식당", "관광지", "야외 위주"].map((item) => (
            <label key={item} className="rounded-full border border-neutral-300 px-3 py-1">
              <input type="checkbox" name="avoid" value={item} className="mr-2" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        <Sparkles aria-hidden="true" size={18} />
        {isLoading ? "분석 중..." : "TripPersona 생성"}
      </button>
    </form>
  );
}
