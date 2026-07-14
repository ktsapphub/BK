import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import DynamicForm from "./DynamicForm";

export default function AdminCrudList({ title, description, schema, apiMethods, columns, reorderKey, emptyLabel = "item" }) {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // object being edited, or {} for new
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await apiMethods.list();
      setItems(data);
    } catch (e) {
      toast.error(`Failed to load ${title}`);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => setEditing({});
  const openEdit = (item) => setEditing(item);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...editing };
      delete payload.id;
      delete payload.created_at;
      if (editing.id) {
        await apiMethods.update(editing.id, payload);
        toast.success(`Updated ${title}`);
      } else {
        await apiMethods.create(payload);
        toast.success(`Created ${title}`);
      }
      setEditing(null);
      load();
    } catch (e) {
      toast.error("Save failed. Please check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiMethods.remove(deletingId);
      toast.success(`Deleted ${emptyLabel}`);
      setDeletingId(null);
      load();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const move = async (index, dir) => {
    if (!items) return;
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    try {
      await apiMethods.reorder(next.map((it, i) => ({ id: it.id, display_order: i })));
    } catch (e) {
      toast.error("Reorder failed");
      load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <button onClick={openNew} data-testid="admin-add-new-button" className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>

      <div className="rounded-md border">
        <Table data-testid="admin-crud-table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              {columns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items === null && (
              <TableRow><TableCell colSpan={columns.length + 2} className="text-center py-8"><Loader2 className="h-4 w-4 animate-spin inline" /></TableCell></TableRow>
            )}
            {items?.length === 0 && (
              <TableRow><TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">No {emptyLabel}s yet.</TableCell></TableRow>
            )}
            {items?.map((item, i) => (
              <TableRow key={item.id} data-testid="admin-crud-row">
                <TableCell>
                  <div className="flex gap-1">
                    <button onClick={() => move(i, -1)} className="focus-ring rounded p-0.5 hover:bg-accent"><ChevronUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => move(i, 1)} className="focus-ring rounded p-0.5 hover:bg-accent"><ChevronDown className="h-3.5 w-3.5" /></button>
                  </div>
                </TableCell>
                {columns.map((c) => (
                  <TableCell key={c.key}>{c.render ? c.render(item) : String(item[c.key] ?? "")}</TableCell>
                ))}
                <TableCell className="text-right">
                  <button onClick={() => openEdit(item)} data-testid="admin-edit-button" className="focus-ring rounded p-1.5 hover:bg-accent mr-1"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setDeletingId(item.id)} data-testid="admin-delete-button" className="focus-ring rounded p-1.5 hover:bg-accent text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? `Edit ${title}` : `New ${title}`}</DialogTitle>
          </DialogHeader>
          {editing && (
            <DynamicForm schema={schema} value={editing} onChange={setEditing} />
          )}
          <DialogFooter>
            <button onClick={() => setEditing(null)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} data-testid="admin-save-button" className="focus-ring rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {emptyLabel}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="admin-confirm-delete-button">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
