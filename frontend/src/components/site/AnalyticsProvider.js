import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { trackPageview } from "@/lib/analytics";

const GA_SCRIPT_ID = "bk-ga-gtag-script";

function loadGaScript(measurementId) {
  if (!measurementId || typeof window === "undefined") return;
  if (document.getElementById(GA_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });
}

// Mounted once inside <BrowserRouter>. Tracks every route change against our
// self-hosted analytics endpoint, and (only if the site owner has configured
// a GA4 Measurement ID in Admin > Settings) also loads GA and mirrors page_view
// events there — so analytics keeps working even without any Emergent-only service.
export default function AnalyticsProvider() {
  const location = useLocation();
  const gaChecked = useRef(false);

  useEffect(() => {
    if (gaChecked.current) return;
    gaChecked.current = true;
    publicApi
      .getGlobalSettings()
      .then((settings) => {
        if (settings?.ga_measurement_id) loadGaScript(settings.ga_measurement_id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);

  return null;
}
