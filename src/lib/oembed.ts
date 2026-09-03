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
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error("Could not fetch YouTube video information. Please check the URL.");
    }

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

  if (platform === "twitter") {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`;
    const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error("Could not fetch Twitter/X post information. Please check the URL.");
    }

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

  throw new Error("Unsupported platform.");
}
