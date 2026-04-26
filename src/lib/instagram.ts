import { chromium } from "playwright";
import { selectFallbackSampleId } from "./profileAnalysis";
import { sampleProfiles } from "./sampleProfiles";
import type { ProfileEvidenceImage } from "./types";

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

  try {
    const seoProfile = await fetchInstagramSeoProfile(instagramUrl);
    if (seoProfile) return seoProfile;
  } catch {
    // Continue to the browser attempt below.
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(instagramUrl, { waitUntil: "domcontentloaded", timeout: 12000 });
    await page.waitForTimeout(2500);
    const text = await page.locator("body").innerText({ timeout: 3000 });
    await browser.close();
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
