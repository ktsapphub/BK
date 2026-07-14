import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FIELDS = [
  ["site_title", "Site Title"], ["site_tagline", "Site Tagline"],
  ["contact_email", "Contact Email"], ["contact_phone", "Contact Phone"], ["contact_location", "Contact Location"],
  ["scheduling_url", "Scheduling URL"],
  ["social_instagram", "Instagram URL"], ["social_threads", "Threads URL"], ["social_linkedin", "LinkedIn URL"],
  ["footer_text", "Footer Text"],
  ["seo_default_title", "SEO Default Title"], ["seo_default_description", "SEO Default Description", "textarea"],
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
        <button onClick={handleSave} disabled={saving} className="focus-ring rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60">
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
