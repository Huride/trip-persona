import { describe, expect, it } from "vitest";
import { parseInstagramSeoHtml } from "../src/lib/instagram";

describe("parseInstagramSeoHtml", () => {
  it("extracts public SEO profile metadata as usable live profile text", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="BEAUTIFUL DESTINATIONS (&#064;beautifuldestinations) &#x2022; Instagram photos and videos" />
        <meta property="og:description" content="25M Followers, 45 Following, 14K Posts - See Instagram photos and videos from BEAUTIFUL DESTINATIONS (&#064;beautifuldestinations)" />
      </head></html>
    `;

    const result = parseInstagramSeoHtml(html, "https://www.instagram.com/beautifuldestinations/");

    expect(result).toEqual(
      expect.objectContaining({
        source: "live",
        username: "beautifuldestinations"
      })
    );
    expect(result?.profileText).toContain("BEAUTIFUL DESTINATIONS");
    expect(result?.profileText).toContain("@beautifuldestinations");
  });

  it("returns null when SEO metadata is not present", () => {
    expect(parseInstagramSeoHtml("<html><head></head><body>Log in</body></html>", "https://www.instagram.com/foo/")).toBeNull();
  });
});
