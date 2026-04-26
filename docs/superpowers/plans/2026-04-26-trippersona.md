# TripPersona Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js MVP that turns an Instagram profile URL plus travel survey answers into a travel persona, destination recommendations, travel concepts, and an itinerary.

**Architecture:** Use a single Next.js app with server-side API routes. The browser owns the guided workflow and rendering; server routes own Instagram ingestion, Gemini calls, structured JSON validation, and fallback sample data.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Gemini API via `@google/genai`, Playwright for best-effort Instagram profile extraction, Vitest for pure logic tests.

---

## File Structure

- Create `package.json`: scripts and dependencies.
- Create `next.config.ts`: minimal Next.js config.
- Create `tsconfig.json`: strict TypeScript config.
- Create `postcss.config.mjs`: Tailwind PostCSS config.
- Create `tailwind.config.ts`: Tailwind content paths.
- Create `app/layout.tsx`: root document shell.
- Create `app/page.tsx`: main TripPersona client workflow.
- Create `app/globals.css`: global styles and Tailwind imports.
- Create `app/api/analyze/route.ts`: one endpoint that accepts Instagram URL plus survey answers and returns the full recommendation payload.
- Create `src/lib/types.ts`: shared TypeScript types.
- Create `src/lib/sampleProfiles.ts`: demo-safe fallback profile data.
- Create `src/lib/destinations.ts`: curated destination and place seed data.
- Create `src/lib/scoring.ts`: deterministic destination scoring and place filtering helpers.
- Create `src/lib/prompts.ts`: Gemini prompt builders.
- Create `src/lib/gemini.ts`: Gemini client and structured JSON helpers.
- Create `src/lib/instagram.ts`: best-effort Instagram ingestion plus fallback selection.
- Create `src/lib/mockAnalysis.ts`: deterministic local analysis for offline demos.
- Create `src/components/*.tsx`: focused UI components for form, loading state, persona, destinations, concepts, itinerary.
- Create `tests/scoring.test.ts`: destination scoring coverage.
- Create `tests/mockAnalysis.test.ts`: fallback profile analysis coverage.

## Task 1: Scaffold The App

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "trippersona",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@google/genai": "^1.0.0",
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "playwright": "^1.49.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create config files**

`next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

`tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`postcss.config.mjs`

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

`tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        mist: "#f6f7f8",
        coral: "#ff6b5f",
        ocean: "#1d8f9b"
      }
    }
  },
  plugins: []
};

export default config;
```

- [ ] **Step 3: Create app shell**

`app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripPersona",
  description: "Turn your Instagram vibe into a real trip plan."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

`app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #171717;
  background: #f6f7f8;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
}
```

`app/page.tsx`

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist px-5 py-6 text-ink">
      <section className="mx-auto flex max-w-5xl flex-col gap-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-ocean">TripPersona</p>
        <h1 className="text-3xl font-bold">인스타그램 취향을 실제 여행 일정으로 바꿔주는 AI</h1>
        <p className="max-w-2xl text-base text-neutral-600">
          Instagram 프로필 링크를 넣고 여행 조건을 답하면, 여행 페르소나와 목적지 추천, 일정표를 생성합니다.
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` are created.

- [ ] **Step 5: Verify scaffold**

Run:

```bash
npm run build
```

Expected: Next.js production build completes.

## Task 2: Add Shared Types And Seed Data

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/destinations.ts`
- Create: `tests/scoring.test.ts`

- [ ] **Step 1: Create shared types**

`src/lib/types.ts`

```ts
export type DestinationId =
  | "seoul"
  | "jeju"
  | "busan"
  | "mokpo"
  | "namhae"
  | "tokyo"
  | "osaka"
  | "kamakura"
  | "matsuyama"
  | "miyakojima"
  | "kaohsiung";

export type TripLength = "day-trip" | "1n2d" | "2n3d";
export type TravelPace = "slow" | "balanced" | "packed";
export type WalkingLimit = "under-5k" | "under-10k" | "no-limit";
export type BudgetBand = "low" | "medium" | "high";
export type CostLevel = "free" | "low" | "medium" | "high";
export type WalkingLoad = "low" | "medium" | "high";

export interface TripSurvey {
  instagramUrl: string;
  travelWindow: string;
  tripLength: TripLength;
  destinationPreference: DestinationId | "recommend";
  budget: BudgetBand;
  companions: "solo" | "partner" | "friends" | "family" | "parents";
  pace: TravelPace;
  walkingLimit: WalkingLimit;
  include: string[];
  avoid: string[];
}

export interface Place {
  id: string;
  destinationId: DestinationId;
  name: string;
  category: string;
  vibeTags: string[];
  fitTags: string[];
  avoidIf: string[];
  estimatedCost: CostLevel;
  walkingLoad: WalkingLoad;
  bestTime: string[];
  durationMinutes: number;
  description: string;
}

