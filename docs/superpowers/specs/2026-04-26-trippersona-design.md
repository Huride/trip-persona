# TripPersona MVP Design

## Goal

Build a hackathon-ready AI travel planner that turns an Instagram profile URL into a travel persona, then combines that persona with explicit trip constraints to recommend destinations, concepts, and an itinerary.

## Product Statement

TripPersona analyzes a user's public Instagram profile to infer travel-relevant taste signals, then asks for practical travel constraints while analysis runs. The app recommends travel concepts and schedules that fit both the user's aesthetic preferences and real-world constraints.

One-line pitch:

> Turn your Instagram vibe into a real trip plan.

Korean pitch:

> 인스타그램 취향을 실제로 갈 수 있는 여행 일정으로 바꿔주는 AI.

## Target Track

Business & Applications.

The product should be positioned as a consumer travel planning app, not a developer tool. The strongest judging angle is that social media already influences travel inspiration, but users still struggle to translate that inspiration into realistic, personalized itineraries.

## Core Problem

People often cannot clearly describe what kind of travel they like. Their Instagram profile, however, already contains signals about visual taste, favorite spaces, food preferences, activity style, and travel pace. Existing travel planners usually ask users to type preferences manually or generate generic itineraries, so they miss this implicit taste data.

TripPersona solves three linked gaps:

1. Taste articulation gap: users do not know how to explain their travel style.
2. Inspiration-to-plan gap: social media inspiration does not become a usable itinerary.
3. Personal-fit gap: popular destinations may not fit the user's budget, pace, walking tolerance, or travel timing.

## Primary User

The primary user is a traveler who has an active Instagram profile and wants a trip that feels personally fitted, not generic.

For the hackathon demo, target users include:

- solo travelers who care about aesthetics and mood
- couples or friends planning a short trip
- people choosing among Korea, Japan, and Taiwan destinations
- judges testing different Instagram profiles to see different results

## MVP User Flow

1. User enters an Instagram profile URL.
2. App starts profile analysis.
3. While analysis is running, user answers trip questions.
4. App extracts a travel persona from the profile data.
5. App combines persona signals with survey constraints.
6. App recommends top 3 destinations from the candidate city list.
7. User selects one destination.
8. App generates three travel concepts for that destination.
9. App generates a detailed itinerary for the best-fit concept.
10. App shows fit rationale, estimated cost, movement load, and Plan B.

## Candidate Destinations

The MVP supports the following destinations:

| Country | Destinations |
|---|---|
| Korea | Seoul, Jeju, Busan, Mokpo, Namhae |
| Japan | Tokyo, Osaka, Kamakura, Matsuyama, Miyakojima |
| Taiwan | Kaohsiung |

The destination list is intentionally broad to produce diverse judge demo results. The depth per destination should stay small for MVP: 8-12 curated seed places per destination.

## Destination Personality

| Destination | Best-fit personas |
|---|---|
| Seoul | cafes, exhibitions, select shops, nightlife, urban walking |
| Jeju | nature, driving, sea, rest, photography |
| Busan | sea, food, night views, energetic city travel |
| Mokpo | retro mood, harbor, local food, slow travel |
| Namhae | quiet nature, driving, sea, healing |
| Tokyo | dense urban taste, shopping, cafes, design |
| Osaka | food, shopping, energy, short dense travel |
| Kamakura | coast, walking, cafes, slow Japan travel |
| Matsuyama | onsen, literature, retro, quiet local travel |
| Miyakojima | resort mood, ocean, snorkeling, calm nature |
| Kaohsiung | harbor city, art districts, night markets, warm local mood |

## Survey Questions

The survey runs while Instagram profile analysis is in progress.

