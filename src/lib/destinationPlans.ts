import { places } from "./destinations";
import type { DestinationId, DestinationPlan, DestinationRecommendation, ItineraryItem, RecommendationItem, TripSurvey } from "./types";

interface DestinationPlanSeed {
  photo: DestinationPlan["photo"];
  transport: RecommendationItem[];
  stays: RecommendationItem[];
  restaurants: RecommendationItem[];
  photoSpots: RecommendationItem[];
}

const planSeeds: Record<DestinationId, DestinationPlanSeed> = {
  seoul: {
    photo: { url: "https://images.unsplash.com/photo-1538485399081-7c8ed9b1f5e1?auto=format&fit=crop&w=1200&q=80", alt: "서울 도심과 한강 야경", credit: "Unsplash" },
    transport: item("지하철 중심 이동", "T-money 또는 교통카드", "짧은 동선과 높은 접근성이 서울 여행 강점입니다."),
    stays: item("성수/종로 부티크 호텔", "카페와 전시 접근성 우선", "취향 장소 사이 이동 시간을 줄일 수 있습니다."),
    restaurants: item("을지로 로컬 다이닝", "노포와 캐주얼 바", "도시형 미식과 야경 취향을 함께 만족시킵니다."),
    photoSpots: item("서촌 골목", "낮은 채도의 골목 사진", "조용한 도시 산책 취향과 잘 맞습니다.")
  },
  jeju: {
    photo: { url: "https://images.unsplash.com/photo-1579169825453-8d4b465bb4e1?auto=format&fit=crop&w=1200&q=80", alt: "제주 바다와 해안 풍경", credit: "Unsplash" },
    transport: item("제주 항공 + 렌터카", "김포-제주 왕복, 1-2일 렌터카", "해안도로와 카페를 낮은 도보로 연결하기 좋습니다."),
    stays: item("애월/협재 감성 숙소", "바다 접근성이 좋은 숙소", "휴식과 노을 사진 취향에 맞습니다."),
    restaurants: item("해산물 로컬 식당", "갈치, 해물라면, 바다 전망 카페", "바다 중심 여행의 만족도를 높입니다."),
    photoSpots: item("애월 해안도로", "노을과 바다", "프로필의 coastal/photo 신호와 직접 연결됩니다.")
  },
  busan: {
    photo: { url: "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1200&q=80", alt: "부산 해안 도시 풍경", credit: "Unsplash" },
    transport: item("KTX 또는 항공 + 지하철", "부산역/김해공항 진입", "도시 이동과 해안 코스를 함께 묶기 쉽습니다."),
    stays: item("광안리/서면 호텔", "야경 또는 미식 접근성", "밤 일정과 맛집 탐색에 유리합니다."),
    restaurants: item("시장과 돼지국밥", "부평깡통시장, 로컬 식당", "food/night 취향을 압축적으로 채웁니다."),
    photoSpots: item("흰여울문화마을", "바다와 골목", "로컬 골목과 해안 사진을 함께 얻습니다.")
  },
  mokpo: {
    photo: { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", alt: "항구 도시 골목과 노을", credit: "Unsplash" },
    transport: item("KTX 목포역", "역 중심 도보/택시 이동", "짧은 체류에도 로컬 코어에 빠르게 닿습니다."),
    stays: item("목포역 근처 스테이", "근대역사거리 접근성", "느린 골목 산책 동선이 좋아집니다."),
    restaurants: item("목포 9미", "민어, 낙지, 갈치조림", "로컬 미식 취향에 강하게 맞습니다."),
    photoSpots: item("근대역사거리", "레트로 건물과 골목", "retro/local 신호를 보여주기 좋습니다.")
  },
  namhae: {
    photo: { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", alt: "남해 바다와 조용한 해안", credit: "Unsplash" },
    transport: item("자가용/렌터카 추천", "남해 내부 이동 최적", "조용한 바다 스팟을 여유롭게 연결합니다."),
    stays: item("오션뷰 펜션", "해안 근처 조용한 숙소", "휴식 중심 여행에 맞습니다."),
    restaurants: item("멸치쌈밥과 로컬 카페", "남해 로컬 식사", "지역감 있는 식사를 넣을 수 있습니다."),
    photoSpots: item("독일마을 전망", "해안과 마을 풍경", "quiet/coastal/photo 취향과 맞습니다.")
  },
  tokyo: {
    photo: { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80", alt: "도쿄 도시 거리", credit: "Unsplash" },
    transport: item("항공 + JR/지하철", "Suica/Pasmo 활용", "취향 밀도 높은 동네를 촘촘히 이동합니다."),
    stays: item("시부야/긴자/우에노", "관심 동네에 맞춘 숙소", "쇼핑, 카페, 전시 접근성을 높입니다."),
    restaurants: item("동네 카페와 이자카야", "예약 부담 낮은 미식", "도시 취향을 부담 없이 확장합니다."),
    photoSpots: item("다이칸야마", "서점, 카페, 골목", "design/cafes 취향이 잘 드러납니다.")
  },
  osaka: {
    photo: { url: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80", alt: "오사카 도톤보리 야경", credit: "Unsplash" },
    transport: item("항공 + 난카이/지하철", "난바 중심 이동", "짧은 일정에 미식을 압축하기 좋습니다."),
    stays: item("난바/우메다 호텔", "밤 일정 접근성", "맛집과 쇼핑을 늦게까지 즐길 수 있습니다."),
    restaurants: item("난바 미식 산책", "타코야키, 오코노미야키, 이자카야", "food/energy 신호와 강하게 맞습니다."),
    photoSpots: item("도톤보리", "네온과 거리", "활기 있는 여행 사진을 남기기 좋습니다.")
  },
  kamakura: {
    photo: { url: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=80", alt: "가마쿠라 해변과 일본 골목", credit: "Unsplash" },
    transport: item("도쿄 출발 JR", "1시간 내외 근교 이동", "느린 해변 산책을 당일/1박으로 즐기기 좋습니다."),
    stays: item("가마쿠라/에노시마 스테이", "해변 접근성", "아침 산책과 노을 동선에 좋습니다."),
    restaurants: item("해변 카페와 소바", "가벼운 로컬 식사", "slow/coastal 취향을 해치지 않습니다."),
    photoSpots: item("유이가하마 해변", "해변 산책과 노을", "photo/coastal 신호와 잘 맞습니다.")
  },
  matsuyama: {
    photo: { url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", alt: "일본 온천 거리", credit: "Unsplash" },
    transport: item("항공 + 노면전차", "마쓰야마 시내 이동", "작은 도시를 느리게 여행하기 좋습니다."),
    stays: item("도고온천 료칸", "온천 접근성", "휴식과 레트로 감성을 함께 줍니다."),
    restaurants: item("이요 지역 식당", "타이메시와 로컬 이자카야", "조용한 로컬 미식에 맞습니다."),
    photoSpots: item("도고온천 거리", "레트로 온천가", "retro/quiet 신호와 잘 맞습니다.")
  },
  miyakojima: {
    photo: { url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80", alt: "미야코지마 맑은 바다", credit: "Unsplash" },
    transport: item("항공 + 렌터카", "섬 내부 이동 필수", "해변과 리조트 동선을 여유롭게 잡습니다."),
    stays: item("비치 리조트", "바다 접근성 최우선", "휴양과 낮은 이동 강도에 맞습니다."),
    restaurants: item("오키나와 로컬 식당", "소바, 해산물, 카페", "휴양 중 부담 없는 식사에 좋습니다."),
    photoSpots: item("요나하 마에하마", "맑은 바다", "ocean/resort 신호가 강하게 드러납니다.")
  },
  kaohsiung: {
    photo: { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80", alt: "대만 항구 도시와 야시장", credit: "Unsplash" },
    transport: item("항공 + MRT", "가오슝 시내 이동", "항구, 예술지구, 야시장을 쉽게 연결합니다."),
    stays: item("미려도역/보얼 근처", "MRT 접근성", "짧은 일정에도 동선이 안정적입니다."),
    restaurants: item("야시장 로컬 푸드", "우육면, 해산물, 디저트", "night-market/local 신호와 맞습니다."),
    photoSpots: item("보얼예술특구", "항구와 그래픽 벽화", "art/harbor/photo 취향을 보여줍니다.")
  }
};

export function buildDestinationPlans(recommendations: DestinationRecommendation[], survey: TripSurvey): DestinationPlan[] {
  return recommendations.map((destination) => {
    const seed = planSeeds[destination.destinationId];
    const destinationPlaces = places.filter((place) => place.destinationId === destination.destinationId);

    return {
      destination,
      photo: seed.photo,
      transport: seed.transport,
      stays: seed.stays,
      restaurants: seed.restaurants,
      photoSpots: seed.photoSpots,
      itinerary: buildItinerary(destination.destinationId, destinationPlaces, survey)
    };
  });
}

function buildItinerary(destinationId: DestinationId, destinationPlaces: typeof places, survey: TripSurvey): ItineraryItem[] {
  const basePlaces = destinationPlaces.length > 0 ? destinationPlaces : places.filter((place) => place.destinationId === destinationId);
  const dayCount = tripLengthToDays(survey.tripLength);
  const slots = ["10:00", "13:00", "17:00", "20:00"];
  const maxItems = Math.min(Math.max(dayCount, 1) * 2, Math.max(basePlaces.length, 1), 4);

  return basePlaces.slice(0, maxItems).map((place, index) => ({
    time: slots[index] ?? "18:00",
    placeName: place.name,
    activity: place.description,
    fitRationale: `${place.vibeTags.join(", ")} 취향 신호와 연결됩니다.`,
    cost: place.estimatedCost,
    walkingLoad: place.walkingLoad,
    planB: "날씨나 혼잡도가 맞지 않으면 같은 지역의 카페 또는 실내 장소로 대체하세요."
  }));
}

function tripLengthToDays(tripLength: TripSurvey["tripLength"]): number {
  if (tripLength === "day-trip") return 1;
  if (tripLength === "1n2d") return 2;
  if (tripLength === "2n3d") return 3;
  if (tripLength === "3n4d") return 4;
  return 5;
}

function item(name: string, summary: string, why: string): RecommendationItem[] {
  return [{ name, summary, why }];
}
