import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SECTION_TYPES } from "@/lib/contentSchemas";

const STATUS_COLORS = { draft: "bg-gray-100 text-gray-700", published: "bg-green-100 text-green-700", archived: "bg-red-100 text-red-700" };

export default function AdminSections() {
  const navigate = useNavigate();
  const [sections, setSections] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pageId, setPageId] = useState(null);

  const load = async () => {
    const pages = await adminApi.listPages();
    const home = pages.find((p) => p.slug === "home") || pages[0];
    setPageId(home?.id);
    const data = await adminApi.listSections(home?.id);
    setSections(data);
  };

  useEffect(() => { load(); }, []);

  const createSection = async () => {
    const created = await adminApi.createSection({
      page_id: pageId,
      section_type: "custom",
      internal_name: "New Section",
      navigation_label: "",
      display_order: (sections?.length || 0) + 1,
      status: "draft",
      theme: "true_white",
      transition_style: "fade",
      content: {},
    });
    navigate(`/admin/sections/${created.id}`);
  };

  const toggleVisible = async (s) => {
    await adminApi.updateSection(s.id, { is_visible: !s.is_visible });
    load();
  };

  const togglePublish = async (s) => {
    await adminApi.updateSection(s.id, { status: s.status === "published" ? "draft" : "published" });
    toast.success(s.status === "published" ? "Unpublished" : "Published");
    load();
  };

  const move = async (index, dir) => {
    const j = index + dir;
    if (!sections || j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[index], next[j]] = [next[j], next[index]];
    setSections(next);
    await adminApi.reorder("sections", next.map((s, i) => ({ id: s.id, display_order: i })));
  };

  const handleDelete = async () => {
    await adminApi.deleteSection(deletingId);
    setDeletingId(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rooms / Sections</h1>
        <button onClick={createSection} data-testid="admin-create-section-button" className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> New Section
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Reorder rooms with the arrows. Only <strong>published + visible</strong> rooms with valid content appear on the public site, in this order.</p>

      <div className="rounded-md border bg-white">
        <Table data-testid="admin-section-reorder-list">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections?.map((s, i) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex gap-1">
                    <button onClick={() => move(i, -1)} className="focus-ring rounded p-0.5 hover:bg-accent"><ChevronUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => move(i, 1)} className="focus-ring rounded p-0.5 hover:bg-accent"><ChevronDown className="h-3.5 w-3.5" /></button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{s.internal_name}</TableCell>
                <TableCell><Badge variant="outline">{s.section_type}</Badge></TableCell>
                <TableCell className="text-xs">{s.theme}</TableCell>
                <TableCell>
                  <button onClick={() => togglePublish(s)} data-testid="admin-section-publish-toggle" className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>
                    {s.status}
                  </button>
                </TableCell>
                <TableCell><Switch checked={s.is_visible} onCheckedChange={() => toggleVisible(s)} /></TableCell>
                <TableCell className="text-right">
                  <button onClick={() => navigate(`/admin/sections/${s.id}`)} className="focus-ring rounded p-1.5 hover:bg-accent mr-1"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setDeletingId(s.id)} className="focus-ring rounded p-1.5 hover:bg-accent text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this section?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
