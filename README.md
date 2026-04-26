# TripPersona

TripPersona is a hackathon MVP concept for turning an Instagram profile's public travel taste signals into a realistic trip plan.

The product analyzes an Instagram profile URL, asks for trip constraints while analysis runs, then generates:

- a travel persona
- top destination recommendations
- three trip concepts
- a practical itinerary with rationale and Plan B options

## Current Status

This repository contains a working Next.js MVP with deterministic fallback demos, a server-side Gemini integration, and a best-effort Instagram ingestion path.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Reliable demo inputs:

- `sample:cafe-gallery`
- `sample:ocean-nature`
- `sample:food-city`

Verification:

```bash
npm test
npm run build
```

## Docs

- [Hackathon guide summary](./CMUX_x_AIM_Hackathon_Guide_정리.md)
- [TripPersona design spec](./docs/superpowers/specs/2026-04-26-trippersona-design.md)
- [TripPersona implementation plan](./docs/superpowers/plans/2026-04-26-trippersona.md)
- [Implementation progress](./docs/implementation-progress.md)
- [Demo script](./docs/demo-script.md)

## Safety Notes

The app should only analyze public or user-authorized Instagram profile content for travel-relevant taste signals. It should not infer sensitive personal traits.

Local API keys belong in `.env.local`, which is intentionally ignored by Git.
