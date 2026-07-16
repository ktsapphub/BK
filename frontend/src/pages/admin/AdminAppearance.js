import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RotateCcw, Save } from "lucide-react";
import MediaPickerInput from "@/components/admin/MediaPickerInput";

// Default tokens mirror index.css :root — used for the "Royal Blue Classic"
// preset and as the values shown when no theme_* override is saved yet.
const DEFAULT_COLORS = {
  theme_bg_primary: "#FFFFFF",
  theme_bg_secondary: "#F7F9FC",
  theme_bg_blue_soft: "#EEF5FC",
  theme_surface_blue: "#0057B8",
  theme_surface_blue_dark: "#003B7A",
  theme_accent_highlight: "#1677D2",
  theme_text_primary: "#111827",
  theme_text_secondary: "#374151",
  theme_text_muted: "#6B7280",
  theme_text_on_blue: "#FFFFFF",
  theme_border_primary: "#E5E7EB",
  theme_border_blue: "#0057B8",
};

const PRESETS = [
  { name: "Royal Blue Classic", swatch: "#0057B8", colors: DEFAULT_COLORS },
  {
    name: "Midnight Navy",
    swatch: "#10366B",
    colors: {
      theme_bg_primary: "#FFFFFF",
      theme_bg_secondary: "#F4F6F9",
      theme_bg_blue_soft: "#E8EEF7",
      theme_surface_blue: "#10366B",
      theme_surface_blue_dark: "#081C3A",
      theme_accent_highlight: "#2C5C9E",
      theme_text_primary: "#0F172A",
      theme_text_secondary: "#334155",
      theme_text_muted: "#64748B",
      theme_text_on_blue: "#FFFFFF",
      theme_border_primary: "#E2E6ED",
      theme_border_blue: "#10366B",
    },
  },
  {
    name: "Slate Charcoal",
    swatch: "#2B333D",
    colors: {
      theme_bg_primary: "#FFFFFF",
      theme_bg_secondary: "#F5F5F4",
      theme_bg_blue_soft: "#ECEEF1",
      theme_surface_blue: "#2B333D",
      theme_surface_blue_dark: "#1A1F26",
      theme_accent_highlight: "#3E7CB1",
      theme_text_primary: "#1C1C1C",
      theme_text_secondary: "#3F3F3F",
      theme_text_muted: "#6B6B6B",
      theme_text_on_blue: "#FFFFFF",
      theme_border_primary: "#E4E4E4",
      theme_border_blue: "#2B333D",
    },
  },
  {
    name: "Ocean Teal",
    swatch: "#0F7A73",
    colors: {
      theme_bg_primary: "#FFFFFF",
      theme_bg_secondary: "#F4FAFA",
      theme_bg_blue_soft: "#E3F4F3",
      theme_surface_blue: "#0F7A73",
      theme_surface_blue_dark: "#0B4F4B",
      theme_accent_highlight: "#14958C",
      theme_text_primary: "#12211F",
      theme_text_secondary: "#33463F",
      theme_text_muted: "#647B75",
      theme_text_on_blue: "#FFFFFF",
      theme_border_primary: "#E3E8E7",
      theme_border_blue: "#0F7A73",
    },
  },
];

const FONT_OPTIONS_DISPLAY = [
  { label: "Urbanist (Default)", value: "'Urbanist', ui-sans-serif, system-ui, sans-serif" },
  { label: "Montserrat", value: "'Montserrat', ui-sans-serif, system-ui, sans-serif" },
  { label: "Figtree", value: "'Figtree', ui-sans-serif, system-ui, sans-serif" },
  { label: "Fredoka", value: "'Fredoka', ui-sans-serif, system-ui, sans-serif" },
];

const FONT_OPTIONS_BODY = [
  { label: "Lexend (Default)", value: "'Lexend', ui-sans-serif, system-ui, sans-serif" },
  { label: "Figtree", value: "'Figtree', ui-sans-serif, system-ui, sans-serif" },
  { label: "Source Code Pro", value: "'Source Code Pro', ui-monospace, monospace" },
  { label: "Roboto Mono", value: "'Roboto Mono', ui-monospace, monospace" },
];

const FONT_OPTIONS_EDITORIAL = [
  { label: "Fraunces (Default)", value: "'Fraunces', ui-serif, Georgia, serif" },
  { label: "Playfair Display", value: "'Playfair Display', ui-serif, Georgia, serif" },
  { label: "Crimson Text", value: "'Crimson Text', ui-serif, Georgia, serif" },
];

const COLOR_FIELDS = [
  { group: "Backgrounds", fields: [
    ["theme_bg_primary", "Primary Background"],
    ["theme_bg_secondary", "Secondary Background"],
    ["theme_bg_blue_soft", "Soft Accent Background"],
  ]},
  { group: "Brand / Buttons / Links", fields: [
    ["theme_surface_blue", "Brand Color (buttons, links, active states)"],
    ["theme_surface_blue_dark", "Brand Color — Dark Room Background"],
    ["theme_accent_highlight", "Accent Highlight (hover states)"],
  ]},
  { group: "Text", fields: [
    ["theme_text_primary", "Primary Text"],
    ["theme_text_secondary", "Secondary Text"],
    ["theme_text_muted", "Muted Text"],
    ["theme_text_on_blue", "Text on Dark/Brand Backgrounds"],
  ]},
  { group: "Borders", fields: [
    ["theme_border_primary", "Primary Border"],
    ["theme_border_blue", "Brand-Tinted Border"],
  ]},
];