| Question | Input type | Purpose |
|---|---|---|
| When are you traveling? | date range or season | weather and season fit |
| How long is the trip? | day trip, 1 night 2 days, 2 nights 3 days, 3 nights 4 days | itinerary length |
| What is your approximate budget? | preset ranges plus custom | cost fit |
| Who are you traveling with? | solo, partner, friends, family, parents | route and activity suitability |
| How fast do you like to travel? | slow, balanced, packed | schedule density |
| How much walking is okay per day? | under 5k steps, under 10k steps, no limit | movement load |
| What do you want included? | cafes, food, photography, exhibitions, shopping, nature, local spots, rest | explicit preference |
| What do you want to avoid? | crowds, long transfers, expensive restaurants, tourist traps, outdoor-heavy routes | constraint filtering |
| Do you already have a destination in mind? | optional destination picker | direct plan or destination recommendation |

## Instagram Profile Analysis

### Inputs

The user provides an Instagram profile URL. The system attempts best-effort public profile extraction.

The app should extract, when available:

- username
- display name
- bio text
- visible recent post captions
- visible hashtags
- visible location tags
- image URLs or screenshot-like thumbnails from recent posts

### Taste Signals

The AI maps profile content into travel-relevant signals:

| Signal | Examples |
|---|---|
| visual style | minimal, vintage, colorful, luxury, cozy, natural, urban |
| space preference | cafes, galleries, beaches, alleys, markets, hotels, bookstores |
| food preference | desserts, local food, fine dining, street food, wine, coffee |
| activity preference | walking, shopping, exhibitions, nature, nightlife, rest, photography |
| pace | slow, balanced, packed |
| crowd tolerance | avoids crowds, likes hot places, unknown |
| destination tendency | coastal, city, local town, resort, cultural |

### Privacy Boundary

The product must only infer travel-relevant taste. It must not infer protected or sensitive traits such as income level, health status, religion, politics, sexuality, or private relationships.

The UI should describe analysis as:

> We analyze public profile content to infer travel style, not personal identity.

## Data Collection Strategy

Instagram official APIs are not reliable for arbitrary public profiles during a hackathon. Therefore, the MVP uses a layered strategy.

| Layer | Method | Role |
|---|---|---|
| Primary | Playwright opens the public Instagram profile URL and extracts visible content | best live demo path |
| Fallback A | user can paste copied bio/captions if the profile page blocks access | practical recovery |
| Fallback B | app includes curated sample profiles | guaranteed judge demo |

The demo must not depend on live Instagram succeeding. Sample profiles are required.

## Sample Profiles

Prepare at least three sample profiles:

| Sample | Expected persona |
|---|---|
| cafe-gallery profile | slow urban cafe and exhibition traveler |
| ocean-nature profile | coastal rest and nature traveler |
| food-city profile | local food and dense city explorer |

Each sample should include:

- username-like label
- bio
- 9-12 pseudo posts
- caption text
- hashtags
- optional image descriptions

## Place Seed Data

Use local JSON seed data for MVP recommendations.

Each destination should have 8-12 places. Each place should include:

```json
{
  "id": "kamakura-yuigahama",
  "city": "Kamakura",
  "country": "Japan",
  "name": "Yuigahama Beach",
  "category": "nature",
  "vibeTags": ["slow", "coastal", "calm", "photo", "walk"],
  "fitTags": ["solo", "couple", "slow"],
  "avoidIf": ["rain", "low-walking"],
  "estimatedCost": "low",
  "walkingLoad": "medium",
  "bestTime": ["afternoon", "sunset"],
  "durationMinutes": 90,
  "description": "A relaxed coastal walk that fits calm, visual travel profiles."
}
```

## Recommendation Logic

The app should produce three destination recommendations before generating an itinerary.

### Destination Ranking

Rank destinations using:

1. Instagram-derived taste signals
2. survey constraints
3. destination personality tags
4. place availability in seed data

Each recommendation should include:

- destination name
- fit score
- short reason
- what kind of traveler it fits
- one risk or trade-off

### Concept Generation

For the selected destination, generate three concepts:

