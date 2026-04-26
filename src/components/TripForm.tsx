"use client";

import { Link, Sparkles } from "lucide-react";
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

  const inputClass = "h-11 rounded-lg border border-line bg-white px-3 text-[14px] outline-none transition placeholder:text-neutral-400 focus:border-cyan-800 focus:ring-2 focus:ring-cyan-100";
  const selectClass = `${inputClass} appearance-none`;
  const chipClass = "inline-flex min-h-9 items-center rounded-full border border-line bg-white px-3 text-[14px] text-ink transition hover:border-cyan-200 hover:bg-cyan-50 has-[:checked]:border-cyan-800 has-[:checked]:bg-cyan-50 has-[:checked]:text-cyan-900";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="grid gap-2">
        <div className="flex items-center gap-2 text-[18px] font-bold leading-5">
          <Link aria-hidden="true" size={18} className="text-cyan-800" />
          프로필과 여행 조건
        </div>
        <p className="text-[14px] leading-5 text-muted">분석 중 입력받을 정보를 한 화면에 모았습니다. 실제 Instagram URL 또는 샘플 값을 넣을 수 있습니다.</p>
      </div>

      <label className="grid gap-2 text-[14px] font-bold">
        Instagram profile URL
        <input name="instagramUrl" className={inputClass} placeholder="https://www.instagram.com/username 또는 sample:cafe-gallery" />
        <span className="text-[12px] font-normal leading-4 text-muted">
          데모 입력: <span className="font-medium text-cyan-900">sample:cafe-gallery</span>, <span className="font-medium text-cyan-900">sample:ocean-nature</span>, <span className="font-medium text-cyan-900">sample:food-city</span>
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-[14px] font-bold">
          여행 시기
          <input name="travelWindow" className={inputClass} defaultValue="이번 봄" />
        </label>
        <label className="grid gap-2 text-[14px] font-bold">
          일정
          <select name="tripLength" className={selectClass} defaultValue="1n2d">
            <option value="day-trip">당일치기</option>
            <option value="1n2d">1박 2일</option>
            <option value="2n3d">2박 3일</option>
          </select>
        </label>
        <label className="grid gap-2 text-[14px] font-bold">
          목적지
          <select name="destinationPreference" className={selectClass} defaultValue="recommend">
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
        <select name="budget" aria-label="예산" className={selectClass} defaultValue="medium">
          <option value="low">낮은 예산</option>
          <option value="medium">중간 예산</option>
          <option value="high">높은 예산</option>
        </select>
        <select name="companions" aria-label="동행" className={selectClass} defaultValue="solo">
          <option value="solo">혼자</option>
          <option value="partner">연인</option>
          <option value="friends">친구</option>
          <option value="family">가족</option>
          <option value="parents">부모님</option>
        </select>
        <select name="pace" aria-label="여행 템포" className={selectClass} defaultValue="balanced">
          <option value="slow">여유롭게</option>
          <option value="balanced">보통</option>
          <option value="packed">빡빡하게</option>
        </select>
        <select name="walkingLimit" aria-label="도보 허용 범위" className={selectClass} defaultValue="under-10k">
          <option value="under-5k">5천 보 이하</option>
          <option value="under-10k">1만 보 이하</option>
          <option value="no-limit">많이 걸어도 됨</option>
        </select>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-[14px] font-bold">포함하고 싶은 것</legend>
        <div className="flex flex-wrap gap-2">
          {["카페", "맛집", "사진", "전시", "쇼핑", "자연", "바다", "로컬", "휴식"].map((item) => (
            <label key={item} className={chipClass}>
              <input type="checkbox" name="include" value={item} className="mr-2 accent-cyan-800" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="text-[14px] font-bold">피하고 싶은 것</legend>
        <div className="flex flex-wrap gap-2">
          {["혼잡", "긴 이동", "비싼 식당", "관광지", "야외 위주"].map((item) => (
            <label key={item} className={chipClass}>
              <input type="checkbox" name="avoid" value={item} className="mr-2 accent-cyan-800" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-4 py-3 text-[16px] font-bold text-white transition hover:bg-cyan-900 disabled:bg-neutral-100 disabled:text-neutral-400"
      >
        <Sparkles aria-hidden="true" size={18} />
        {isLoading ? "분석 중..." : "TripPersona 생성"}
      </button>
    </form>
  );
}
