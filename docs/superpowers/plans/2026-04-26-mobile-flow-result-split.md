# Mobile Flow Result Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the MVP into a mobile-first staged flow: profile entry, analysis survey, finalizing, persona reveal, and destination recommendations.

**Architecture:** Keep a single Next.js page with a client-side state machine. The API keeps one endpoint but returns richer `destinationPlans` so each recommended destination has photo, transport, stays, restaurants, highlights, and itinerary.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Vitest, Gemini fallback API.

---

## Tasks

- [ ] Extend shared types for longer trip lengths, numeric budget bands, and destination plans.
- [ ] Add deterministic destination plan builder with tests.
- [ ] Update API schema and response to include destination plans.
- [ ] Replace the current single form/result UI with mobile staged components.
- [ ] Verify with tests, build, API smoke, and mobile browser smoke.
