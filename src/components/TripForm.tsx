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
      regionPreference: form.get("regionPreference") as TripSurvey["regionPreference"],
      travelRange: form.get("travelRange") as TripSurvey["travelRange"],
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
            <option value="3n4d">3박 4일</option>
            <option value="4plus">4박 이상</option>
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
            <option value="fukuoka">후쿠오카</option>
            <option value="sapporo">삿포로</option>
            <option value="kyoto">교토</option>
            <option value="tokyo">도쿄</option>
            <option value="osaka">오사카</option>
            <option value="kamakura">가마쿠라</option>
            <option value="matsuyama">마쓰야마</option>
            <option value="miyakojima">미야코지마</option>
            <option value="taipei">타이베이</option>
            <option value="tainan">타이난</option>
            <option value="kaohsiung">가오슝</option>
            <option value="bangkok">방콕</option>
            <option value="chiangmai">치앙마이</option>
            <option value="danang">다낭</option>
            <option value="hoian">호이안</option>
            <option value="hanoi">하노이</option>
            <option value="hochiminh">호치민</option>
            <option value="bali">발리</option>
            <option value="cebu">세부</option>
            <option value="kualalumpur">쿠알라룸푸르</option>
            <option value="singapore">싱가포르</option>
            <option value="hongkong">홍콩</option>
            <option value="macau">마카오</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <select name="regionPreference" aria-label="국내/해외 선호" className={selectClass} defaultValue="anywhere">
          <option value="domestic">국내 여행만</option>
          <option value="overseas">해외 여행 선호</option>
          <option value="anywhere">국내/해외 모두</option>
        </select>
        <select name="travelRange" aria-label="이동 허용 범위" className={selectClass} defaultValue="short-flight">
          <option value="nearby">기차/차 3시간 이내</option>
          <option value="short-flight">2-4시간 비행까지</option>
          <option value="long-flight">5시간 이상 비행 가능</option>
          <option value="anywhere">이동 시간 상관없음</option>
        </select>
        <select name="budget" aria-label="예산" className={selectClass} defaultValue="300k-700k">
          <option value="under-100k">10만원 이하</option>
          <option value="100k-300k">10만-30만원</option>
          <option value="300k-700k">30만-70만원</option>
          <option value="700k-1200k">70만-120만원</option>
          <option value="over-1200k">120만원 이상</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <select name="companions" aria-label="동행" className={selectClass} defaultValue="partner">
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
