import { destinations, places } from "./destinations";
import type { CostLevel, DailyItinerary, DestinationId, DestinationPlan, DestinationRecommendation, ItineraryItem, Place, RecommendationItem, TripSurvey, WalkingLoad } from "./types";

interface DestinationPlanSeed {
  photo: DestinationPlan["photo"];
  transport: RecommendationItem[];
  stays: RecommendationItem[];
  restaurants: RecommendationItem[];
  photoSpots: RecommendationItem[];
}

interface StopCandidate {
  placeName: string;
  activity: string;
  fitRationale: string;
  cost: CostLevel;
  walkingLoad: WalkingLoad;
  planB: string;
}

const planSeeds: Partial<Record<DestinationId, DestinationPlanSeed>> = {
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
    photoSpots: item("애월 해안도로", "노을과 바다", "바다 풍경과 사진으로 남길 장면을 함께 잡을 수 있어 프로필 취향과 연결됩니다.")
  },
  busan: {
    photo: { url: "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1200&q=80", alt: "부산 해안 도시 풍경", credit: "Unsplash" },
    transport: item("KTX 또는 항공 + 지하철", "부산역/김해공항 진입", "도시 이동과 해안 코스를 함께 묶기 쉽습니다."),
    stays: item("광안리/서면 호텔", "야경 또는 미식 접근성", "밤 일정과 맛집 탐색에 유리합니다."),
    restaurants: item("시장과 돼지국밥", "부평깡통시장, 로컬 식당", "로컬 미식과 활기 있는 저녁 분위기를 한 번에 경험할 수 있습니다."),
    photoSpots: item("흰여울문화마을", "바다와 골목", "로컬 골목과 해안 사진을 함께 얻습니다.")
  },
  mokpo: {
    photo: { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", alt: "항구 도시 골목과 노을", credit: "Unsplash" },
    transport: item("KTX 목포역", "역 중심 도보/택시 이동", "짧은 체류에도 로컬 코어에 빠르게 닿습니다."),
    stays: item("목포역 근처 스테이", "근대역사거리 접근성", "느린 골목 산책 동선이 좋아집니다."),
    restaurants: item("목포 9미", "민어, 낙지, 갈치조림", "로컬 미식 취향에 강하게 맞습니다."),
    photoSpots: item("근대역사거리", "레트로 건물과 골목", "오래된 건물과 생활감 있는 골목이 로컬한 사진 취향을 살려줍니다.")
  },
  namhae: {
    photo: { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", alt: "남해 바다와 조용한 해안", credit: "Unsplash" },
    transport: item("자가용/렌터카 추천", "남해 내부 이동 최적", "조용한 바다 스팟을 여유롭게 연결합니다."),
    stays: item("오션뷰 펜션", "해안 근처 조용한 숙소", "휴식 중심 여행에 맞습니다."),
    restaurants: item("멸치쌈밥과 로컬 카페", "남해 로컬 식사", "지역감 있는 식사를 넣을 수 있습니다."),
    photoSpots: item("독일마을 전망", "해안과 마을 풍경", "조용한 마을 풍경과 바다 전망을 함께 담을 수 있어 여유로운 사진 루트에 맞습니다.")
  },
  tokyo: {
    photo: { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80", alt: "도쿄 도시 거리", credit: "Unsplash" },
    transport: item("항공 + JR/지하철", "Suica/Pasmo 활용", "취향 밀도 높은 동네를 촘촘히 이동합니다."),
    stays: item("시부야/긴자/우에노", "관심 동네에 맞춘 숙소", "쇼핑, 카페, 전시 접근성을 높입니다."),
    restaurants: item("동네 카페와 이자카야", "예약 부담 낮은 미식", "도시 취향을 부담 없이 확장합니다."),
    photoSpots: item("다이칸야마", "서점, 카페, 골목", "서점, 카페, 골목이 가까워 감도 있는 실내 공간과 거리 사진을 자연스럽게 이어갈 수 있습니다.")
  },
  osaka: {
    photo: { url: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80", alt: "오사카 도톤보리 야경", credit: "Unsplash" },
    transport: item("항공 + 난카이/지하철", "난바 중심 이동", "짧은 일정에 미식을 압축하기 좋습니다."),
    stays: item("난바/우메다 호텔", "밤 일정 접근성", "맛집과 쇼핑을 늦게까지 즐길 수 있습니다."),
    restaurants: item("난바 미식 산책", "타코야키, 오코노미야키, 이자카야", "가벼운 길거리 음식과 활기 있는 거리를 함께 즐길 수 있어 에너지 있는 일정에 맞습니다."),
    photoSpots: item("도톤보리", "네온과 거리", "활기 있는 여행 사진을 남기기 좋습니다.")
  },
  kamakura: {
    photo: { url: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=80", alt: "가마쿠라 해변과 일본 골목", credit: "Unsplash" },
    transport: item("도쿄 출발 JR", "1시간 내외 근교 이동", "느린 해변 산책을 당일/1박으로 즐기기 좋습니다."),
    stays: item("가마쿠라/에노시마 스테이", "해변 접근성", "아침 산책과 노을 동선에 좋습니다."),
    restaurants: item("해변 카페와 소바", "가벼운 로컬 식사", "느린 해변 산책 흐름을 깨지 않고 식사와 휴식을 이어갈 수 있습니다."),
    photoSpots: item("유이가하마 해변", "해변 산책과 노을", "노을과 해변 산책 장면이 사진으로 남기기 좋은 하루의 중심이 됩니다.")
  },
  matsuyama: {
    photo: { url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", alt: "일본 온천 거리", credit: "Unsplash" },
    transport: item("항공 + 노면전차", "마쓰야마 시내 이동", "작은 도시를 느리게 여행하기 좋습니다."),
    stays: item("도고온천 료칸", "온천 접근성", "휴식과 레트로 감성을 함께 줍니다."),
    restaurants: item("이요 지역 식당", "타이메시와 로컬 이자카야", "조용한 로컬 미식에 맞습니다."),
    photoSpots: item("도고온천 거리", "레트로 온천가", "오래된 온천가 분위기가 조용한 로컬 산책 취향을 잘 살립니다.")
  },
  miyakojima: {
    photo: { url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80", alt: "미야코지마 맑은 바다", credit: "Unsplash" },
    transport: item("항공 + 렌터카", "섬 내부 이동 필수", "해변과 리조트 동선을 여유롭게 잡습니다."),
    stays: item("비치 리조트", "바다 접근성 최우선", "휴양과 낮은 이동 강도에 맞습니다."),
    restaurants: item("오키나와 로컬 식당", "소바, 해산물, 카페", "휴양 중 부담 없는 식사에 좋습니다."),
    photoSpots: item("요나하 마에하마", "맑은 바다", "맑은 바다와 리조트 무드를 가장 직관적으로 보여주는 대표 장면입니다.")
  },
  kaohsiung: {
    photo: { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80", alt: "대만 항구 도시와 야시장", credit: "Unsplash" },
    transport: item("항공 + MRT", "가오슝 시내 이동", "항구, 예술지구, 야시장을 쉽게 연결합니다."),
    stays: item("미려도역/보얼 근처", "MRT 접근성", "짧은 일정에도 동선이 안정적입니다."),
    restaurants: item("야시장 로컬 푸드", "우육면, 해산물, 디저트", "야시장 특유의 활기와 로컬 음식을 저녁 일정 안에 압축할 수 있습니다."),
    photoSpots: item("보얼예술특구", "항구와 그래픽 벽화", "항구 도시의 예술적인 벽화와 넓은 동선이 사진 포인트로 분명합니다.")
  }
};

export function buildDestinationPlans(recommendations: DestinationRecommendation[], survey: TripSurvey): DestinationPlan[] {
  return recommendations.map((destination) => {
    const destinationMeta = destinations.find((item) => item.id === destination.destinationId);
    const seed = planSeeds[destination.destinationId] ?? makeDefaultSeed(destination.destinationName, destinationMeta?.summary);
    const destinationPlaces = places.filter((place) => place.destinationId === destination.destinationId);
    const dailyItinerary = buildDailyItinerary(destination.destinationId, destination.destinationName, destinationPlaces, survey, seed);

    return {
      destination,
      photo: seed.photo,
      transport: seed.transport,
      stays: seed.stays,
      restaurants: seed.restaurants,
      photoSpots: seed.photoSpots,
      itinerary: dailyItinerary.flatMap((day) => day.items),
      dailyItinerary
    };
  });
}

function buildDailyItinerary(destinationId: DestinationId, destinationName: string, destinationPlaces: Place[], survey: TripSurvey, seed: DestinationPlanSeed): DailyItinerary[] {
  const basePlaces = destinationPlaces.length > 0 ? destinationPlaces : places.filter((place) => place.destinationId === destinationId);
  const dayCount = tripLengthToDays(survey.tripLength);
  const titles = ["도착과 첫 취향 체크", "핵심 동네 깊게 보기", "로컬 미식과 사진 루트", "여유 회복과 쇼핑", "마지막 산책과 재방문 후보"];
  const stopPool = buildStopPool(destinationName, basePlaces, seed, survey);

  return Array.from({ length: dayCount }, (_, index) => ({
    day: index + 1,
    title: titles[index] ?? `${index + 1}일차 취향 확장 루트`,
    items: buildDayItems(stopPool, seed, index, survey)
  }));
}

function buildStopPool(destinationName: string, basePlaces: Place[], seed: DestinationPlanSeed, survey: TripSurvey): StopCandidate[] {
  const candidates: StopCandidate[] = [
    ...basePlaces.map((place) => ({
      placeName: place.name,
      activity: place.description,
      fitRationale: `${formatTagList(place.vibeTags)} 분위기가 프로필에서 보인 취향 신호와 연결됩니다.`,
      cost: place.estimatedCost,
      walkingLoad: place.walkingLoad,
      planB: "혼잡하면 같은 권역의 예약 가능한 전시, 쇼핑몰, 로컬 카페로 대체하세요."
    })),
    ...seed.photoSpots.map((spot) => ({
      placeName: spot.name,
      activity: spot.summary,
      fitRationale: spot.why,
      cost: "low" as const,
      walkingLoad: "medium" as const,
      planB: "날씨가 좋지 않으면 가까운 실내 포토 스팟이나 카페로 바꾸세요."
    })),
    ...seed.restaurants.map((restaurant) => ({
      placeName: restaurant.name,
      activity: restaurant.summary,
      fitRationale: restaurant.why,
      cost: "medium" as const,
      walkingLoad: "low" as const,
      planB: "웨이팅이 길면 숙소 근처 캐주얼 다이닝이나 포장 가능한 로컬 메뉴로 바꾸세요."
    })),
    ...buildGeneratedStops(destinationName, survey)
  ];

  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.placeName)) return false;
    seen.add(candidate.placeName);
    return true;
  });
}

function buildDayItems(stopPool: StopCandidate[], seed: DestinationPlanSeed, dayIndex: number, survey: TripSurvey): ItineraryItem[] {
  const used = new Set<string>();
  const pick = (offset: number) => {
    for (let index = 0; index < stopPool.length; index += 1) {
      const candidate = stopPool[(dayIndex * 3 + offset + index) % stopPool.length];
      if (!used.has(candidate.placeName)) {
        used.add(candidate.placeName);
        return candidate;
      }
    }
    return stopPool[0];
  };

  const firstStop = dayIndex === 0
    ? {
        placeName: seed.transport[0]?.name ?? "이동 시작",
        activity: seed.transport[0]?.summary ?? "숙소와 첫 장소까지 부담 없는 이동으로 시작합니다.",
        fitRationale: seed.transport[0]?.why ?? "이동 피로를 줄이고 첫날 만족도를 높입니다.",
        cost: "medium" as const,
        walkingLoad: "low" as const,
        planB: "이동이 지연되면 숙소 체크인 후 가까운 카페나 실내 장소로 시작하세요."
      }
    : pick(0);
  used.add(firstStop.placeName);

  const secondStop = pick(dayIndex === 0 ? 0 : 1);
  const thirdStop = pick(dayIndex === 0 ? 1 : 2);

  return [
    {
      time: dayIndex === 0 ? "11:00" : "10:00",
      ...normalizeWalking(firstStop, survey)
    },
    {
      time: "14:00",
      ...normalizeWalking(secondStop, survey)
    },
    {
      time: "18:30",
      ...normalizeWalking(thirdStop, survey)
    }
  ];
}

function buildGeneratedStops(destinationName: string, survey: TripSurvey): StopCandidate[] {
  const wantsFood = survey.include.includes("맛집");
  const wantsCafe = survey.include.includes("카페");
  const wantsShopping = survey.include.includes("쇼핑");
  const wantsPhoto = survey.include.includes("사진");

  return [
    {
      placeName: `${destinationName} 로컬 골목`,
      activity: wantsFood ? "현지 식당과 작은 상점을 이어서 보는 동네 탐색" : "관광지보다 생활감 있는 거리를 천천히 보는 산책",
      fitRationale: "프로필의 로컬/도시 취향을 일정에 녹입니다.",
      cost: "low",
      walkingLoad: "medium",
      planB: "동선이 길면 같은 권역 안에서 식사와 카페만 남기세요."
    },
    {
      placeName: `${destinationName} 감도 카페`,
      activity: wantsCafe ? "카페에서 쉬면서 사진과 다음 동선을 정리하는 시간" : "일정 중간 피로를 낮추는 실내 휴식",
      fitRationale: "프로필의 분위기 취향과 설문 피로도 조건을 함께 반영합니다.",
      cost: "medium",
      walkingLoad: "low",
      planB: "만석이면 같은 역 주변의 조용한 베이커리나 티룸으로 대체하세요."
    },
    {
      placeName: `${destinationName} 야경 산책`,
      activity: wantsPhoto ? "해 질 무렵부터 야간 사진을 남기는 짧은 산책" : "저녁 식사 후 부담 없이 보는 야간 분위기",
      fitRationale: "하루 마지막에 기억에 남는 장면을 만들기 좋습니다.",
      cost: "free",
      walkingLoad: "medium",
      planB: "비가 오면 전망 좋은 실내 쇼핑몰이나 호텔 라운지로 바꾸세요."
    },
    {
      placeName: `${destinationName} 편집숍 거리`,
      activity: wantsShopping ? "브랜드 숍과 기념품 후보를 짧게 비교" : "동네 분위기를 보는 가벼운 쇼핑 산책",
      fitRationale: "취향을 드러내는 물건과 공간을 일정에 넣습니다.",
      cost: "medium",
      walkingLoad: "medium",
      planB: "쇼핑 피로가 크면 한 곳만 찍고 근처 식사로 넘어가세요."
    }
  ];
}

function normalizeWalking(candidate: StopCandidate, survey: TripSurvey): Omit<ItineraryItem, "time"> {
  return {
    ...candidate,
    walkingLoad: survey.walkingLimit === "under-5k" && candidate.walkingLoad === "high" ? "medium" : candidate.walkingLoad
  };
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

function formatTagList(tags: string[]): string {
  const labels: Record<string, string> = {
    slow: "느린 산책",
    urban: "도시 감도",
    local: "로컬 동네",
    photo: "사진 포인트",
    design: "디자인 공간",
    cafes: "카페",
    trendy: "트렌디한 분위기",
    coastal: "바다",
    drive: "드라이브",
    rest: "휴식",
    food: "미식",
    energy: "활기",
    night: "야간 무드",
    city: "도시 탐색",
    culture: "문화",
    quiet: "조용한 분위기",
    walk: "산책",
    bookstore: "서점",
    calm: "차분한 분위기",
    "local-food": "로컬 미식",
    retro: "레트로",
    art: "예술",
    harbor: "항구",
    garden: "정원"
  };
  return tags.map((tag) => labels[tag] ?? tag).slice(0, 4).join(", ");
}

function makeDefaultSeed(destinationName: string, summary = "취향 신호와 여행 조건을 함께 반영한 추천 여행지"): DestinationPlanSeed {
  return {
    photo: {
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      alt: `${destinationName} 여행 이미지`,
      credit: "Unsplash"
    },
    transport: item(`${destinationName} 중심 교통`, "공항/역에서 숙소와 핵심 권역을 먼저 연결", "초반 이동 피로를 줄이고 일정 밀도를 안정적으로 맞춥니다."),
    stays: item(`${destinationName} 중심권 숙소`, summary, "추천 장소 사이 이동 시간을 줄이고 밤 일정 이후 복귀가 쉽습니다."),
    restaurants: item(`${destinationName} 로컬 맛집`, "현지 대표 메뉴와 캐주얼 다이닝", "로컬 음식과 동네 분위기를 함께 보는 취향을 일정에 반영합니다."),
    photoSpots: item(`${destinationName} 대표 포토 루트`, "도시나 자연의 분위기가 잘 드러나는 산책 지점", "프로필에 남기기 좋은 장면과 여행 컨셉을 함께 만듭니다.")
  };
}
