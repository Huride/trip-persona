export interface SampleProfile {
  id: string;
  label: string;
  bio: string;
  captions: string[];
  hashtags: string[];
  imageDescriptions: string[];
}

export const sampleProfiles: SampleProfile[] = [
  {
    id: "cafe-gallery",
    label: "Cafe Gallery Profile",
    bio: "coffee, books, small galleries, quiet weekends",
    captions: ["서촌에서 발견한 작은 전시", "햇빛 좋은 카페에서 오후 보내기", "사람 적은 골목이 좋다"],
    hashtags: ["cafe", "gallery", "slowday", "seoulwalk"],
    imageDescriptions: ["minimal cafe interior", "small gallery wall", "quiet alley with warm light"]
  },
  {
    id: "ocean-nature",
    label: "Ocean Nature Profile",
    bio: "sea, islands, slow mornings, no rush",
    captions: ["바다 보면서 아무것도 안 하기", "흐린 날에도 좋은 해안도로", "많이 걷지 않아도 되는 여행"],
    hashtags: ["ocean", "island", "slowtravel", "healing"],
    imageDescriptions: ["blue ocean", "coastal road", "quiet beach"]
  },
  {
    id: "food-city",
    label: "Food City Profile",
    bio: "local food, night markets, city energy",
    captions: ["여행은 결국 맛집 기억", "야시장과 골목 사이", "짧아도 밀도 있게"],
    hashtags: ["food", "nightmarket", "citytrip", "local"],
    imageDescriptions: ["street food", "busy night street", "small local restaurant"]
  }
];
