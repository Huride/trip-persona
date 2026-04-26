# TripPersona Implementation Progress

## 2026-04-26

Implemented:
- Next.js app scaffold with TypeScript and Tailwind.
- Shared travel survey, destination, persona, concept, and itinerary types.
- Seed destination set for 서울, 제주, 부산, 목포, 남해, 일본 주요 도시, 대만 주요 도시, 동남아 주요 도시, 싱가포르, 홍콩, 마카오.
- Deterministic destination scoring with Vitest coverage.
- Sample Instagram profile fallback analysis for cafe/gallery, ocean/nature, and food/city profiles.
- Gemini prompt builders and server-side Gemini helper with fallback behavior.
- Gemini model updated to `gemini-3-flash-preview`; helper now reads `GEMINI_API_KEY` and any numbered fallback slots in numeric order without exposing keys to the browser.
- Best-effort Instagram ingestion using Playwright with sample fallback.
- Instagram live ingestion now rejects login-wall/short unusable text and selects a varied deterministic sample fallback instead of always using the cafe/gallery profile.
- Instagram ingestion now first parses public SEO metadata (`og:title`, `og:description`) with a crawler user-agent, so accessible public profiles can produce `source: live` without falling back to samples.
- Instagram SEO `og:image` is returned as profile evidence imagery and shown on the persona reveal screen.
- Persona titles and summaries are normalized to Korean for display, including Gemini English outputs.
- `/api/analyze` endpoint that combines ingestion, persona analysis, ranking, concepts, and itinerary.
- Mobile staged workflow for profile entry, analysis survey, finalizing, persona reveal, and destination recommendations.
- Profile analysis now starts immediately after the Instagram link is submitted, while the survey continues in parallel.
- Survey can be skipped; skipped runs send `surveySkipped` and rank destinations from Instagram persona signals instead of survey defaults.
- Survey now asks domestic/overseas preference and acceptable travel range.
- Destination-specific recommendation plans with photo, transport, stays, restaurants, photo spots, and day-by-day itinerary without repeating the same stop within a day.
- Survey now uses travel month chips and optional include/avoid chips without default selections; walking and domestic/overseas questions were folded into trip density and travel range.
- Destination plans now keep a curated city/place set, then use Gemini as a bounded enrichment layer for recommendation copy, weather notes, business slot explanations, and day-by-day itinerary rationale.
- Destination recommendation cards now include travel-month weather advice, preparation items, cautions, flight/transport, stay, leisure, food, and photo commerce slots.
- Day-by-day itinerary UI now uses Day chips and shows one selected date at a time with concrete place names, area/duration labels, and Google Maps links.
- Persona reveal now explains Instagram-derived profile evidence, atmosphere, pace, crowd sensitivity, and recommendation evidence instead of showing ambiguous floating tags.
- Survey progress now communicates AI taste analysis status; final analysis screen uses a circular loading state with animated status text.
- YDS-inspired cyan UI refresh for a more practical dev MVP surface.
- Demo script for reliable judging runs.

Verification:
- `npm test`: 10 files, 34 tests passed.
- `npm run build`: production build passed.
- API smoke: `profile-analysis` starts first, then `/api/analyze` combines profile analysis with survey answers; 3박 4일 produces 4 daily plans.
- Browser smoke: mobile sample submission completes entry, survey, persona reveal, and recommendations without horizontal overflow.
- Browser smoke: mobile survey-skip path reaches recommendations without horizontal overflow.
- Browser smoke: `sample:ocean-nature` with 8월 survey reaches persona reveal and recommendations; Day chip switching updates the itinerary, weather advice is shown, and Google Maps links are present.
- Live Instagram smoke: `https://www.instagram.com/beautifuldestinations/` returns `source: live`, a Korean persona title, and at least one evidence image.
- Gemini key check: 9 configured keys checked; 3 usable. Usable keys were promoted to `GEMINI_API_KEY`, `GEMINI_API_KEY_1`, and `GEMINI_API_KEY_2`; expired/leaked keys were removed from local env files.
- Instagram crawler check: public Instagram profile returned a login wall in this environment; app falls back to deterministic sample analysis.

Demo inputs:
- `sample:cafe-gallery`
- `sample:ocean-nature`
- `sample:food-city`
