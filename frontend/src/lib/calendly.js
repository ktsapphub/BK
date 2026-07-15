// Calendly advanced embed helper.
// Loads Calendly's widget script/stylesheet once, then opens a popup
// scheduler with dynamic UTM parameters so every booked event can be
// traced back to the exact CTA that triggered it (Calendly UTM tracking:
// https://calendly.com/help/how-to-source-track-your-calendly-embed-with-utm-parameters).

const SCRIPT_ID = "calendly-widget-script";
const STYLE_ID = "calendly-widget-style";

export const DEFAULT_CALENDLY_URL = "https://calendly.com/bretton-j-key";

let loadPromise = null;

export function loadCalendlyScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve(window.Calendly);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    if (!document.getElementById(STYLE_ID)) {
      const link = document.createElement("link");
      link.id = STYLE_ID;
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      if (window.Calendly) {
        resolve(window.Calendly);
      } else {
        existing.addEventListener("load", () => resolve(window.Calendly));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => resolve(window.Calendly);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });

  return loadPromise;
}

function buildCalendlyUrl(baseUrl, utm) {
  const base = baseUrl || DEFAULT_CALENDLY_URL;
  try {
    const url = new URL(base);
    if (utm) {
      Object.entries(utm).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, String(value).slice(0, 254));
      });
    }
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Opens the Calendly popup scheduler.
 * @param {Object} opts
 * @param {string} [opts.baseUrl] - Scheduling link (falls back to DEFAULT_CALENDLY_URL / Admin CMS scheduling_url).
 * @param {Object} [opts.utm] - { utm_source, utm_medium, utm_campaign, utm_content, utm_term }
 * @param {Object} [opts.prefill] - { name, email, customAnswers }
 */
export async function openCalendlyPopup({ baseUrl, utm, prefill } = {}) {
  const url = buildCalendlyUrl(baseUrl, utm);
  const calendly = await loadCalendlyScript();

  if (calendly && typeof calendly.initPopupWidget === "function") {
    const config = { url };
    if (prefill) config.prefill = prefill;
    calendly.initPopupWidget(config);
    return;
  }

  // Graceful fallback if the widget script failed to load (e.g. offline/blocked).
  window.open(url, "_blank", "noopener,noreferrer");
}
