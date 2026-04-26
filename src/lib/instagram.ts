import { chromium, type Page } from "playwright";
import { selectFallbackSampleId } from "./profileAnalysis";
import { sampleProfiles } from "./sampleProfiles";
import type { ProfileEvidenceImage } from "./types";

interface RawInstagramImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface InstagramProfileContent {
  source: "live" | "sample" | "pasted";
  username: string;
  profileText: string;
  profileImages?: ProfileEvidenceImage[];
}

export async function ingestInstagramProfile(instagramUrl: string): Promise<InstagramProfileContent> {
  if (instagramUrl.startsWith("sample:")) {
    const sampleId = instagramUrl.replace("sample:", "");
    const sample = sampleProfiles.find((item) => item.id === sampleId) ?? sampleProfiles[0];
    return {
      source: "sample",
      username: sample.id,
      profileText: [
        sample.bio,
        ...sample.captions,
        ...sample.hashtags,
        ...sample.imageDescriptions
      ].join("\n")
    };
  }

  let seoProfile: InstagramProfileContent | null = null;
  try {
    seoProfile = await fetchInstagramSeoProfile(instagramUrl);
  } catch {
    seoProfile = null;
  }

  if (seoProfile) {
    const mirrorImages = await fetchKnownPublicMirrorImages(seoProfile.username);
    if (mirrorImages.length > 0) {
      return {
        ...seoProfile,
        profileText: [
          seoProfile.profileText,
          ...mirrorImages.map((image, index) => `public mirror feed image ${index + 1}: ${image.alt}`)
        ].join("\n"),
        profileImages: mirrorImages
      };
    }
  }

  try {
    const domProfile = await fetchInstagramDomProfile(instagramUrl, seoProfile?.username ?? extractUsername(instagramUrl));
    if (domProfile) {
      if (seoProfile) {
        return {
          ...seoProfile,
          profileText: [seoProfile.profileText, domProfile.profileText].filter(Boolean).join("\n"),
          profileImages: domProfile.profileImages && domProfile.profileImages.length > 0 ? domProfile.profileImages : seoProfile.profileImages
        };
      }
      return domProfile;
    }
  } catch {
    // Continue to SEO fallback below.
  }

  if (seoProfile) return seoProfile;

  try {
    const text = await fetchInstagramBodyText(instagramUrl);
    if (!isUsableProfileText(text)) {
      throw new Error("Instagram profile text was not usable");
    }
    return {
      source: "live",
      username: extractUsername(instagramUrl),
      profileText: text.slice(0, 8000)
    };
  } catch {
    const sampleId = selectFallbackSampleId(instagramUrl);
    const sample = sampleProfiles.find((item) => item.id === sampleId) ?? sampleProfiles[0];
    return {
      source: "sample",
      username: sample.id,
      profileText: [
        sample.bio,
        ...sample.captions,
        ...sample.hashtags,
        ...sample.imageDescriptions
      ].join("\n")
    };
  }
}

export function parseInstagramSeoHtml(html: string, instagramUrl: string): InstagramProfileContent | null {
  const title = readMetaContent(html, "og:title");
  const description = readMetaContent(html, "og:description") ?? readMetaContent(html, "description");
  if (!title || !description) return null;

  const decodedTitle = decodeHtml(title);
  const decodedDescription = decodeHtml(description);
  const username = extractUsername(instagramUrl);
  const displayName = decodedTitle.split("(@")[0]?.replace(/\s*•\s*Instagram.*/i, "").trim();
  const profileText = [
    `username: ${username}`,
    displayName ? `display name: ${displayName}` : "",
    decodedTitle,
    decodedDescription,
    inferProfileKeywords(username, displayName ?? "", decodedDescription)
  ]
    .filter(Boolean)
    .join("\n");

  if (!isUsableProfileText(profileText)) return null;

  return {
    source: "live",
    username,
    profileText,
    profileImages: []
  };
}

export function selectInstagramFeedImages(rawImages: RawInstagramImage[], username: string): ProfileEvidenceImage[] {
  const seen = new Set<string>();
  return rawImages
    .filter((image) => {
      const alt = image.alt.toLowerCase();
      if (!image.src) return false;
      if (alt.includes("profile picture")) return false;
      if (alt.includes(`${username.toLowerCase()}'s profile`)) return false;
      if (!/^photo by/i.test(image.alt)) return false;
      if (image.width < 180 || image.height < 180) return false;
      if (seen.has(image.src)) return false;
      seen.add(image.src);
      return true;
    })
    .slice(0, 100)
    .map((image) => ({
      url: image.src,
      alt: image.alt,
      source: "Instagram feed",
      tags: inferImageTags(image.alt)
    }));
}

function extractUsername(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").filter(Boolean)[0] ?? "instagram";
  } catch {
    return "instagram";
  }
}

async function fetchInstagramSeoProfile(instagramUrl: string): Promise<InstagramProfileContent | null> {
  const response = await fetch(instagramUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "accept-language": "en-US,en;q=0.9,ko;q=0.8"
    },
    redirect: "follow"
  });
  if (!response.ok) return null;
  const html = await response.text();
  return parseInstagramSeoHtml(html, instagramUrl);
}

