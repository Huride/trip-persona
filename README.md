# TripPersona

TripPersona is a hackathon MVP concept for turning an Instagram profile's public travel taste signals into a realistic trip plan.

The product analyzes an Instagram profile URL, asks for trip constraints while analysis runs, then generates:

- a travel persona
- top destination recommendations
- three trip concepts
- a practical itinerary with rationale and Plan B options

## Current Status

This repository currently contains the product brief, hackathon guide summary, design spec, and implementation plan.

## Docs

- [Hackathon guide summary](./CMUX_x_AIM_Hackathon_Guide_정리.md)
- [TripPersona design spec](./docs/superpowers/specs/2026-04-26-trippersona-design.md)
- [TripPersona implementation plan](./docs/superpowers/plans/2026-04-26-trippersona.md)

## Safety Notes

The app should only analyze public or user-authorized Instagram profile content for travel-relevant taste signals. It should not infer sensitive personal traits.

Local API keys belong in `.env.local`, which is intentionally ignored by Git.