export interface Destination {
  id: DestinationId;
  country: "Korea" | "Japan" | "Taiwan";
  name: string;
  personalityTags: string[];
  summary: string;
}

export interface TravelPersona {
  title: string;
  summary: string;
  tasteTags: string[];
  pace: TravelPace;
  crowdTolerance: "low" | "medium" | "high" | "unknown";
  confidenceNotes: string[];
}

export interface DestinationRecommendation {
  destinationId: DestinationId;
  destinationName: string;
  fitScore: number;
  reason: string;
  tradeOff: string;
}

export interface TravelConcept {
  name: string;
  type: "best-fit" | "unexpected-match" | "low-risk";
  summary: string;
  fitReason: string;
}

export interface ItineraryItem {
  time: string;
  placeName: string;
  activity: string;
  fitRationale: string;
  cost: CostLevel;
  walkingLoad: WalkingLoad;
  planB: string;
}

export interface TripPersonaResult {
  persona: TravelPersona;
  destinations: DestinationRecommendation[];
  concepts: TravelConcept[];
  itinerary: ItineraryItem[];
  whyThisFits: string[];
  excludedPlaces: string[];
}
```

- [ ] **Step 2: Create destination seed data**

`src/lib/destinations.ts`

```ts
import type { Destination, Place } from "./types";

export const destinations: Destination[] = [
  { id: "seoul", country: "Korea", name: "서울", personalityTags: ["urban", "cafes", "gallery", "shopping", "night"], summary: "카페, 전시, 편집숍, 야경이 강한 도시형 여행지" },
  { id: "jeju", country: "Korea", name: "제주", personalityTags: ["nature", "coastal", "drive", "rest", "photo"], summary: "바다, 오름, 드라이브, 휴식에 맞는 자연 여행지" },
  { id: "busan", country: "Korea", name: "부산", personalityTags: ["coastal", "food", "night", "city", "energy"], summary: "바다와 미식, 야경을 함께 즐기는 활기 있는 도시" },
  { id: "mokpo", country: "Korea", name: "목포", personalityTags: ["retro", "harbor", "local-food", "slow", "walk"], summary: "항구, 레트로 감성, 로컬 미식에 강한 느린 여행지" },
  { id: "namhae", country: "Korea", name: "남해", personalityTags: ["quiet", "coastal", "drive", "healing", "nature"], summary: "조용한 바다와 드라이브 중심의 힐링 여행지" },
  { id: "tokyo", country: "Japan", name: "도쿄", personalityTags: ["urban", "design", "cafes", "shopping", "dense"], summary: "취향 밀도가 높은 카페, 쇼핑, 디자인 도시" },
  { id: "osaka", country: "Japan", name: "오사카", personalityTags: ["food", "shopping", "energy", "night", "city"], summary: "미식과 쇼핑, 활기 있는 짧은 여행에 맞는 도시" },
  { id: "kamakura", country: "Japan", name: "가마쿠라", personalityTags: ["coastal", "slow", "walk", "cafes", "photo"], summary: "해변과 산책, 감성 카페가 어울리는 느린 일본 여행지" },
  { id: "matsuyama", country: "Japan", name: "마쓰야마", personalityTags: ["onsen", "retro", "literary", "quiet", "local"], summary: "온천, 문학, 레트로 무드의 조용한 로컬 여행지" },
  { id: "miyakojima", country: "Japan", name: "미야코지마", personalityTags: ["resort", "ocean", "snorkeling", "calm", "nature"], summary: "바다와 휴양, 스노클링에 맞는 고요한 섬 여행지" },
  { id: "kaohsiung", country: "Taiwan", name: "가오슝", personalityTags: ["harbor", "art", "night-market", "warm", "local"], summary: "항구 도시, 예술지구, 야시장이 어울리는 따뜻한 로컬 여행지" }
];