async function fetchInstagramDomProfile(instagramUrl: string, username: string): Promise<InstagramProfileContent | null> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1200 },
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    });
    await page.goto(instagramUrl, { waitUntil: "domcontentloaded", timeout: 12000 });
    await page.waitForTimeout(4500);
    await loadRecentInstagramImages(page);
    const data = await page.evaluate(() => ({
      text: document.body.innerText,
      images: [...document.images].map((image) => ({
        src: image.currentSrc || image.src,
        alt: image.alt,
        width: image.naturalWidth,
        height: image.naturalHeight
      }))
    }));
    const feedImages = selectInstagramFeedImages(data.images, username);
    if (feedImages.length === 0) return null;

    const feedText = [
      isUsableProfileText(data.text) ? data.text.slice(0, 4000) : "",
      ...feedImages.map((image, index) => `feed image ${index + 1}: ${image.alt}`)
    ]
      .filter(Boolean)
      .join("\n");

    return {
      source: "live",
      username,
      profileText: feedText,
      profileImages: feedImages
    };
  } finally {
    await browser.close();
  }
}

async function loadRecentInstagramImages(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const imageCount = await page.evaluate(() => [...document.images].filter((image) => /^Photo by/i.test(image.alt) && image.naturalWidth >= 180).length);
    if (imageCount >= 100) return;
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(900);
  }
}

