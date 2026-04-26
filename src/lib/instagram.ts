import { chromium } from "playwright";
import { selectFallbackSampleId } from "./profileAnalysis";
import { sampleProfiles } from "./sampleProfiles";

export interface InstagramProfileContent {
  source: "live" | "sample" | "pasted";
  username: string;
  profileText: string;
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

function extractUsername(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").filter(Boolean)[0] ?? "instagram";
  } catch {
    return "instagram";
  }
}

function isUsableProfileText(text: string): boolean {
  const normalized = text.toLowerCase();
  if (text.trim().length < 80) return false;
  if (normalized.includes("log in") && normalized.includes("sign up")) return false;
  if (normalized.includes("로그인") && normalized.includes("가입")) return false;
  return true;
}
