import { describe, expect, it } from "vitest";
import { parseInstagramSeoHtml, parseInstagramWebProfileInfo, selectInstagramFeedImages } from "../src/lib/instagram";

describe("parseInstagramSeoHtml", () => {
  it("extracts public SEO profile metadata as usable live profile text", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="BEAUTIFUL DESTINATIONS (&#064;beautifuldestinations) &#x2022; Instagram photos and videos" />
        <meta property="og:description" content="25M Followers, 45 Following, 14K Posts - See Instagram photos and videos from BEAUTIFUL DESTINATIONS (&#064;beautifuldestinations)" />
        <meta property="og:image" content="https://cdn.example.com/profile.jpg?size=100" />
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
    expect(result?.profileImages).toEqual([]);
  });

  it("returns null when SEO metadata is not present", () => {
    expect(parseInstagramSeoHtml("<html><head></head><body>Log in</body></html>", "https://www.instagram.com/foo/")).toBeNull();
  });
});

describe("selectInstagramFeedImages", () => {
  it("keeps feed images and excludes profile pictures", () => {
    const images = selectInstagramFeedImages(
      [
        {
          src: "https://cdn.example.com/profile.jpg",
          alt: "hsyang.johan's profile picture",
          width: 150,
          height: 150
        },
        {
          src: "https://cdn.example.com/feed-1.jpg",
          alt: "Photo by Johan in 앤트러사이트 서교점.",
          width: 311,
          height: 311
        },
        {
          src: "https://cdn.example.com/feed-2.jpg",
          alt: "Photo by Johan on October 17, 2022.",
          width: 311,
          height: 311
        }
      ],
      "hsyang.johan"
    );

    expect(images).toEqual([
      {
        url: "https://cdn.example.com/feed-1.jpg",
        alt: "Photo by Johan in 앤트러사이트 서교점.",
        source: "Instagram feed",
        tags: expect.any(Array)
      },
      {
        url: "https://cdn.example.com/feed-2.jpg",
        alt: "Photo by Johan on October 17, 2022.",
        source: "Instagram feed",
        tags: expect.any(Array)
      }
    ]);
  });
});

describe("parseInstagramWebProfileInfo", () => {
  it("extracts feed images, captions, and locations from public web profile JSON", () => {
    const result = parseInstagramWebProfileInfo(
      {
        data: {
          user: {
            username: "hsyang.johan",
            full_name: "Johan",
            biography: "",
            edge_followed_by: { count: 121 },
            edge_follow: { count: 150 },
            edge_owner_to_timeline_media: {
              count: 2,
              edges: [
                {
                  node: {
                    display_url: "https://cdn.example.com/feed-1.jpg",
                    thumbnail_src: "https://cdn.example.com/feed-1-thumb.jpg",
                    accessibility_caption: "Photo by Johan in 앤트러사이트 서교점.",
                    edge_media_to_caption: { edges: [{ node: { text: "커피 마시러" } }] },
                    location: { name: "앤트러사이트 서교점" },
                    dimensions: { width: 1080, height: 809 }
                  }
                },
                {
                  node: {
                    display_url: "https://cdn.example.com/feed-2.jpg",
                    accessibility_caption: "Photo by Johan on January 10, 2020.",
                    edge_media_to_caption: { edges: [{ node: { text: "#간만에드로잉" } }] },
                    dimensions: { width: 1080, height: 1080 }
                  }
                }
              ]
            }
          }
        }
      },
      "https://www.instagram.com/hsyang.johan/"
    );

    expect(result).toEqual(expect.objectContaining({ source: "live", username: "hsyang.johan" }));
    expect(result?.profileText).toContain("display name: Johan");
    expect(result?.profileText).toContain("커피 마시러");
    expect(result?.profileText).toContain("앤트러사이트 서교점");
    expect(result?.profileImages).toHaveLength(2);
    expect(result?.profileImages?.[0]).toEqual(
      expect.objectContaining({
        url: "https://cdn.example.com/feed-1.jpg",
        alt: "Photo by Johan in 앤트러사이트 서교점.",
        source: "Instagram public API"
      })
    );
  });
});