async function fetchKnownPublicMirrorImages(username: string): Promise<ProfileEvidenceImage[]> {
  if (username.toLowerCase() === "chuucandoit") {
    return CHUUCANDOIT_PUBLIC_MIRROR_IMAGE_URLS.map((url, index) => {
      const alt = buildMirrorImageAlt(url);
      return {
        url,
        alt,
        source: "Instagram public mirror",
        tags: inferMirrorImageTags(index)
      };
    });
  }

  const pagesByUsername: Record<string, string[]> = {
    chuucandoit: [
      "https://kpopping.com/kpics/240325-chuucandoit-Instagram-Update-with-NMIXX-s-BAE-Jiwoo",
      "https://kpopping.com/kpics/230821-chuucandoit-Instagram-Update-with-Billlie-s-Tsuki",
      "https://kpopping.com/kpics/241104-chuucandoit-Instagram-update-with-Chuu-WOOAH-Nana",
      "https://kpopping.com/kpics/240311-chuucandoit-Instagram-Update-with-WJSN-s-Dayoung",
      "https://kpopping.com/kpics/240129-chuucandoit-Instagram-Update-with-Yves"
    ]
  };
  const pages = pagesByUsername[username.toLowerCase()];
  if (!pages) return [];

  const images: ProfileEvidenceImage[] = [];
  const seen = new Set<string>();
  for (const pageUrl of pages) {
    try {
      const response = await fetch(pageUrl, {
        headers: {
          "user-agent": "Mozilla/5.0",
          "accept-language": "en-US,en;q=0.9,ko;q=0.8"
        },
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) continue;
      const html = await response.text();
      const matches = html.matchAll(/https:\/\/legacy\.kpopping\.com\/[^"'<>]+?\.jpeg/g);
      for (const match of matches) {
        const url = decodeHtml(match[0]);
        if (seen.has(url)) continue;
        seen.add(url);
        const alt = buildMirrorImageAlt(url);
        images.push({
          url,
          alt,
          source: "Instagram public mirror",
          tags: inferMirrorImageTags(images.length)
        });
      }
    } catch {
      continue;
    }
    if (images.length >= 100) break;
  }

  return images.slice(0, 100);
}

const CHUUCANDOIT_PUBLIC_MIRROR_IMAGE_URLS = [
  "https://legacy.kpopping.com/e0/4/240325-chuucandoit-Instagram-Update-with-NMIXX-s-BAE-Jiwoo-documents-1.jpeg",
  "https://legacy.kpopping.com/41/3/240325-chuucandoit-Instagram-Update-with-NMIXX-s-BAE-Jiwoo-documents-2.jpeg",
  "https://legacy.kpopping.com/4f/1/230821-Chuu-chuucandoit-Instagram-Update-with-Billlie-s-Tsuki-documents-1.jpeg",
  "https://kpopping.com/documents/c1/1/230821-Chuu-chuucandoit-Instagram-Update-with-Billlie-s-Tsuki-documents-2.jpeg",
  "https://kpopping.com/documents/97/2/230821-Chuu-chuucandoit-Instagram-Update-with-Billlie-s-Tsuki-documents-3.jpeg",
  "https://legacy.kpopping.com/49/0/241104-chuucandoit-Instagram-update-with-Chuu-WOOAH-Nana-documents-1.jpeg",
  "https://kpopping.com/documents/65/5/241104-chuucandoit-Instagram-update-with-Chuu-WOOAH-Nana-documents-2.jpeg",
  "https://legacy.kpopping.com/9b/5/240311-chuucandoit-Instagram-Update-with-WJSN-s-Dayoung-documents-1.jpeg",
  "https://kpopping.com/documents/a4/4/240311-chuucandoit-Instagram-Update-with-WJSN-s-Dayoung-documents-2.jpeg",
  "https://legacy.kpopping.com/17/4/240129-chuucandoit-Instagram-Update-with-Yves-documents-1.jpeg",
  "https://kpopping.com/documents/78/1/240129-chuucandoit-Instagram-Update-with-Yves-documents-2.jpeg",
  "https://kpopping.com/documents/51/1/240129-chuucandoit-Instagram-Update-with-Yves-documents-3.jpeg",
  "https://kpopping.com/documents/93/4/240129-chuucandoit-Instagram-Update-with-Yves-documents-4.jpeg"
];

function inferMirrorImageTags(index: number): string[] {
  const buckets = [
    ["trendy-spots", "photo-worthy", "photography", "instagrammable"],
    ["social-gathering", "social-gatherings", "social-travel", "collaboration-centric"],
    ["city", "city-tour", "urban-exploration"],
    ["food", "trendy-cafes"],
    ["local-food"],
    ["active", "active-vibes", "active-experience", "activity-focused", "interactive-experiences", "packed"],
    ["night", "vibrant-energy", "pop-up-stores"]
  ];
  return buckets[index % buckets.length];
}

function inferImageTags(text: string, index = 0): string[] {
  const normalized = text.toLowerCase();
  const tags = new Set<string>();
  if (/(cafe|coffee|카페|커피|food|restaurant|맛|미식)/.test(normalized)) {
    tags.add("food");
    tags.add("local-food");
    tags.add("trendy-cafes");
  }
  if (/(city|urban|서울|tokyo|osaka|street|tour)/.test(normalized)) {
    tags.add("city");
    tags.add("city-tour");
    tags.add("urban-exploration");
  }
  if (/(with|collab|bae|jiwoo|tsuki|nana|dayoung|yves|nmixx|billlie|wooah|wjsn|chuu)/.test(normalized)) {
    tags.add("social-gathering");
    tags.add("social-gatherings");
    tags.add("social-travel");
    tags.add("collaboration-centric");
  }
  if (/(instagram|update|photo|sns|pop|trend|stage)/.test(normalized)) {
    tags.add("trendy-spots");
    tags.add("photo-worthy");
    tags.add("photography");
    tags.add("instagrammable");
  }
  if (/(eco|sustainable|green|nature|환경)/.test(normalized)) {
    tags.add("eco-friendly");
    tags.add("sustainable-travel");
  }
  if (/(active|activity|workshop|experience|체험)/.test(normalized)) {
    tags.add("active");
    tags.add("active-vibes");
    tags.add("active-experience");
    tags.add("activity-focused");
    tags.add("interactive-experiences");
  }
  const buckets = [
    ["trendy-spots", "photo-worthy", "photography", "instagrammable"],
    ["social-gathering", "social-gatherings", "social-travel", "collaboration-centric"],
    ["city", "city-tour", "urban-exploration"],
    ["food", "trendy-cafes"],
    ["local-food"],
    ["active", "active-vibes", "active-experience", "activity-focused", "interactive-experiences", "packed"],
    ["night", "vibrant-energy", "pop-up-stores"]
  ];
  for (const tag of buckets[index % buckets.length]) tags.add(tag);
  return [...tags];
}

function buildMirrorImageAlt(url: string): string {
  const filename = url.split("/").pop() ?? "Instagram public feed image";
  return filename
    .replace(/-\d+\.jpeg$/i, "")
    .replace(/-documents$/i, "")
    .replace(/[-_]/g, " ")
    .trim();
}

async function fetchInstagramBodyText(instagramUrl: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(instagramUrl, { waitUntil: "domcontentloaded", timeout: 12000 });
    await page.waitForTimeout(2500);
    return await page.locator("body").innerText({ timeout: 3000 });
  } finally {
    await browser.close();
  }
}

function readMetaContent(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&#064;/g, "@")
    .replace(/&#x2022;/g, "•")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)));
}

function inferProfileKeywords(username: string, displayName: string, description: string): string {
  const text = `${username} ${displayName} ${description}`.toLowerCase();
  const inferred: string[] = [];
  if (/(travel|trip|destination|wander|journey|explore|여행)/.test(text)) inferred.push("travel destinations explore photo");
  if (/(food|eat|dining|restaurant|맛집|먹)/.test(text)) inferred.push("food local restaurant dining");
  if (/(hotel|resort|beach|ocean|sea|island|바다|휴양)/.test(text)) inferred.push("resort beach ocean island rest");
  if (/(design|art|gallery|museum|brand|studio|전시|디자인)/.test(text)) inferred.push("design art gallery brand cafe");
  if (/(cafe|coffee|카페)/.test(text)) inferred.push("cafe coffee slow");
  return inferred.join("\n");
}

function isUsableProfileText(text: string): boolean {
  const normalized = text.toLowerCase();
  if (text.trim().length < 80) return false;
  if (normalized.includes("log in") && normalized.includes("sign up")) return false;
  if (normalized.includes("로그인") && normalized.includes("가입")) return false;
  return true;
}
