// Resolves a raw video_url (YouTube / Vimeo / direct file) into a renderable
// embed descriptor: { type: "iframe" | "video", src } or null if unrecognized/empty.
export function resolveVideoEmbed(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (youtubeMatch) {
    return { type: "iframe", src: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
    return { type: "video", src: trimmed };
  }

  // Unknown host: still try an iframe embed (best-effort for other providers)
  return { type: "iframe", src: trimmed };
}
