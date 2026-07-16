import { useEffect } from "react";
import { publicApi } from "@/lib/api";

// Maps Admin > Appearance theme fields (stored in global_settings) to the CSS
// custom properties defined in index.css. Only overrides variables the site
// owner has actually set — everything else keeps the shipped design defaults.
const TOKEN_MAP = {
  theme_bg_primary: "--background-primary",
  theme_bg_secondary: "--background-secondary",
  theme_bg_blue_soft: "--background-blue-soft",
  theme_surface_blue: "--surface-blue",
  theme_surface_blue_dark: "--surface-blue-dark",
  theme_accent_highlight: "--accent-highlight",
  theme_text_primary: "--text-primary",
  theme_text_secondary: "--text-secondary",
  theme_text_muted: "--text-muted",
  theme_text_on_blue: "--text-on-blue",
  theme_text_on_blue_muted: "--text-on-blue-muted",
  theme_border_primary: "--border-primary",
  theme_border_blue: "--border-blue",
  theme_font_display: "--font-display",
  theme_font_body: "--font-body",
  theme_font_editorial: "--font-editorial",
};

export default function ThemeInjector() {
  useEffect(() => {
    publicApi
      .getGlobalSettings()
      .then((settings) => {
        if (!settings) return;
        const root = document.documentElement;
        Object.entries(TOKEN_MAP).forEach(([key, cssVar]) => {
          if (settings[key]) root.style.setProperty(cssVar, settings[key]);
        });
      })
      .catch(() => {});
  }, []);

  return null;
}