export const places: Place[] = [
  { id: "seoul-seochon", destinationId: "seoul", name: "서촌 골목 산책", category: "walk", vibeTags: ["slow", "urban", "local", "photo"], fitTags: ["solo", "partner", "balanced"], avoidIf: ["packed"], estimatedCost: "free", walkingLoad: "medium", bestTime: ["afternoon"], durationMinutes: 90, description: "조용한 골목과 작은 카페를 함께 즐기는 서울 산책 코스" },
  { id: "seoul-seongsu", destinationId: "seoul", name: "성수 디자인 카페", category: "cafe", vibeTags: ["design", "cafes", "urban", "trendy"], fitTags: ["friends", "partner"], avoidIf: ["crowds"], estimatedCost: "medium", walkingLoad: "low", bestTime: ["morning", "afternoon"], durationMinutes: 75, description: "감각적인 카페와 브랜드 쇼룸을 연결하기 좋은 지역" },
  { id: "jeju-aewol", destinationId: "jeju", name: "애월 해안도로", category: "nature", vibeTags: ["coastal", "drive", "photo", "rest"], fitTags: ["partner", "family", "slow"], avoidIf: ["rain"], estimatedCost: "low", walkingLoad: "low", bestTime: ["sunset"], durationMinutes: 120, description: "바다 풍경과 카페를 여유롭게 즐길 수 있는 드라이브 코스" },
  { id: "busan-huinnyeoul", destinationId: "busan", name: "흰여울문화마을", category: "walk", vibeTags: ["coastal", "photo", "local", "walk"], fitTags: ["solo", "friends"], avoidIf: ["low-walking"], estimatedCost: "low", walkingLoad: "medium", bestTime: ["afternoon"], durationMinutes: 90, description: "바다와 골목 감성이 함께 있는 부산 대표 산책지" },
  { id: "mokpo-modern", destinationId: "mokpo", name: "목포 근대역사거리", category: "culture", vibeTags: ["retro", "local", "walk", "history"], fitTags: ["solo", "parents", "slow"], avoidIf: ["packed"], estimatedCost: "low", walkingLoad: "medium", bestTime: ["morning"], durationMinutes: 120, description: "레트로한 항구 도시 무드를 느낄 수 있는 목포 코스" },
  { id: "namhae-german", destinationId: "namhae", name: "남해 독일마을", category: "view", vibeTags: ["coastal", "quiet", "drive", "photo"], fitTags: ["family", "parents", "slow"], avoidIf: ["no-car"], estimatedCost: "low", walkingLoad: "medium", bestTime: ["afternoon"], durationMinutes: 90, description: "남해 바다 풍경과 조용한 마을 분위기를 함께 볼 수 있는 장소" },
  { id: "tokyo-daikanyama", destinationId: "tokyo", name: "다이칸야마 서점과 카페", category: "shopping", vibeTags: ["design", "cafes", "urban", "bookstore"], fitTags: ["solo", "partner", "balanced"], avoidIf: ["low-budget"], estimatedCost: "medium", walkingLoad: "medium", bestTime: ["afternoon"], durationMinutes: 120, description: "도쿄의 디자인 감도와 여유로운 카페 시간을 함께 느끼는 지역" },
  { id: "osaka-namba", destinationId: "osaka", name: "난바 미식 산책", category: "food", vibeTags: ["food", "energy", "night", "city"], fitTags: ["friends", "packed"], avoidIf: ["crowds"], estimatedCost: "medium", walkingLoad: "medium", bestTime: ["evening"], durationMinutes: 120, description: "오사카다운 활기와 음식을 압축적으로 경험하는 코스" },
  { id: "kamakura-yuigahama", destinationId: "kamakura", name: "유이가하마 해변", category: "nature", vibeTags: ["slow", "coastal", "calm", "photo", "walk"], fitTags: ["solo", "partner", "slow"], avoidIf: ["rain"], estimatedCost: "low", walkingLoad: "medium", bestTime: ["afternoon", "sunset"], durationMinutes: 90, description: "느린 해변 산책과 사진 취향에 맞는 가마쿠라 코스" },
  { id: "matsuyama-dogo", destinationId: "matsuyama", name: "도고온천 거리", category: "onsen", vibeTags: ["onsen", "retro", "quiet", "local"], fitTags: ["parents", "partner", "slow"], avoidIf: ["hot-weather"], estimatedCost: "medium", walkingLoad: "low", bestTime: ["evening"], durationMinutes: 120, description: "온천과 오래된 거리 분위기를 함께 즐기는 마쓰야마 핵심 코스" },
  { id: "miyakojima-yonaha", destinationId: "miyakojima", name: "요나하 마에하마 비치", category: "beach", vibeTags: ["ocean", "resort", "calm", "rest"], fitTags: ["partner", "family", "slow"], avoidIf: ["rain"], estimatedCost: "free", walkingLoad: "low", bestTime: ["morning"], durationMinutes: 120, description: "휴식형 여행자에게 잘 맞는 맑은 바다 중심 코스" },
  { id: "kaohsiung-pier2", destinationId: "kaohsiung", name: "보얼예술특구", category: "art", vibeTags: ["art", "harbor", "local", "photo"], fitTags: ["solo", "friends", "balanced"], avoidIf: ["rain"], estimatedCost: "low", walkingLoad: "medium", bestTime: ["afternoon"], durationMinutes: 120, description: "항구 도시의 예술지구와 로컬 분위기를 함께 느끼는 장소" }
];
```

- [ ] **Step 3: Verify TypeScript imports**

Run:

```bash
npm run build
```

Expected: build passes or fails only because later imports are not yet created. If it fails on `src/lib/destinations.ts`, fix the type mismatch before continuing.

## Task 3: Add Deterministic Scoring

**Files:**
- Create: `src/lib/scoring.ts`
- Create: `tests/scoring.test.ts`

- [ ] **Step 1: Write scoring tests**

`tests/scoring.test.ts`

```ts
import { describe, expect, it } from "vitest";
import type { TravelPersona, TripSurvey } from "../src/lib/types";
import { rankDestinations } from "../src/lib/scoring";