1. Best Fit: closest match to profile and survey constraints.
2. Unexpected Match: expands the user's taste in a plausible way.
3. Low-Risk Plan: optimizes for budget, movement, and reliability.

### Itinerary Generation

Generate one detailed itinerary for the Best Fit concept by default.

The itinerary should include:

- time blocks
- place name
- activity
- fit rationale
- estimated cost level
- walking/movement load
- Plan B item for weather, crowding, or fatigue

## AI Prompt Boundaries

Use separate AI stages:

1. Profile taste extraction
2. Destination ranking
3. Travel concept generation
4. Itinerary generation

Keep each stage's input and output structured as JSON. The UI can render the JSON into cards and tables.

## Output Structure

The final result page should contain:

1. Travel Persona
   - title
   - summary
   - taste tags
   - inferred travel pace
   - confidence notes
2. Top Destinations
   - top 3 cards
   - fit reason
   - trade-off
3. Travel Concepts
   - Best Fit
   - Unexpected Match
   - Low-Risk Plan
4. Itinerary
   - detailed schedule
   - estimated cost band
   - walking load
   - Plan B
5. Why This Fits
   - profile signals used
   - survey constraints used
   - famous places excluded and why

## Demo Scenario

The strongest demo compares two different profile styles.

Scenario A:

- Profile: cafe-gallery profile
- Survey: 2 nights 3 days, balanced pace, medium budget, avoids crowds
- Expected result: Seoul, Kamakura, or Tokyo with cafes, galleries, quiet streets

Scenario B:

- Profile: ocean-nature profile
- Survey: 1 night 2 days, slow pace, low walking, wants rest
- Expected result: Jeju, Namhae, Miyakojima, or Matsuyama with coastal/nature focus

The contrast should show that TripPersona is not a generic itinerary generator.

## Business Model Notes

Potential monetization paths:

- premium itinerary generation
- affiliate booking for lodging, transport, activities, and restaurants
- creator travel guide pages generated from influencer profiles
- white-label personalization API for travel agencies

## Judging Alignment

| Business & Applications criterion | How TripPersona addresses it |
|---|---|
| Problem & Market Clarity | Social media heavily influences travel inspiration, but users lack a way to turn profile taste into realistic plans. |
| Product Completeness | MVP can deliver a complete flow: profile URL, survey, persona, destinations, concepts, itinerary. |
| AI Integration | AI is central to extracting taste from profile content and converting it into constraints-aware travel plans. |
| Business Viability | Travel commerce, premium planning, and creator guide monetization are clear expansion paths. |
| Demo & Presentation | Different profiles produce visibly different trips, which is easy to show live. |

## Scope Cuts

The MVP does not include:

- real booking
- payment
- user accounts
- saved trip history
- full Google Maps integration
- live operating hours verification
- arbitrary global destination coverage
- private Instagram account access

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Instagram blocks public profile scraping | Use pasted content and sample profiles as fallbacks. |
| Recommendations feel generic | Use persona tags, excluded-place explanations, and destination trade-offs. |
| Too many destinations dilute quality | Keep seed places shallow but well-tagged. |
| AI hallucinates places | Restrict itinerary generation to local seed data. |
| Privacy concern | Limit inference to travel taste and public content; avoid sensitive traits. |

## Implementation Decisions

Use these decisions for the initial implementation:

1. Product name: `TripPersona`.
2. Frontend stack: Next.js with TypeScript. Use API routes for Instagram ingestion and Gemini calls so secrets stay server-side.
3. Styling: Tailwind CSS. Keep the UI focused on the actual planning workflow, not a landing page.
4. Instagram live scraping depth: recent 9-12 visible posts only for MVP.
5. Initial itinerary lengths: support day trip, 1 night 2 days, and 2 nights 3 days first.
6. Destination seed storage: local JSON files committed in the app source.
7. Gemini usage: server-side only, reading `GEMINI_API_KEY` from `.env.local`.
