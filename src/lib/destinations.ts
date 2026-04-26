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
