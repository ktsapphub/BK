import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, History, RotateCcw } from "lucide-react";
import DynamicForm from "@/components/admin/DynamicForm";
import { getContentSchema, SECTION_TYPES, THEMES, TRANSITIONS } from "@/lib/contentSchemas";

export default function AdminSectionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [versions, setVersions] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await adminApi.getSection(id);
    setSection(data);
    const v = await adminApi.getSectionVersions(id);
    setVersions(v);
  };

  useEffect(() => { load(); }, [id]);

  if (!section) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const updateField = (name, value) => setSection((s) => ({ ...s, [name]: value }));

  const handleSave = async (publish) => {
    setSaving(true);
    try {
      const payload = {
        section_type: section.section_type,
        internal_name: section.internal_name,
        navigation_label: section.navigation_label,
        theme: section.theme,
        transition_style: section.transition_style,
        is_visible: section.is_visible,
        content: section.content,
        status: publish ? "published" : section.status,
      };
      const updated = await adminApi.updateSection(id, payload);
      setSection(updated);
      toast.success(publish ? "Published" : "Saved as draft");
      load();
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (versionId) => {
    await adminApi.rollbackSection(id, versionId);
    toast.success("Rolled back to selected version");
    load();
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <Link to="/admin/sections" className="focus-ring inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Rooms
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{section.internal_name}</h1>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} disabled={saving} className="focus-ring rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60">
            Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} data-testid="admin-publish-button" className="focus-ring rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
            {section.status === "published" ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history" data-testid="admin-version-history-open"><History className="h-3.5 w-3.5 mr-1.5" />History</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-5 bg-white rounded-lg border p-5">
          <DynamicForm schema={getContentSchema(section.section_type)} value={section.content} onChange={(v) => updateField("content", v)} />
        </TabsContent>

        <TabsContent value="settings" className="mt-5 bg-white rounded-lg border p-5 space-y-4">
          <div>
            <Label>Internal Name</Label>
            <Input value={section.internal_name || ""} onChange={(e) => updateField("internal_name", e.target.value)} />
          </div>
          <div>
            <Label>Navigation Label (leave blank to hide from nav)</Label>
            <Input value={section.navigation_label || ""} onChange={(e) => updateField("navigation_label", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Section Type</Label>
              <Select value={section.section_type} onValueChange={(v) => updateField("section_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SECTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Theme</Label>
              <Select value={section.theme} onValueChange={(v) => updateField("theme", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{THEMES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transition</Label>
              <Select value={section.transition_style} onValueChange={(v) => updateField("transition_style", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TRANSITIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
            <Label className="mb-0">Visible on site</Label>
            <Switch checked={section.is_visible} onCheckedChange={(v) => updateField("is_visible", v)} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-5 bg-white rounded-lg border p-5">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published versions yet.</p>
          ) : (
            <ul className="divide-y">
              {versions.map((v) => (
                <li key={v.id} className="py-3 flex items-center justify-between">
                  <span className="text-sm">{new Date(v.created_at).toLocaleString()}</span>
                  <button onClick={() => handleRollback(v.id)} className="focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                    <RotateCcw className="h-3.5 w-3.5" /> Rollback
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
