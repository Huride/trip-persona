# TripPersona YDS Cyan UI Refresh Design

## Goal

Make the dev MVP feel usable for hackathon judging without changing the core product flow. The app should read as a compact travel-planning tool, not a landing page.

## Visual Direction

- Use a cyan-centered palette based on YDS references: Cyan800 `#1D8BFF` for primary actions, Cyan900 `#006CE0` for hover, Cyan50 `#F2F8FF` and Cyan100 `#E3F0FF` for subtle surfaces.
- Use Neutral palette values for text, borders, and surfaces.
- Use Pretendard first, then system fallbacks.
- Keep type hierarchy close to YDS sizes: 32, 24, 20, 18, 16, 15, 14, 12px.
- Use 8px radius for controls/cards and 12-16px only for major panels.

## Interaction And Layout

- Preserve the single-page workflow: profile URL and survey input, loading state, error state, result.
- Make the first screen a functional console with a compact header and clear form hierarchy.
- Keep demo sample inputs visible because judging may happen without live Instagram access.
- Present results in scan-friendly groups: persona, destination ranking, concepts, itinerary, rationale.

## Constraints

- Do not add auth, persistence, or Supabase yet.
- Do not expose Gemini keys to browser code.
- Keep the API contract unchanged.
- Verify with tests, production build, and a browser smoke check.
