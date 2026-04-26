import { destinations, places } from "./destinations";
import type { CostLevel, DailyItinerary, DestinationId, DestinationPlan, DestinationRecommendation, DestinationWeatherAdvice, ItineraryItem, Place, RecommendationItem, TripSurvey, WalkingLoad } from "./types";

interface DestinationPlanSeed {
  photo: DestinationPlan["photo"];
  transport: RecommendationItem[];
  stays: RecommendationItem[];
  activities?: RecommendationItem[];
  restaurants: RecommendationItem[];
  photoSpots: RecommendationItem[];
}

interface StopCandidate {
  placeName: string;
  area?: string;
  activity: string;
  fitRationale: string;
  cost: CostLevel;
  walkingLoad: WalkingLoad;
  planB: string;
  durationMinutes?: number;
  mapUrl?: string;
}

interface CuratedStop {
  placeName: string;
  area: string;
  activity: string;
  fitRationale: string;
  cost: CostLevel;
  walkingLoad: WalkingLoad;
  durationMinutes: number;
}

const destinationPhotos: Record<DestinationId, DestinationPlan["photo"]> = {
  seoul: { url: "https://images.unsplash.com/photo-1538485399081-7c8ed9b1f5e1?auto=format&fit=crop&w=1200&q=80", alt: "서울 도심과 한강 야경", credit: "Unsplash" },
  jeju: { url: "https://images.unsplash.com/photo-1579169825453-8d4b465bb4e1?auto=format&fit=crop&w=1200&q=80", alt: "제주 바다와 해안 풍경", credit: "Unsplash" },
  busan: { url: "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1200&q=80", alt: "부산 해안 도시 풍경", credit: "Unsplash" },
  mokpo: { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", alt: "목포 항구 도시 골목", credit: "Unsplash" },
  namhae: { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", alt: "남해 조용한 해안", credit: "Unsplash" },
  fukuoka: { url: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80", alt: "후쿠오카 도시와 강변", credit: "Unsplash" },
  sapporo: { url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80", alt: "삿포로 겨울 도시", credit: "Unsplash" },
  kyoto: { url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", alt: "교토 전통 거리", credit: "Unsplash" },
  tokyo: { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80", alt: "도쿄 도시 거리", credit: "Unsplash" },
  osaka: { url: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80", alt: "오사카 도톤보리 야경", credit: "Unsplash" },
  kamakura: { url: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=80", alt: "가마쿠라 해변과 일본 골목", credit: "Unsplash" },
  matsuyama: { url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", alt: "마쓰야마 온천 거리", credit: "Unsplash" },
  miyakojima: { url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80", alt: "미야코지마 맑은 바다", credit: "Unsplash" },
  taipei: { url: "https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1200&q=80", alt: "타이베이 도시 야경", credit: "Unsplash" },
  tainan: { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", alt: "타이난 골목과 오래된 거리", credit: "Unsplash" },
  kaohsiung: { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80", alt: "가오슝 항구 도시", credit: "Unsplash" },
  bangkok: { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80", alt: "방콕 도심과 야시장", credit: "Unsplash" },
  chiangmai: { url: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80", alt: "치앙마이 사원과 자연", credit: "Unsplash" },
  danang: { url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80", alt: "다낭 해변", credit: "Unsplash" },
  hoian: { url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80", alt: "호이안 올드타운", credit: "Unsplash" },
  hanoi: { url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80", alt: "하노이 올드쿼터", credit: "Unsplash" },
  hochiminh: { url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80", alt: "호치민 도시 거리", credit: "Unsplash" },
  bali: { url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80", alt: "발리 해변과 자연", credit: "Unsplash" },
  cebu: { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", alt: "세부 리조트 해변", credit: "Unsplash" },
  kualalumpur: { url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80", alt: "쿠알라룸푸르 스카이라인", credit: "Unsplash" },
  singapore: { url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80", alt: "싱가포르 마리나 베이", credit: "Unsplash" },
  hongkong: { url: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80", alt: "홍콩 하버 야경", credit: "Unsplash" },
  macau: { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", alt: "마카오 거리와 호텔", credit: "Unsplash" }
};

const curatedStopSeeds: Partial<Record<DestinationId, Array<[string, string, string]>>> = {
  seoul: [["성수 연무장길", "성수", "브랜드 쇼룸, 팝업, 카페를 짧은 동선으로 보는 코스"], ["서촌 골목", "서촌", "낮은 채도의 골목과 작은 카페를 천천히 연결"], ["더현대 서울", "여의도", "날씨와 상관없이 쇼핑, 식사, 실내 사진을 해결"], ["남산서울타워", "남산", "저녁 도시 전망과 야경 사진을 남기는 코스"]],
  jeju: [["애월 카페거리", "애월", "바다 전망 카페와 해안 산책을 함께 묶는 코스"], ["금오름", "서부", "짧은 오름 산책과 선셋 사진을 남기는 코스"], ["협재해수욕장", "협재", "맑은 바다와 쉬운 해변 산책"], ["동문시장", "제주시", "저녁 로컬 간식과 기념품을 한 번에 해결"]],
  busan: [["흰여울문화마을", "영도", "바다 골목과 사진 포인트를 함께 보는 코스"], ["광안리해수욕장", "광안리", "해변 카페와 야경을 이어보는 코스"], ["전포카페거리", "전포", "트렌디한 카페와 편집숍을 연결"], ["부평깡통시장", "중구", "로컬 야시장과 간식을 짧게 즐기는 코스"]],
  tokyo: [["다이칸야마 T-SITE", "다이칸야마", "서점, 카페, 골목 사진을 한 번에 잡는 코스"], ["시부야 스카이", "시부야", "도쿄 도시 전망과 야경을 남기는 포인트"], ["하라주쿠 캣스트리트", "하라주쿠", "패션, 편집숍, 카페를 이어보는 거리"], ["팀랩 보더리스", "아자부다이", "날씨와 무관하게 강한 비주얼을 만드는 실내 전시"]],
  osaka: [["도톤보리", "난바", "네온, 거리 음식, 사람 많은 도시 에너지를 압축"], ["나카자키초", "우메다", "빈티지 카페와 작은 숍을 천천히 보는 동네"], ["오렌지스트리트", "호리에", "쇼핑과 스트리트 사진을 함께 잡는 코스"], ["신세카이", "덴노지", "레트로 간판과 로컬 음식을 함께 경험"]],
  fukuoka: [["나카스 야타이 거리", "나카스", "저녁 포장마차와 로컬 미식을 즐기는 코스"], ["오호리공원", "주오구", "도심 속 산책과 카페 휴식"], ["텐진 지하상가", "텐진", "비 오는 날에도 쇼핑과 이동이 쉬운 실내 동선"], ["다자이후 텐만구", "다자이후", "짧은 근교 산책과 전통 거리 사진"]],
  kyoto: [["기온 하나미코지", "기온", "전통 골목과 찻집을 아침에 조용히 보는 코스"], ["니넨자카", "히가시야마", "교토다운 거리 사진과 기념품 숍"], ["가모가와 강변", "가와라마치", "저녁 산책과 카페 휴식"], ["교토역 빌딩", "교토역", "비 오는 날에도 전망과 식사를 해결하는 실내 대안"]],
  kamakura: [["유이가하마 해변", "유이가하마", "해변 산책과 노을 사진"], ["고마치도리", "가마쿠라역", "간식, 기념품, 카페를 짧게 연결"], ["쓰루가오카하치만구", "가마쿠라 중심", "대표 사찰과 넓은 산책 동선"], ["에노덴 가마쿠라코코마에역", "쇼난", "바다와 철길이 함께 보이는 사진 포인트"]],
  kaohsiung: [["보얼예술특구", "옌청", "항구와 그래픽 벽화를 함께 보는 코스"], ["미려도역", "신싱", "실내 스테인드글라스 사진 포인트"], ["리우허 야시장", "신싱", "야시장 로컬 음식과 저녁 동선"], ["아이허", "첸진", "강변 야경 산책"]],
  hongkong: [["셩완 골목", "셩완", "카페, 벽화, 로컬 상점을 잇는 고밀도 산책"], ["빅토리아 피크", "피크", "홍콩 하버 전망과 야경"], ["스타의 거리", "침사추이", "하버 산책과 사진 포인트"], ["PMQ", "센트럴", "디자인 숍과 실내 전시를 보는 대안"]],
  singapore: [["가든스 바이 더 베이", "마리나 베이", "야간 조명과 도시 정원을 함께 보는 코스"], ["하지레인", "부기스", "컬러풀한 벽화와 편집숍 산책"], ["티옹바루", "티옹바루", "카페와 로컬 동네 분위기"], ["마리나 베이 샌즈", "마리나 베이", "쇼핑, 전망, 실내 동선을 한 번에 해결"]],
  bangkok: [["아리 카페 거리", "아리", "카페와 로컬 미식을 짧은 동선으로 연결"], ["아이콘시암", "강변", "쇼핑, 식사, 실내 휴식을 한 번에 해결"], ["쩟페어 야시장", "라마9", "저녁 로컬 푸드와 활기 있는 사진"], ["왓아룬", "강변", "대표 사원과 강변 노을 사진"]],
  chiangmai: [["님만해민", "님만", "카페와 편집숍을 천천히 보는 동네"], ["왓프라싱", "올드시티", "사원과 로컬 골목 산책"], ["반캉왓", "서쪽", "공방, 카페, 사진을 함께 잡는 코스"], ["원님만", "님만", "비 오는 날에도 쇼핑과 식사를 해결"]],
  danang: [["미케비치", "해변", "아침 바다 산책과 리조트 휴식"], ["한시장", "시내", "기념품과 로컬 쇼핑"], ["바나힐", "근교", "대표 레저와 사진 포인트"], ["손짜 야시장", "시내", "저녁 로컬 음식과 가벼운 산책"]],
  hoian: [["호이안 올드타운", "올드타운", "등불 골목과 산책 사진"], ["안방비치", "해변", "낮에는 바다와 카페 휴식"], ["호이안 야시장", "올드타운", "저녁 간식과 기념품"], ["탄하 도자기마을", "근교", "체험형 레저와 로컬 공방"]],
  hanoi: [["하노이 올드쿼터", "호안끼엠", "골목 미식과 카페를 촘촘히 연결"], ["호안끼엠 호수", "중심", "아침 산책과 사진"], ["성요셉성당", "호안끼엠", "카페와 건축 사진"], ["롯데센터 전망대", "바딘", "비 오는 날 실내 전망 대안"]],
  hochiminh: [["타오디엔", "2군", "카페와 다이닝을 편하게 연결"], ["벤탄시장", "1군", "로컬 쇼핑과 간식"], ["응우옌후에 거리", "1군", "야간 도시 산책"], ["사이공 스카이덱", "1군", "실내 전망과 사진 포인트"]],
  bali: [["창구 비치", "창구", "해변과 카페, 선셋을 함께 보는 코스"], ["우붓 몽키 포레스트", "우붓", "자연과 산책 중심 레저"], ["테갈랄랑 라이스테라스", "우붓", "대표 자연 사진 포인트"], ["스미냑 비치클럽", "스미냑", "휴식과 선셋 구좌"]],
  cebu: [["막탄 리조트 비치", "막탄", "리조트 휴식과 해양 액티비티"], ["아얄라 센터 세부", "세부시티", "비 오는 날 쇼핑과 식사"], ["오슬롭 투어", "남부", "해양 레저 중심 일정"], ["시라오 가든", "세부시티", "컬러풀한 사진 포인트"]],
  kualalumpur: [["페트로나스 트윈타워", "KLCC", "대표 야경과 쇼핑"], ["잘란알로 야시장", "부킷빈탕", "다문화 미식과 저녁 거리"], ["페탈링 스트리트", "차이나타운", "로컬 시장과 카페"], ["바투 동굴", "근교", "컬러풀한 계단과 대표 사진 포인트"]],
  macau: [["세나도 광장", "마카오 반도", "포르투갈풍 거리와 디저트"], ["타이파 빌리지", "타이파", "골목 미식과 기념품"], ["마카오 타워", "남반호", "전망과 액티비티 구좌"], ["베네시안 마카오", "코타이", "실내 쇼핑과 호텔 구좌"]]
};

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
    const photo = destinationPhotos[destination.destinationId] ?? seed.photo;

    return {
      destination,
      photo,
      weather: buildWeatherAdvice(destination.destinationId, destination.destinationName, survey.travelWindow),
      transport: seed.transport,
      stays: seed.stays,
      activities: seed.activities ?? buildDefaultActivities(destination.destinationId, destination.destinationName),
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
  const stopPool = buildStopPool(destinationId, destinationName, basePlaces, seed, survey);

  return Array.from({ length: dayCount }, (_, index) => ({
    day: index + 1,
    title: titles[index] ?? `${index + 1}일차 취향 확장 루트`,
    items: buildDayItems(destinationName, stopPool, seed, index, survey)
  }));
}

function buildStopPool(destinationId: DestinationId, destinationName: string, basePlaces: Place[], seed: DestinationPlanSeed, survey: TripSurvey): StopCandidate[] {
  const candidates: StopCandidate[] = [
    ...buildCuratedStops(destinationId, destinationName),
    ...basePlaces.map((place) => ({
      placeName: place.name,
      area: place.category,
      activity: place.description,
      fitRationale: `${formatTagList(place.vibeTags)} 분위기가 프로필에서 보인 취향 신호와 연결됩니다.`,
      cost: place.estimatedCost,
      walkingLoad: place.walkingLoad,
      durationMinutes: place.durationMinutes,
      mapUrl: mapSearchUrl(`${destinationName} ${place.name}`),
      planB: "혼잡하면 같은 권역의 예약 가능한 전시, 쇼핑몰, 로컬 카페로 대체하세요."
    })),
    ...seed.photoSpots.map((spot) => ({
      placeName: spot.name,
      area: "포토 루트",
      activity: spot.summary,
      fitRationale: spot.why,
      cost: "low" as const,
      walkingLoad: "medium" as const,
      durationMinutes: 75,
      mapUrl: mapSearchUrl(`${destinationName} ${spot.name}`),
      planB: "날씨가 좋지 않으면 가까운 실내 포토 스팟이나 카페로 바꾸세요."
    })),
    ...seed.restaurants.map((restaurant) => ({
      placeName: restaurant.name,
      area: "식사",
      activity: restaurant.summary,
      fitRationale: restaurant.why,
      cost: "medium" as const,
      walkingLoad: "low" as const,
      durationMinutes: 90,
      mapUrl: mapSearchUrl(`${destinationName} ${restaurant.name}`),
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

function buildDayItems(destinationName: string, stopPool: StopCandidate[], seed: DestinationPlanSeed, dayIndex: number, survey: TripSurvey): ItineraryItem[] {
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
        durationMinutes: 90,
        mapUrl: mapSearchUrl(`${seed.transport[0]?.name ?? destinationName} ${destinationName}`),
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
      durationMinutes: 90,
      mapUrl: mapSearchUrl(`${destinationName} 로컬 골목`),
      planB: "동선이 길면 같은 권역 안에서 식사와 카페만 남기세요."
    },
    {
      placeName: `${destinationName} 감도 카페`,
      activity: wantsCafe ? "카페에서 쉬면서 사진과 다음 동선을 정리하는 시간" : "일정 중간 피로를 낮추는 실내 휴식",
      fitRationale: "프로필의 분위기 취향과 설문 피로도 조건을 함께 반영합니다.",
      cost: "medium",
      walkingLoad: "low",
      durationMinutes: 75,
      mapUrl: mapSearchUrl(`${destinationName} 카페`),
      planB: "만석이면 같은 역 주변의 조용한 베이커리나 티룸으로 대체하세요."
    },
    {
      placeName: `${destinationName} 야경 산책`,
      activity: wantsPhoto ? "해 질 무렵부터 야간 사진을 남기는 짧은 산책" : "저녁 식사 후 부담 없이 보는 야간 분위기",
      fitRationale: "하루 마지막에 기억에 남는 장면을 만들기 좋습니다.",
      cost: "free",
      walkingLoad: "medium",
      durationMinutes: 75,
      mapUrl: mapSearchUrl(`${destinationName} 야경`),
      planB: "비가 오면 전망 좋은 실내 쇼핑몰이나 호텔 라운지로 바꾸세요."
    },
    {
      placeName: `${destinationName} 편집숍 거리`,
      activity: wantsShopping ? "브랜드 숍과 기념품 후보를 짧게 비교" : "동네 분위기를 보는 가벼운 쇼핑 산책",
      fitRationale: "취향을 드러내는 물건과 공간을 일정에 넣습니다.",
      cost: "medium",
      walkingLoad: "medium",
      durationMinutes: 75,
      mapUrl: mapSearchUrl(`${destinationName} 편집숍`),
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

function item(
  name: string,
  summary: string,
  why: string,
  businessType?: RecommendationItem["businessType"],
  ctaLabel?: string,
  ctaUrl?: string
): RecommendationItem[] {
  return [{ name, summary, why, businessType, ctaLabel, ctaUrl }];
}

function buildCuratedStops(destinationId: DestinationId, destinationName: string): StopCandidate[] {
  const seeds = curatedStopSeeds[destinationId] ?? [
    [`${destinationName} 대표 동네`, "중심권", "대표 거리와 카페를 한 번에 보는 코스"],
    [`${destinationName} 로컬 미식 거리`, "식사권", "현지 식당과 작은 상점을 이어보는 코스"],
    [`${destinationName} 전망 포인트`, "전망권", "여행지 분위기를 사진으로 남기는 코스"],
    [`${destinationName} 실내 대안지`, "실내", "비가 오거나 더울 때 쇼핑과 휴식을 해결하는 코스"]
  ];

  return seeds.map(([placeName, area, activity], index) => ({
    placeName,
    area,
    activity,
    fitRationale: `${area} 권역에서 ${activity}라서 프로필 취향과 설문 조건을 일정 안에 구체적으로 옮기기 좋습니다.`,
    cost: index === 2 ? "low" : "medium",
    walkingLoad: index === 3 ? "low" : "medium",
    durationMinutes: index === 1 ? 90 : 75,
    mapUrl: mapSearchUrl(`${destinationName} ${placeName}`),
    planB: "운영시간, 날씨, 대기 상황이 맞지 않으면 같은 권역의 카페, 쇼핑몰, 예약 가능한 전시로 바꾸세요."
  }));
}

function buildDefaultActivities(destinationId: DestinationId | undefined, destinationName: string): RecommendationItem[] {
  const activityNameByDestination: Partial<Record<DestinationId, string>> = {
    jeju: "오름 선셋 또는 해안 드라이브",
    busan: "요트투어 또는 해변 야경 산책",
    tokyo: "전시/팝업 예약",
    osaka: "도톤보리 푸드 워크",
    bangkok: "마사지와 루프톱 바",
    singapore: "야간 가든 라이트쇼",
    hongkong: "피크 트램과 하버 야경",
    macau: "마카오 타워 전망",
    bali: "선셋 비치클럽",
    cebu: "호핑투어 또는 리조트 액티비티"
  };
  const name = (destinationId && activityNameByDestination[destinationId]) || `${destinationName} 반나절 액티비티`;

  return item(
    name,
    "일정 중 한 구좌는 예약 가능한 체험으로 두어 추천 결과가 실제 구매 행동으로 이어지게 합니다.",
    "프로필 취향에 맞는 장면을 만들면서 항공/숙소 외 레저 매출 구좌로 확장하기 좋습니다.",
    "activity",
    "레저 보기",
    mapSearchUrl(`${destinationName} 액티비티`)
  );
}

function buildWeatherAdvice(destinationId: DestinationId, destinationName: string, travelWindow: string): DestinationWeatherAdvice {
  const month = parseTravelMonth(travelWindow);
  const monthLabel = month ? `${month}월` : travelWindow || "선택한 시기";
  const country = destinations.find((destination) => destination.id === destinationId)?.country;
  const rainy = isRainySeason(destinationId, month);
  const dry = isDrySeason(destinationId, month);
  const winter = isWinterSeason(destinationId, month);
  const summer = isSummerSeason(destinationId, month);
  const seasonType: DestinationWeatherAdvice["seasonType"] = rainy ? "rainy" : dry ? "dry" : winter ? "winter" : summer ? "summer" : month ? "mixed" : "unknown";

  if (!month) {
    return {
      title: `${destinationName} 여행 시기 체크`,
      seasonType,
      summary: "출발 월이 확정되면 우기, 건기, 기온 차이를 반영해 준비물을 더 정확히 조정할 수 있습니다.",
      preparation: ["가벼운 겉옷", "편한 신발", "모바일 예약 확인"],
      cautions: ["실외 일정은 현지 예보와 영업시간을 한 번 더 확인하세요."]
    };
  }

  if (rainy) {
    return {
      title: `${monthLabel} ${destinationName} 날씨`,
      seasonType,
      summary: `${monthLabel}의 ${destinationName}은 소나기나 비가 일정에 영향을 줄 수 있는 시기입니다. 실외 사진 루트는 오전/비 그친 직후로 두고, 오후에는 카페, 쇼핑몰, 전시 같은 실내 Plan B를 함께 잡는 편이 좋습니다.`,
      preparation: ["작은 우산 또는 얇은 우비", "젖어도 부담 없는 신발", "방수 파우치", "얇고 빨리 마르는 옷"],
      cautions: ["갑작스러운 소나기로 이동 시간이 늘 수 있습니다.", "해변, 전망대, 야외 레저는 당일 운영 여부를 확인하세요."]
    };
  }

  if (winter) {
    return {
      title: `${monthLabel} ${destinationName} 날씨`,
      seasonType,
      summary: `${monthLabel}의 ${destinationName}은 체감 온도와 실내외 온도 차이를 신경 써야 하는 시기입니다. 야경과 산책 일정은 짧게 나누고, 중간에 따뜻한 카페나 실내 쇼핑 동선을 넣는 편이 안정적입니다.`,
      preparation: country === "Japan" || country === "Korea" ? ["두꺼운 외투", "목도리/장갑", "보온용 이너", "따뜻한 신발"] : ["가벼운 겉옷", "긴팔 상의", "실내 냉방 대비용 숄"],
      cautions: ["해 질 무렵 이후 체감 온도가 내려갈 수 있습니다.", "눈이나 강풍이 있으면 전망/야외 일정은 실내 대안으로 바꾸세요."]
    };
  }

  if (summer) {
    return {
      title: `${monthLabel} ${destinationName} 날씨`,
      seasonType,
      summary: `${monthLabel}의 ${destinationName}은 더위와 강한 햇빛을 전제로 동선을 짜는 편이 좋습니다. 야외 이동은 오전과 해 질 무렵에 배치하고, 한낮에는 실내 쇼핑, 카페, 전시를 넣으세요.`,
      preparation: ["얇고 통풍 좋은 옷", "선크림", "모자 또는 선글라스", "휴대용 물병"],
      cautions: ["한낮 장거리 도보는 피로도가 크게 올라갑니다.", "냉방이 강한 실내와 야외 온도 차이에 대비하세요."]
    };
  }

  if (dry) {
    return {
      title: `${monthLabel} ${destinationName} 날씨`,
      seasonType,
      summary: `${monthLabel}의 ${destinationName}은 비교적 야외 일정을 잡기 좋은 건기권입니다. 전망, 야시장, 해변, 골목 산책을 일정의 중심에 두되 햇빛과 일교차는 챙기면 좋습니다.`,
      preparation: ["가벼운 겉옷", "선크림", "편한 신발", "보조 배터리"],
      cautions: ["인기 야외 스팟은 일몰 시간대에 혼잡할 수 있습니다.", "건기라도 현지 단기 예보는 출발 전 확인하세요."]
    };
  }

  return {
    title: `${monthLabel} ${destinationName} 날씨`,
    seasonType,
    summary: `${monthLabel}의 ${destinationName}은 계절 전환기 성격이 있어 실내외 일정을 섞는 편이 좋습니다. 오전에는 산책과 사진, 오후에는 카페와 쇼핑을 배치하면 날씨 리스크가 줄어듭니다.`,
    preparation: ["얇은 겉옷", "접이식 우산", "편한 신발", "예약 확인 캡처"],
    cautions: ["일교차와 짧은 비 가능성에 대비하세요.", "야외 레저는 취소 규정을 확인하세요."]
  };
}

function isRainySeason(destinationId: DestinationId, month: number | null): boolean {
  if (!month) return false;
  if (["bangkok", "chiangmai"].includes(destinationId)) return month >= 5 && month <= 10;
  if (["danang", "hoian"].includes(destinationId)) return month >= 9 && month <= 12;
  if (["hanoi", "hochiminh"].includes(destinationId)) return month >= 5 && month <= 10;
  if (destinationId === "bali") return month >= 11 || month <= 3;
  if (destinationId === "cebu") return month >= 6 && month <= 11;
  if (["singapore", "kualalumpur"].includes(destinationId)) return month >= 11 || month <= 1;
  if (["taipei", "tainan", "kaohsiung", "hongkong", "macau", "miyakojima"].includes(destinationId)) return month >= 5 && month <= 9;
  if (["seoul", "jeju", "busan", "mokpo", "namhae", "fukuoka", "tokyo", "osaka", "kyoto", "kamakura", "matsuyama"].includes(destinationId)) return month >= 6 && month <= 7;
  return false;
}

function isDrySeason(destinationId: DestinationId, month: number | null): boolean {
  if (!month || isRainySeason(destinationId, month)) return false;
  if (["bangkok", "chiangmai", "cebu"].includes(destinationId)) return month >= 12 || month <= 2;
  if (["bali", "danang", "hoian"].includes(destinationId)) return month >= 4 && month <= 8;
  if (["taipei", "tainan", "kaohsiung", "hongkong", "macau"].includes(destinationId)) return month >= 10 || month <= 3;
  return month >= 9 && month <= 11;
}

function isWinterSeason(destinationId: DestinationId, month: number | null): boolean {
  if (!month) return false;
  return ["seoul", "jeju", "busan", "mokpo", "namhae", "fukuoka", "sapporo", "kyoto", "tokyo", "osaka", "kamakura", "matsuyama"].includes(destinationId) && (month === 12 || month <= 2);
}

function isSummerSeason(destinationId: DestinationId, month: number | null): boolean {
  if (!month || isRainySeason(destinationId, month)) return false;
  return month >= 7 && month <= 8;
}

function parseTravelMonth(value: string): number | null {
  const match = value.match(/(\d{1,2})\s*월/);
  if (!match) return null;
  const month = Number(match[1]);
  return month >= 1 && month <= 12 ? month : null;
}

function mapSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function hotelSearchUrl(query: string): string {
  return `https://www.google.com/travel/hotels?q=${encodeURIComponent(`${query} 숙소`)}`;
}

function flightSearchUrl(query: string): string {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(`${query} 항공권`)}`;
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
    transport: item(`${destinationName} 중심 교통`, "공항/역에서 숙소와 핵심 권역을 먼저 연결", "초반 이동 피로를 줄이고 일정 밀도를 안정적으로 맞춥니다.", "flight", "항공/교통 보기", flightSearchUrl(destinationName)),
    stays: item(`${destinationName} 중심권 숙소`, summary, "추천 장소 사이 이동 시간을 줄이고 밤 일정 이후 복귀가 쉽습니다.", "stay", "숙소 보기", hotelSearchUrl(destinationName)),
    activities: buildDefaultActivities(undefined, destinationName),
    restaurants: item(`${destinationName} 로컬 맛집`, "현지 대표 메뉴와 캐주얼 다이닝", "로컬 음식과 동네 분위기를 함께 보는 취향을 일정에 반영합니다.", "food", "맛집 지도 보기", mapSearchUrl(`${destinationName} 맛집`)),
    photoSpots: item(`${destinationName} 대표 포토 루트`, "도시나 자연의 분위기가 잘 드러나는 산책 지점", "프로필에 남기기 좋은 장면과 여행 컨셉을 함께 만듭니다.", "photo", "포토 스팟 보기", mapSearchUrl(`${destinationName} 포토 스팟`))
  };
}
