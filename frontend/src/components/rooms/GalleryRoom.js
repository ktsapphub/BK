import { useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function GalleryRoom({ section }) {
  const c = section.content || {};
  const images = Array.isArray(c.images) ? c.images : [];
  const t = themeFor(section.theme);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (images.length === 0) return null;

  const showNext = () => setLightboxIdx((i) => (i + 1) % images.length);
  const showPrev = () => setLightboxIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="gallery-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow dark={t.isDark}>{c.title || "Gallery"}</RoomEyebrow>
        {c.description && <p className="font-body text-base md:text-lg max-w-[62ch] mb-10 opacity-90">{c.description}</p>}
        <div data-testid="gallery-strip" className="flex gap-4 overflow-x-auto custom-scrollbar pb-3 -mx-1 px-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxIdx(i)}
              className="focus-ring shrink-0 w-64 md:w-80 aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden relative group"
            >
              <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              {img.caption && (
                <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs font-body p-3 text-left">
                  {img.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      </RoomContainer>

      <Dialog open={lightboxIdx !== null} onOpenChange={(v) => !v && setLightboxIdx(null)}>
        <DialogContent data-testid="gallery-lightbox" className="bg-black/95 border-none max-w-4xl p-0" onKeyDown={(e) => { if (e.key === "ArrowRight") showNext(); if (e.key === "ArrowLeft") showPrev(); }}>
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            aria-label="Close"
            data-testid="gallery-lightbox-close-button"
            className="focus-ring absolute right-3 top-3 z-50 rounded-full p-2 bg-white/15 text-white hover:bg-white/25 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {lightboxIdx !== null && (
            <div className="relative">
              <img src={images[lightboxIdx].url} alt={images[lightboxIdx].alt || ""} className="w-full max-h-[80vh] object-contain" />
              {images[lightboxIdx].caption && <p className="text-white/80 text-sm font-body p-4">{images[lightboxIdx].caption}</p>}
              {images.length > 1 && (
                <>
                  <button onClick={showPrev} aria-label="Previous image" className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={showNext} aria-label="Next image" className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </RoomWrapper>
  );
}
