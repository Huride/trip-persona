import { chromium } from "playwright";
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
  const imageUrl = readMetaContent(html, "og:image");
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
    profileImages: imageUrl
      ? [
          {
            url: decodeHtml(imageUrl),
            alt: `${displayName || username} Instagram profile image`,
            source: "Instagram SEO"
          }
        ]
      : []
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
    .slice(0, 6)
    .map((image) => ({
      url: image.src,
      alt: image.alt,
      source: "Instagram feed"
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
    if (feedImages.length === 0 && !isUsableProfileText(data.text)) return null;

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
