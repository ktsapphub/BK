import { useRef, useState } from "react";
import { adminApi, API } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2 } from "lucide-react";

function toAbsolute(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  const base = API.replace(/\/api$/, "");
  return `${base}${url}`;
}

export default function MediaPickerInput({ value, onChange, label }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const media = await adminApi.uploadMedia(file);
      onChange(toAbsolute(media.url));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Image / video URL"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`media-url-input-${label || "field"}`}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          data-testid="admin-media-upload-button"
          className="focus-ring shrink-0 inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-accent disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <img src={value} alt="preview" className="h-20 rounded-md border border-input object-cover" onError={(e) => (e.target.style.display = "none")} />
      )}
    </div>
  );
}
