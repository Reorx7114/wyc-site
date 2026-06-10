const youtubeIdPattern = /^[A-Za-z0-9_-]{6,20}$/;

export function getYouTubeVideoId(input: string) {
  const value = input.trim();
  if (!value) return null;
  if (youtubeIdPattern.test(value)) return value;

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && youtubeIdPattern.test(id) ? id : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtube-nocookie.com") {
      const pathParts = url.pathname.split("/").filter(Boolean);
      const id = url.searchParams.get("v")
        ?? (["embed", "shorts", "live"].includes(pathParts[0]) ? pathParts[1] : null);
      return id && youtubeIdPattern.test(id) ? id : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeDisplayData(input: string) {
  const id = getYouTubeVideoId(input);
  if (!id) return null;

  return {
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  };
}
