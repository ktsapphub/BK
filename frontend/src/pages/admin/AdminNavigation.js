import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function AdminNavigation() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    adminApi
      .listSections()
      .then((data) => setSections([...data].sort((a, b) => a.display_order - b.display_order)))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const move = async (index, dir) => {
    const next = [...sections];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setSections(next);
    try {
      await adminApi.reorder("sections", next.map((s, i) => ({ id: s.id, display_order: i + 1 })));
      toast.success("Navigation order updated");
      load();
    } catch {
      toast.error("Failed to reorder");
      load();
    }
  };

  const updateLabel = (id, value) => setSections((cur) => cur.map((s) => (s.id === id ? { ...s, navigation_label: value } : s)));

  const saveLabel = async (section) => {
    try {
      await adminApi.updateSection(section.id, { navigation_label: section.navigation_label });
      toast.success("Label updated");
    } catch {
      toast.error("Failed to update label");
    }
  };

  const toggleVisible = async (section) => {
    const nextVisible = !section.is_visible;
    setSections((cur) => cur.map((s) => (s.id === section.id ? { ...s, is_visible: nextVisible } : s)));
    try {
      await adminApi.updateSection(section.id, { is_visible: nextVisible });
      toast.success(nextVisible ? "Room shown" : "Room hidden");
    } catch {
      toast.error("Failed to update visibility");
      load();
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Navigation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reorder rooms and edit their menu labels. Toggling visibility off hides a room from the site entirely (not just the nav).
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="bg-white rounded-lg border divide-y" data-testid="admin-navigation-list">
          {sections.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3" data-testid="admin-navigation-item">
              <div className="flex flex-col shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  data-testid={`admin-navigation-move-up-${s.id}`}
                  aria-label="Move up"
                  className="focus-ring p-0.5 disabled:opacity-30 hover:text-primary"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === sections.length - 1}
                  data-testid={`admin-navigation-move-down-${s.id}`}
                  aria-label="Move down"
                  className="focus-ring p-0.5 disabled:opacity-30 hover:text-primary"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">{s.section_type}</span>
              <Input
                value={s.navigation_label || ""}
                onChange={(e) => updateLabel(s.id, e.target.value)}
                onBlur={() => saveLabel(s)}
                placeholder="(hidden from nav)"
                data-testid={`admin-navigation-label-input-${s.id}`}
                className="flex-1"
              />
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">Visible</span>
                <Switch
                  checked={s.is_visible}
                  onCheckedChange={() => toggleVisible(s)}
                  data-testid={`admin-navigation-visible-toggle-${s.id}`}
                />
              </div>
            </div>
          ))}
          {sections.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">No rooms yet.</p>}
        </div>
      )}
    </div>
  );
}
