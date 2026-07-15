import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const FIELDS = [
  ["site_title", "Site Title"], ["site_tagline", "Site Tagline"],
  ["contact_email", "Contact Email"], ["contact_phone", "Contact Phone"], ["contact_location", "Contact Location"],
  ["scheduling_url", "Scheduling URL"],
  ["resume_pdf_url", "Resume PDF URL"],
  ["social_instagram", "Instagram URL"], ["social_threads", "Threads URL"], ["social_linkedin", "LinkedIn URL"],
  ["footer_text", "Footer Text"],
  ["seo_default_title", "SEO Default Title"], ["seo_default_description", "SEO Default Description", "textarea"],
];

const CONNECT_FIELDS = [
  ["connect_dialog_heading", "Connect Dialog Heading"],
  ["connect_dialog_copy", "Connect Dialog Copy", "textarea"],
  ["contact_consent_text", "Contact Consent Checkbox Text", "textarea"],
  ["contact_consent_supporting_text", "Contact Consent Supporting Text", "textarea"],
  ["contact_consent_version", "Contact Consent Version"],
  ["marketing_consent_text", "Marketing Consent Checkbox Text", "textarea"],
  ["privacy_policy_url", "Privacy Policy URL"],
];

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminApi.getGlobalSettings().then(setSettings); }, []);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      delete payload.key;
      delete payload.updated_at;
      await adminApi.updateGlobalSettings(payload);
      toast.success("Settings saved");
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-xl font-semibold">Global Settings</h1>
      <div className="bg-white rounded-lg border p-5 space-y-4">
        {FIELDS.map(([key, label, type]) => (
          <div key={key}>
            <Label htmlFor={key}>{label}</Label>
            {type === "textarea" ? (
              <Textarea id={key} value={settings[key] || ""} onChange={(e) => update(key, e.target.value)} />
            ) : (
              <Input id={key} value={settings[key] || ""} onChange={(e) => update(key, e.target.value)} />
            )}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold pt-2">Let's Connect &amp; Privacy</h2>
      <div className="bg-white rounded-lg border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="newsletter_enabled">Newsletter opt-in enabled</Label>
            <p className="text-xs text-muted-foreground">Shows the optional marketing checkbox on the Connect form.</p>
          </div>
          <Switch
            id="newsletter_enabled"
            data-testid="admin-newsletter-enabled-toggle"
            checked={settings.newsletter_enabled !== false}
            onCheckedChange={(v) => update("newsletter_enabled", v)}
          />
        </div>
        {CONNECT_FIELDS.map(([key, label, type]) => (
          <div key={key}>
            <Label htmlFor={key}>{label}</Label>
            {type === "textarea" ? (
              <Textarea id={key} data-testid={`admin-settings-${key}`} value={settings[key] || ""} onChange={(e) => update(key, e.target.value)} />
            ) : (
              <Input id={key} data-testid={`admin-settings-${key}`} value={settings[key] || ""} onChange={(e) => update(key, e.target.value)} />
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Changing the consent text? Bump the Consent Version (e.g. contact-consent-v2) so historical submissions keep their
          original wording on record.
        </p>
      </div>

      <button onClick={handleSave} disabled={saving} data-testid="admin-settings-save-button" className="focus-ring rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
