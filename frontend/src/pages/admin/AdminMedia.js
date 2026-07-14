import { useEffect, useRef, useState } from "react";
import { adminApi, API } from "@/lib/api";
import { toast } from "sonner";
import { UploadCloud, Trash2, Copy, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

function toAbsolute(url) {
  if (!url || url.startsWith("http")) return url;
  return `${API.replace(/\/api$/, "")}${url}`;
}

export default function AdminMedia() {
  const [items, setItems] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileRef = useRef(null);

  const load = () => adminApi.listMedia().then(setItems);
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await adminApi.uploadMedia(file);
      toast.success("Uploaded");
      load();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    await adminApi.deleteMedia(deletingId);
    setDeletingId(null);
    load();
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(toAbsolute(url));
    toast.success("URL copied");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Media Library</h1>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="admin-media-upload-button" className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {items?.map((m) => (
          <div key={m.id} className="rounded-md border bg-white overflow-hidden group relative">
            {m.content_type?.startsWith("video") ? (
              <video src={toAbsolute(m.url)} className="w-full aspect-square object-cover" muted />
            ) : (
              <img src={toAbsolute(m.url)} alt={m.original_filename} className="w-full aspect-square object-cover" loading="lazy" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => copyUrl(m.url)} className="focus-ring rounded-full bg-white p-2"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeletingId(m.id)} data-testid="admin-media-delete-button" className="focus-ring rounded-full bg-white p-2 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        {items?.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No media uploaded yet.</p>}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this media item?</AlertDialogTitle>
            <AlertDialogDescription>Sections referencing this file will show a broken image. This cannot be undone.</AlertDialogDescription>
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
