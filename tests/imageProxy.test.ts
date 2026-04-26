import { describe, expect, it } from "vitest";
import { isAllowedProxyImageUrl, toProxiedImageUrl } from "../src/lib/imageProxy";

describe("isAllowedProxyImageUrl", () => {
  it("allows Instagram CDN image URLs", () => {
    expect(isAllowedProxyImageUrl("https://scontent-icn2-1.cdninstagram.com/v/t51.82787-15/foo.jpg")).toBe(true);
  });

  it("allows known public mirror image URLs for demo fallback evidence", () => {
    expect(isAllowedProxyImageUrl("https://legacy.kpopping.com/e0/4/chuucandoit-photo.jpeg")).toBe(true);
  });

  it("rejects non-image proxy targets outside the allowlist", () => {
    expect(isAllowedProxyImageUrl("http://scontent-icn2-1.cdninstagram.com/foo.jpg")).toBe(false);
    expect(isAllowedProxyImageUrl("https://example.com/foo.jpg")).toBe(false);
    expect(isAllowedProxyImageUrl("not-a-url")).toBe(false);
  });
});

describe("toProxiedImageUrl", () => {
  it("encodes source image URLs for the proxy route", () => {
    const result = toProxiedImageUrl("https://scontent-icn2-1.cdninstagram.com/foo.jpg?x=1&y=2");

    expect(result).toBe("/api/image-proxy?url=https%3A%2F%2Fscontent-icn2-1.cdninstagram.com%2Ffoo.jpg%3Fx%3D1%26y%3D2");
  });
});
