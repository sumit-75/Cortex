export type Platform = "youtube" | "twitter";

export type OEmbedResult = {
  platform: Platform;
  title: string;
  embedHtml: string;
  thumbnailUrl?: string;
};

/**
 * Detects platform from URL string
 */
export function detectPlatform(url: string): Platform | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be")
    ) {
      return "youtube";
    }

    if (
      hostname.includes("twitter.com") ||
      hostname.includes("x.com")
    ) {
      return "twitter";
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches oEmbed payload for supported platforms (YouTube & Twitter/X)
 */
export async function fetchOEmbed(url: string): Promise<OEmbedResult> {
  const platform = detectPlatform(url);

  if (!platform) {
    throw new Error("Unsupported or invalid URL. Please enter a valid YouTube or Twitter/X link.");
  }

  if (platform === "youtube") {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });

      if (res.ok) {
        const data = await res.json();

        // High quality thumbnail URL (upgrade default hqdefault/mqdefault to maxresdefault)
        let highQualityThumbnail = data.thumbnail_url || null;
        if (highQualityThumbnail) {
          highQualityThumbnail = highQualityThumbnail
            .replace("hqdefault.jpg", "maxresdefault.jpg")
            .replace("mqdefault.jpg", "maxresdefault.jpg")
            .replace("sddefault.jpg", "maxresdefault.jpg");
        }

        // Clean YouTube embed HTML to remove fixed small width/height attributes
        let cleanEmbedHtml = data.html || "";
        cleanEmbedHtml = cleanEmbedHtml
          .replace(/width="\d+"/g, 'width="100%"')
          .replace(/height="\d+"/g, 'height="100%"');

        return {
          platform: "youtube",
          title: data.title || "YouTube Video",
          embedHtml: cleanEmbedHtml,
          thumbnailUrl: highQualityThumbnail,
        };
      }
    } catch (e) {
      console.warn("YouTube oEmbed fetch warning:", e);
    }

    // YouTube fallback if oEmbed endpoint is unreachable
    return {
      platform: "youtube",
      title: "YouTube Video",
      embedHtml: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${extractYouTubeId(url)}" frameborder="0" allowfullscreen></iframe>`,
      thumbnailUrl: `https://i.ytimg.com/vi/${extractYouTubeId(url)}/maxresdefault.jpg`,
    };
  }

  if (platform === "twitter") {
    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`;
      const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });

      if (res.ok) {
        const data = await res.json();

        let title = "Twitter/X Post";
        if (data.author_name) {
          title = `Post by ${data.author_name}`;
        }

        return {
          platform: "twitter",
          title: title,
          embedHtml: data.html || "",
          thumbnailUrl: undefined,
        };
      }
    } catch (e) {
      console.warn("Twitter oEmbed fetch warning, using fallback blockquote:", e);
    }

    // Twitter fallback if publish.twitter.com API fails or times out
    return {
      platform: "twitter",
      title: "Twitter/X Post",
      embedHtml: `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`,
      thumbnailUrl: undefined,
    };
  }

  throw new Error("Unsupported platform.");
}

/**
 * Utility helper to extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }
    if (parsed.pathname.includes("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1];
    }
    return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
}
