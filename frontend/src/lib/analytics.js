import { publicApi } from "@/lib/api";

const VISITOR_KEY = "bk_visitor_id";

// Self-hosted analytics: every visitor gets a stable anonymous id stored in
// localStorage (no cookies, no PII) so we can count unique visitors alongside
// raw pageviews. Never blocks or throws — analytics must never break the site.
export function getVisitorId() {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = window.crypto?.randomUUID ? window.crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function detectDevice() {
  if (typeof navigator === "undefined") return "unknown";
  if (/Tablet|iPad/i.test(navigator.userAgent)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) return "mobile";
  return "desktop";
}

export function trackPageview(path) {
  try {
    const params = new URLSearchParams(window.location.search);
    const payload = {
      path,
      referrer: document.referrer || null,
      visitor_id: getVisitorId(),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_content: params.get("utm_content"),
      device: detectDevice(),
    };
    publicApi.trackPageview(payload).catch(() => {});
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: path });
    }
  } catch (err) {
    // Analytics must never break the site — log for visibility but swallow.
    if (typeof console !== "undefined") {
      console.error("trackPageview failed:", err);
    }
  }
}