const persona: TravelPersona = {
  title: "Slow coastal cafe traveler",
  summary: "Likes calm coastal places and cafes.",
  tasteTags: ["coastal", "cafes", "slow", "photo"],
  pace: "slow",
  crowdTolerance: "low",
  confidenceNotes: ["sample profile"]
};

const survey: TripSurvey = {
  instagramUrl: "https://www.instagram.com/sample",
  travelWindow: "spring",
  tripLength: "1n2d",
  destinationPreference: "recommend",
  budget: "medium",
  companions: "partner",
  pace: "slow",
  walkingLimit: "under-10k",
  include: ["카페", "사진", "바다"],
  avoid: ["혼잡"]
};

describe("rankDestinations", () => {
  it("returns three ranked destinations", () => {
    const result = rankDestinations(persona, survey);
    expect(result).toHaveLength(3);
    expect(result[0].fitScore).toBeGreaterThanOrEqual(result[1].fitScore);
  });

  it("respects explicit destination preference", () => {
    const result = rankDestinations(persona, { ...survey, destinationPreference: "jeju" });
    expect(result[0].destinationId).toBe("jeju");
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm test -- tests/scoring.test.ts
```

Expected: FAIL because `src/lib/scoring.ts` does not exist.

- [ ] **Step 3: Implement scoring**

`src/lib/scoring.ts`

```ts
import { destinations } from "./destinations";
import type { DestinationRecommendation, TravelPersona, TripSurvey } from "./types";

const surveyKeywordMap: Record<string, string[]> = {
  "카페": ["cafes", "coffee"],
  "맛집": ["food", "local-food"],
  "사진": ["photo"],
  "전시": ["gallery", "art", "design"],
  "쇼핑": ["shopping"],
  "자연": ["nature", "coastal"],
  "바다": ["coastal", "ocean", "beach"],
  "로컬": ["local", "local-food"],
  "휴식": ["rest", "healing", "quiet"]
};

export function rankDestinations(persona: TravelPersona, survey: TripSurvey): DestinationRecommendation[] {
  const explicit = survey.destinationPreference !== "recommend" ? survey.destinationPreference : null;
  const desiredTags = new Set<string>([
    ...persona.tasteTags,
    survey.pace,
    ...survey.include.flatMap((item) => surveyKeywordMap[item] ?? [])
  ]);

  const ranked = destinations.map((destination) => {
    const matches = destination.personalityTags.filter((tag) => desiredTags.has(tag));
    const explicitBoost = explicit === destination.id ? 100 : 0;
    const fitScore = Math.min(100, explicitBoost + 50 + matches.length * 10);
    const reason = matches.length
      ? `${matches.join(", ")} 취향 신호와 잘 맞습니다.`
      : "명시 조건과 기본 여행 성향을 기준으로 무난하게 맞습니다.";
    const tradeOff = destination.personalityTags.includes("urban")
      ? "도시형 여행지는 혼잡도가 높을 수 있습니다."
      : "자연형 여행지는 이동 시간이 길어질 수 있습니다.";

    return {
      destinationId: destination.id,
      destinationName: destination.name,
      fitScore,
      reason,
      tradeOff
    };
  });

  return ranked.sort((a, b) => b.fitScore - a.fitScore).slice(0, 3);
}
```

- [ ] **Step 4: Run scoring tests**

Run:

```bash
npm test -- tests/scoring.test.ts
```

Expected: PASS.

## Task 4: Add Sample Profiles And Offline Analysis

**Files:**
- Create: `src/lib/sampleProfiles.ts`
- Create: `src/lib/mockAnalysis.ts`
- Create: `tests/mockAnalysis.test.ts`

- [ ] **Step 1: Write fallback analysis tests**

`tests/mockAnalysis.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { analyzeSampleProfile } from "../src/lib/mockAnalysis";

describe("analyzeSampleProfile", () => {
  it("returns a travel persona from a sample profile", () => {
    const result = analyzeSampleProfile("cafe-gallery");
    expect(result.title).toContain("Urban");
    expect(result.tasteTags).toContain("cafes");
  });

  it("falls back to cafe-gallery for unknown samples", () => {
    const result = analyzeSampleProfile("unknown");
    expect(result.tasteTags.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run failing fallback test**

Run:

```bash
npm test -- tests/mockAnalysis.test.ts
```

Expected: FAIL because `mockAnalysis.ts` does not exist.

- [ ] **Step 3: Create sample profile data**

`src/lib/sampleProfiles.ts`

```ts
export interface SampleProfile {
  id: string;
  label: string;
  bio: string;
  captions: string[];
  hashtags: string[];
  imageDescriptions: string[];
}

export const sampleProfiles: SampleProfile[] = [
  {
    id: "cafe-gallery",
    label: "Cafe Gallery Profile",
    bio: "coffee, books, small galleries, quiet weekends",
    captions: ["서촌에서 발견한 작은 전시", "햇빛 좋은 카페에서 오후 보내기", "사람 적은 골목이 좋다"],
    hashtags: ["cafe", "gallery", "slowday", "seoulwalk"],
    imageDescriptions: ["minimal cafe interior", "small gallery wall", "quiet alley with warm light"]
  },
  {
    id: "ocean-nature",
    label: "Ocean Nature Profile",
    bio: "sea, islands, slow mornings, no rush",
    captions: ["바다 보면서 아무것도 안 하기", "흐린 날에도 좋은 해안도로", "많이 걷지 않아도 되는 여행"],
    hashtags: ["ocean", "island", "slowtravel", "healing"],
    imageDescriptions: ["blue ocean", "coastal road", "quiet beach"]
  },
  {
    id: "food-city",
    label: "Food City Profile",
    bio: "local food, night markets, city energy",
    captions: ["여행은 결국 맛집 기억", "야시장과 골목 사이", "짧아도 밀도 있게"],
    hashtags: ["food", "nightmarket", "citytrip", "local"],
    imageDescriptions: ["street food", "busy night street", "small local restaurant"]
  }
];
```

- [ ] **Step 4: Implement offline analysis**

`src/lib/mockAnalysis.ts`

```ts
import { sampleProfiles } from "./sampleProfiles";
import type { TravelPersona } from "./types";

export function analyzeSampleProfile(sampleId: string): TravelPersona {
  const profile = sampleProfiles.find((item) => item.id === sampleId) ?? sampleProfiles[0];
  const text = `${profile.bio} ${profile.captions.join(" ")} ${profile.hashtags.join(" ")} ${profile.imageDescriptions.join(" ")}`.toLowerCase();

  if (text.includes("ocean") || text.includes("바다") || text.includes("island")) {
    return {
      title: "Slow Coastal Rest Traveler",
      summary: "바다와 휴식, 낮은 이동 강도를 선호하는 여행자입니다.",
      tasteTags: ["coastal", "ocean", "slow", "rest", "photo"],
      pace: "slow",
      crowdTolerance: "low",
      confidenceNotes: ["sample profile: ocean-nature"]
    };
  }

  if (text.includes("food") || text.includes("맛집") || text.includes("night")) {
    return {
      title: "Dense City Food Explorer",
      summary: "로컬 미식과 도시 에너지를 짧고 밀도 있게 즐기는 여행자입니다.",
      tasteTags: ["food", "local-food", "city", "night", "packed"],
      pace: "packed",
      crowdTolerance: "medium",
      confidenceNotes: ["sample profile: food-city"]
    };
  }

  return {
    title: "Slow Urban Cafe Gallery Traveler",
    summary: "조용한 골목, 카페, 전시를 선호하는 도시형 여행자입니다.",
    tasteTags: ["cafes", "gallery", "slow", "urban", "design"],
    pace: "slow",
    crowdTolerance: "low",
    confidenceNotes: ["sample profile: cafe-gallery"]
  };
}
```

- [ ] **Step 5: Run fallback tests**

Run:

```bash
npm test -- tests/mockAnalysis.test.ts
```

Expected: PASS.

## Task 5: Add Gemini And Prompt Builders

**Files:**
- Create: `src/lib/prompts.ts`
- Create: `src/lib/gemini.ts`

- [ ] **Step 1: Create prompt builders**

`src/lib/prompts.ts`

```ts
import type { DestinationRecommendation, TravelPersona, TripSurvey } from "./types";

export function buildPersonaPrompt(profileText: string): string {
  return `
You are TripPersona. Analyze only travel-relevant taste from public Instagram profile content.
Do not infer sensitive traits.

Profile content:
${profileText}

Return JSON with:
title, summary, tasteTags, pace, crowdTolerance, confidenceNotes.
`.trim();
}

export function buildConceptPrompt(persona: TravelPersona, survey: TripSurvey, destinations: DestinationRecommendation[]): string {
  return `
Create three travel concepts for this user.

Persona:
${JSON.stringify(persona)}

Survey:
${JSON.stringify(survey)}

Recommended destinations:
${JSON.stringify(destinations)}

Return JSON array with three objects:
name, type ("best-fit" | "unexpected-match" | "low-risk"), summary, fitReason.
`.trim();
}

export function buildItineraryPrompt(input: unknown): string {
  return `
Create a practical itinerary using only the provided seed places.
Do not invent places.
Return JSON with itinerary, whyThisFits, excludedPlaces.

Input:
${JSON.stringify(input)}
`.trim();
}
```

- [ ] **Step 2: Create Gemini helper**

`src/lib/gemini.ts`

```ts
import { GoogleGenAI } from "@google/genai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env.local");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateJson<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text;
    if (!text) return fallback;
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}
```

- [ ] **Step 3: Verify TypeScript**

Run:

```bash
npm run build
```

Expected: build may still fail if UI imports are not complete, but `prompts.ts` and `gemini.ts` should typecheck.

## Task 6: Add Instagram Ingestion

**Files:**
- Create: `src/lib/instagram.ts`

- [ ] **Step 1: Implement ingestion with fallback**

`src/lib/instagram.ts`

```ts
import { chromium } from "playwright";
import { sampleProfiles } from "./sampleProfiles";

export interface InstagramProfileContent {
  source: "live" | "sample" | "pasted";
  username: string;
  profileText: string;
}

export async function ingestInstagramProfile(instagramUrl: string): Promise<InstagramProfileContent> {
  if (instagramUrl.startsWith("sample:")) {
    const sampleId = instagramUrl.replace("sample:", "");
    const sample = sampleProfiles.find((item) => item.id === sampleId) ?? sampleProfiles[0];
    return {
      source: "sample",
      username: sample.id,
      profileText: [
        sample.bio,
        ...sample.captions,
        ...sample.hashtags,
        ...sample.imageDescriptions
      ].join("\n")
    };
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(instagramUrl, { waitUntil: "domcontentloaded", timeout: 12000 });
    await page.waitForTimeout(2500);
    const text = await page.locator("body").innerText({ timeout: 3000 });
    await browser.close();
    return {
      source: "live",
      username: extractUsername(instagramUrl),
      profileText: text.slice(0, 8000)
    };
  } catch {
    const sample = sampleProfiles[0];
    return {
      source: "sample",
      username: sample.id,
      profileText: [
        sample.bio,
        ...sample.captions,
        ...sample.hashtags,
        ...sample.imageDescriptions
      ].join("\n")
    };
  }
}

function extractUsername(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").filter(Boolean)[0] ?? "instagram";
  } catch {
    return "instagram";
  }
}
```

- [ ] **Step 2: Verify ingestion compiles**

Run:

```bash
npm run build
```

Expected: no TypeScript errors in `src/lib/instagram.ts`.

## Task 7: Add API Route

**Files:**
- Create: `app/api/analyze/route.ts`

- [ ] **Step 1: Implement API route**

`app/api/analyze/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { places } from "@/src/lib/destinations";
import { generateJson } from "@/src/lib/gemini";
import { ingestInstagramProfile } from "@/src/lib/instagram";
import { analyzeSampleProfile } from "@/src/lib/mockAnalysis";
import { buildConceptPrompt, buildItineraryPrompt, buildPersonaPrompt } from "@/src/lib/prompts";
import { rankDestinations } from "@/src/lib/scoring";
import type { ItineraryItem, TravelConcept, TravelPersona, TripSurvey } from "@/src/lib/types";

const surveySchema = z.object({
  instagramUrl: z.string().min(1),
  travelWindow: z.string().min(1),
  tripLength: z.enum(["day-trip", "1n2d", "2n3d"]),
  destinationPreference: z.union([
    z.enum(["seoul", "jeju", "busan", "mokpo", "namhae", "tokyo", "osaka", "kamakura", "matsuyama", "miyakojima", "kaohsiung"]),
    z.literal("recommend")
  ]),
  budget: z.enum(["low", "medium", "high"]),
  companions: z.enum(["solo", "partner", "friends", "family", "parents"]),
  pace: z.enum(["slow", "balanced", "packed"]),
  walkingLimit: z.enum(["under-5k", "under-10k", "no-limit"]),
  include: z.array(z.string()),
  avoid: z.array(z.string())
});

export async function POST(request: Request) {
  const body = await request.json();
  const survey = surveySchema.parse(body) as TripSurvey;
  const ingested = await ingestInstagramProfile(survey.instagramUrl);

  const fallbackPersona = survey.instagramUrl.startsWith("sample:")
    ? analyzeSampleProfile(survey.instagramUrl.replace("sample:", ""))
    : analyzeSampleProfile("cafe-gallery");

  const persona = await generateJson<TravelPersona>(
    buildPersonaPrompt(ingested.profileText),
    fallbackPersona
  );

  const destinations = rankDestinations(persona, survey);
  const concepts = await generateJson<TravelConcept[]>(
    buildConceptPrompt(persona, survey, destinations),
    [
      { name: "Best Fit", type: "best-fit", summary: "취향과 조건에 가장 잘 맞는 일정입니다.", fitReason: "프로필 취향과 설문 조건을 함께 반영했습니다." },
      { name: "Unexpected Match", type: "unexpected-match", summary: "취향을 살짝 확장한 의외의 선택입니다.", fitReason: "기존 취향과 연결되는 새로운 분위기를 제안합니다." },
      { name: "Low-Risk Plan", type: "low-risk", summary: "동선과 비용 리스크를 줄인 안정적인 일정입니다.", fitReason: "피로도와 예산을 우선했습니다." }
    ]
  );

  const selectedDestinationId = destinations[0].destinationId;
  const seedPlaces = places.filter((place) => place.destinationId === selectedDestinationId);
  const itineraryPayload = await generateJson<{
    itinerary: ItineraryItem[];
    whyThisFits: string[];
    excludedPlaces: string[];
  }>(
    buildItineraryPrompt({ persona, survey, destination: destinations[0], concept: concepts[0], seedPlaces }),
    {
      itinerary: seedPlaces.slice(0, 3).map((place, index) => ({
        time: ["10:00", "13:00", "16:00"][index] ?? "18:00",
        placeName: place.name,
        activity: place.description,
        fitRationale: `${place.vibeTags.join(", ")} 취향과 맞습니다.`,
        cost: place.estimatedCost,
        walkingLoad: place.walkingLoad,
        planB: "혼잡하거나 날씨가 좋지 않으면 가까운 카페/실내 장소로 대체하세요."
      })),
      whyThisFits: ["인스타그램 취향 신호와 설문 조건을 함께 반영했습니다."],
      excludedPlaces: ["조건과 맞지 않는 과도한 이동 장소는 제외했습니다."]
    }
  );

  return NextResponse.json({
    persona,
    destinations,
    concepts,
    itinerary: itineraryPayload.itinerary,
    whyThisFits: itineraryPayload.whyThisFits,
    excludedPlaces: itineraryPayload.excludedPlaces,
    source: ingested.source
  });
}
```

- [ ] **Step 2: Verify API build**

Run:

```bash
npm run build
```

Expected: route compiles.

## Task 8: Build The Main UI Workflow

**Files:**
- Modify: `app/page.tsx`
- Create: `src/components/TripForm.tsx`
- Create: `src/components/LoadingAnalysis.tsx`
- Create: `src/components/ResultView.tsx`

- [ ] **Step 1: Create form component**

`src/components/TripForm.tsx`

```tsx
"use client";

import type { TripSurvey } from "@/src/lib/types";

interface TripFormProps {
  onSubmit: (survey: TripSurvey) => void;
  isLoading: boolean;
}

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        <input name="instagramUrl" className="rounded-md border px-3 py-2" placeholder="https://www.instagram.com/username 또는 sample:cafe-gallery" />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          여행 시기
          <input name="travelWindow" className="rounded-md border px-3 py-2" defaultValue="이번 봄" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          일정
          <select name="tripLength" className="rounded-md border px-3 py-2" defaultValue="1n2d">
            <option value="day-trip">당일치기</option>
            <option value="1n2d">1박 2일</option>
            <option value="2n3d">2박 3일</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          목적지
          <select name="destinationPreference" className="rounded-md border px-3 py-2" defaultValue="recommend">
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
        <select name="budget" className="rounded-md border px-3 py-2" defaultValue="medium">
          <option value="low">낮은 예산</option>
          <option value="medium">중간 예산</option>
          <option value="high">높은 예산</option>
        </select>
        <select name="companions" className="rounded-md border px-3 py-2" defaultValue="solo">
          <option value="solo">혼자</option>
          <option value="partner">연인</option>
          <option value="friends">친구</option>
          <option value="family">가족</option>
          <option value="parents">부모님</option>
        </select>
        <select name="pace" className="rounded-md border px-3 py-2" defaultValue="balanced">
          <option value="slow">여유롭게</option>
          <option value="balanced">보통</option>
          <option value="packed">빡빡하게</option>
        </select>
        <select name="walkingLimit" className="rounded-md border px-3 py-2" defaultValue="under-10k">
          <option value="under-5k">5천 보 이하</option>
          <option value="under-10k">1만 보 이하</option>
          <option value="no-limit">많이 걸어도 됨</option>
        </select>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">포함하고 싶은 것</legend>
        <div className="flex flex-wrap gap-2 text-sm">
          {["카페", "맛집", "사진", "전시", "쇼핑", "자연", "바다", "로컬", "휴식"].map((item) => (
            <label key={item} className="rounded-full border px-3 py-1">
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
            <label key={item} className="rounded-full border px-3 py-1">
              <input type="checkbox" name="avoid" value={item} className="mr-2" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <button disabled={isLoading} className="rounded-md bg-ink px-4 py-3 font-semibold text-white disabled:opacity-50">
        {isLoading ? "분석 중..." : "TripPersona 생성"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create loading component**

`src/components/LoadingAnalysis.tsx`

```tsx
export function LoadingAnalysis() {
  return (
    <section className="rounded-lg border border-ocean/20 bg-ocean/5 p-4 text-sm text-ocean">
      Instagram 공개 프로필을 분석하고 여행 조건과 결합하는 중입니다. 크롤링이 막히면 샘플 프로필로 자동 전환됩니다.
    </section>
  );
}
```

- [ ] **Step 3: Create result component**

`src/components/ResultView.tsx`

```tsx
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
            <article key={concept.type} className="rounded-md border p-3">
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
```

- [ ] **Step 4: Wire page state**

Replace `app/page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { LoadingAnalysis } from "@/src/components/LoadingAnalysis";
import { ResultView } from "@/src/components/ResultView";
import { TripForm } from "@/src/components/TripForm";
import type { TripPersonaResult, TripSurvey } from "@/src/lib/types";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TripPersonaResult | null>(null);

  async function handleSubmit(survey: TripSurvey) {
    setIsLoading(true);
    setResult(null);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(survey)
    });
    const data = (await response.json()) as TripPersonaResult;
    setResult(data);
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-mist px-5 py-6 text-ink">
      <section className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean">TripPersona</p>
          <h1 className="max-w-3xl text-4xl font-bold">인스타그램 취향을 실제 여행 일정으로 바꿔주는 AI</h1>
          <p className="max-w-2xl text-base text-neutral-600">
            Instagram 프로필 링크를 넣고 여행 조건을 답하면, 공개 피드의 취향 신호를 여행 페르소나와 일정으로 변환합니다.
          </p>
        </header>
        <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
        {isLoading ? <LoadingAnalysis /> : null}
        {result ? <ResultView result={result} /> : null}
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Verify UI build**

Run:

```bash
npm run build
```

Expected: build passes.

## Task 9: Demo Hardening

**Files:**
- Modify: `app/page.tsx`
- Modify: `src/components/TripForm.tsx`
- Create: `docs/demo-script.md`

- [ ] **Step 1: Add sample helper text to form**

In `TripForm.tsx`, keep the placeholder showing `sample:cafe-gallery`. Add visible helper text under the Instagram input:

```tsx
<p className="text-xs text-neutral-500">
  데모가 필요하면 sample:cafe-gallery, sample:ocean-nature, sample:food-city 중 하나를 입력하세요.
</p>
```

- [ ] **Step 2: Create demo script**

`docs/demo-script.md`

```md
# TripPersona Demo Script

## Demo 1: Cafe Gallery

Input: `sample:cafe-gallery`

Survey:
- Travel window: 이번 봄
- Trip length: 1박 2일
- Destination: 추천받기
- Budget: 중간
- Companion: 혼자
- Pace: 여유롭게
- Walking: 1만 보 이하
- Include: 카페, 전시, 사진
- Avoid: 혼잡

Expected:
- Persona: slow urban cafe/gallery traveler
- Likely destinations: 서울, 도쿄, 가마쿠라
- Itinerary should emphasize cafes, galleries, quiet streets.

## Demo 2: Ocean Nature

Input: `sample:ocean-nature`

Survey:
- Travel window: 여름
- Trip length: 2박 3일
- Destination: 추천받기
- Budget: 중간
- Companion: 연인
- Pace: 여유롭게
- Walking: 5천 보 이하
- Include: 바다, 자연, 휴식
- Avoid: 긴 이동

Expected:
- Persona: slow coastal rest traveler
- Likely destinations: 제주, 남해, 미야코지마
- Itinerary should emphasize coast, rest, low walking load.
```

- [ ] **Step 3: Run final verification**

Run:

```bash
npm test
npm run build
```

Expected: tests pass and production build completes.

## Task 10: Local Run

**Files:**
- No file changes.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: Next.js dev server starts, usually at `http://localhost:3000`.

- [ ] **Step 2: Manual smoke test**

Open the app and run:

1. `sample:cafe-gallery`
2. `sample:ocean-nature`
3. one real Instagram profile URL

Expected:

- sample inputs always return results
- real Instagram URL returns live or fallback result
- no API key appears in browser-visible code
- destination recommendations differ between sample profiles

## Self-Review

Spec coverage:

- Instagram profile URL flow: covered by Task 6 and Task 7.
- Survey during analysis: covered by Task 8.
- Travel persona generation: covered by Task 4, Task 5, Task 7.
- Broad destination set: covered by Task 2.
- Destination ranking: covered by Task 3.
- Concepts and itinerary: covered by Task 5, Task 7, Task 8.
- Demo fallback: covered by Task 4 and Task 9.

Known implementation constraint:

- Live Instagram scraping may fail. The plan intentionally includes sample profiles and fallback behavior so the demo remains reliable.