function ColorField({ colorKey, label, value, onChange }) {
  const hex = /^#[0-9A-Fa-f]{6}$/.test(value || "") ? value : "#000000";
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(colorKey, e.target.value)}
        data-testid={`admin-appearance-color-${colorKey}`}
        className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-input p-0.5"
        aria-label={label}
      />
      <div className="flex-1">
        <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(colorKey, e.target.value)}
          data-testid={`admin-appearance-color-text-${colorKey}`}
          className="w-full rounded-md border border-input px-2.5 py-1.5 text-sm font-mono"
        />
      </div>
    </div>
  );
}

export default function AdminAppearance() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getGlobalSettings().then(setSettings);
  }, []);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const applyPreset = (preset) => {
    setSettings((s) => ({ ...s, ...preset.colors }));
    toast.info(`"${preset.name}" preset applied — click Save to publish it`);
  };

  const resetToDefault = () => {
    setSettings((s) => {
      const cleared = { ...s };
      Object.keys(DEFAULT_COLORS).forEach((k) => { cleared[k] = null; });
      cleared.theme_font_display = null;
      cleared.theme_font_body = null;
      cleared.theme_font_editorial = null;
      return cleared;
    });
    toast.info("Reset to default — click Save to publish");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      delete payload.key;
      delete payload.updated_at;
      await adminApi.updateGlobalSettings(payload);
      toast.success("Appearance saved — changes will appear on the live site");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  const val = (key) => settings[key] ?? DEFAULT_COLORS[key] ?? "";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Appearance</h1>
          <p className="text-sm text-muted-foreground mt-1">Brand colors, fonts, and header logo — applied site-wide.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetToDefault}
            data-testid="admin-appearance-reset-button"
            className="focus-ring inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            data-testid="admin-appearance-save-button"
            className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Appearance"}
          </button>
        </div>
      </div>

      {/* Header / branding */}
      <div className="bg-white rounded-lg border p-5 space-y-4">
        <h2 className="text-sm font-semibold">Header &amp; Branding</h2>
        <div>
          <Label>Site Logo</Label>
          <p className="text-xs text-muted-foreground mb-2">Shown top-left on the public site. Leave blank to show the site title as text instead.</p>
          <MediaPickerInput label="site-logo" value={settings.site_logo_url} onChange={(v) => update("site_logo_url", v)} />
        </div>
      </div>

      {/* Presets */}
      <div className="bg-white rounded-lg border p-5 space-y-4">
        <h2 className="text-sm font-semibold">Theme Presets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              data-testid={`admin-appearance-preset-${preset.name.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="focus-ring rounded-md border p-3 text-left hover:border-primary transition-colors"
            >
              <span className="block h-8 w-full rounded-sm mb-2" style={{ backgroundColor: preset.swatch }} />
              <span className="text-xs font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-lg border p-5 space-y-5">
        <h2 className="text-sm font-semibold">Brand Colors</h2>
        {COLOR_FIELDS.map((group) => (
          <div key={group.group} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.group}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {group.fields.map(([key, label]) => (
                <ColorField key={key} colorKey={key} label={label} value={val(key)} onChange={update} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fonts */}
      <div className="bg-white rounded-lg border p-5 space-y-4">
        <h2 className="text-sm font-semibold">Fonts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="font-display">Headings</Label>
            <select
              id="font-display"
              data-testid="admin-appearance-font-display"
              value={settings.theme_font_display || FONT_OPTIONS_DISPLAY[0].value}
              onChange={(e) => update("theme_font_display", e.target.value)}
              className="mt-1 w-full rounded-md border border-input px-2.5 py-2 text-sm"
            >
              {FONT_OPTIONS_DISPLAY.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="font-body">Body Text</Label>
            <select
              id="font-body"
              data-testid="admin-appearance-font-body"
              value={settings.theme_font_body || FONT_OPTIONS_BODY[0].value}
              onChange={(e) => update("theme_font_body", e.target.value)}
              className="mt-1 w-full rounded-md border border-input px-2.5 py-2 text-sm"
            >
              {FONT_OPTIONS_BODY.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="font-editorial">Editorial / Quotes</Label>
            <select
              id="font-editorial"
              data-testid="admin-appearance-font-editorial"
              value={settings.theme_font_editorial || FONT_OPTIONS_EDITORIAL[0].value}
              onChange={(e) => update("theme_font_editorial", e.target.value)}
              className="mt-1 w-full rounded-md border border-input px-2.5 py-2 text-sm"
            >
              {FONT_OPTIONS_EDITORIAL.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-lg border p-6" style={{ backgroundColor: val("theme_bg_secondary") }} data-testid="admin-appearance-preview">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: val("theme_text_muted"), fontFamily: settings.theme_font_display || FONT_OPTIONS_DISPLAY[0].value }}>
          Live Preview
        </p>
        <h3 className="text-2xl font-bold mb-2" style={{ color: val("theme_text_primary"), fontFamily: settings.theme_font_display || FONT_OPTIONS_DISPLAY[0].value }}>
          Twenty Years in Motion
        </h3>
        <p className="mb-4" style={{ color: val("theme_text_secondary"), fontFamily: settings.theme_font_body || FONT_OPTIONS_BODY[0].value }}>
          This is how body text will look across the site with your selected palette and font.
        </p>
        <p className="italic mb-4 text-lg" style={{ color: val("theme_text_primary"), fontFamily: settings.theme_font_editorial || FONT_OPTIONS_EDITORIAL[0].value }}>
          "Editorial quotes use this styling."
        </p>
        <button
          type="button"
          className="rounded-md px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: val("theme_surface_blue"), color: val("theme_text_on_blue"), fontFamily: settings.theme_font_display || FONT_OPTIONS_DISPLAY[0].value }}
        >
          Sample Button
        </button>
      </div>
    </div>
  );
}
