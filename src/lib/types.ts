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

export type TripLength = "day-trip" | "1n2d" | "2n3d" | "3n4d" | "4plus";
export type TravelPace = "slow" | "balanced" | "packed";
export type WalkingLimit = "under-5k" | "under-10k" | "no-limit";
export type BudgetBand = "under-100k" | "100k-300k" | "300k-700k" | "700k-1200k" | "over-1200k";
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
  destinationPlans: DestinationPlan[];
}

export interface RecommendationItem {
  name: string;
  summary: string;
  why: string;
}

export interface DestinationPhoto {
  url: string;
  alt: string;
  credit: string;
}

export interface DestinationPlan {
  destination: DestinationRecommendation;
  photo: DestinationPhoto;
  transport: RecommendationItem[];
  stays: RecommendationItem[];
  restaurants: RecommendationItem[];
  photoSpots: RecommendationItem[];
  itinerary: ItineraryItem[];
}
