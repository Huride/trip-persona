"use client";

import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";

interface ProfileEntryProps {
  onStart: (instagramUrl: string) => void;
}

export function ProfileEntry({ onStart }: ProfileEntryProps) {
  const [instagramUrl, setInstagramUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart(instagramUrl.trim() || "sample:cafe-gallery");
  }

  return (
    <main className="flex min-h-screen items-center bg-mist px-5 py-8 text-ink">
      <section className="mx-auto grid w-full max-w-md gap-8">
        <div className="grid gap-4">
          <p className="w-max rounded-full bg-cyan-100 px-3 py-2 text-[12px] font-extrabold text-cyan-900">AI travel planner</p>
          <h1 className="text-[32px] font-extrabold leading-[38px]">인스타그램 취향으로 여행지를 찾아드릴게요</h1>
          <p className="text-[15px] leading-[22px] text-muted">
            프로필 링크를 입력하면 공개 피드의 취향 신호를 분석해 나에게 맞는 여행지와 일정을 추천합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-2 text-[14px] font-bold">
            Instagram profile URL
            <input
              value={instagramUrl}
              onChange={(event) => setInstagramUrl(event.target.value)}
              className="h-12 rounded-lg border border-line bg-white px-3 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-cyan-800 focus:ring-2 focus:ring-cyan-100"
              placeholder="https://www.instagram.com/username"
            />
          </label>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-4 text-[16px] font-extrabold text-white transition hover:bg-cyan-900">
            취향 분석 시작하기
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}
