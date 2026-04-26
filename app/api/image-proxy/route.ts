import { NextResponse } from "next/server";
import { isAllowedProxyImageUrl } from "@/src/lib/imageProxy";

export async function GET(request: Request) {
  const imageUrl = new URL(request.url).searchParams.get("url");
  if (!imageUrl || !isAllowedProxyImageUrl(imageUrl)) {
    return NextResponse.json({ error: "Unsupported image URL" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        referer: "https://www.instagram.com/",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Image fetch failed" }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "URL is not an image" }, { status: 415 });
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "cache-control": "public, max-age=300, s-maxage=300",
        "content-type": contentType
      }
    });
  } catch {
    return NextResponse.json({ error: "Image proxy failed" }, { status: 502 });
  }
}
