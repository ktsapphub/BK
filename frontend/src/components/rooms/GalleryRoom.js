import { useEffect, useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

const AUTOPLAY_INTERVAL_MS = 3000;

// Fullscreen image viewer with prev/next navigation — split out of GalleryRoom
// so the carousel and the lightbox each stay focused and easy to reason about.
function GalleryLightbox({ images, activeIndex, onClose, onNext, onPrev }) {
  const isOpen = activeIndex !== null;
  const current = isOpen ? images[activeIndex] : null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-testid="gallery-lightbox"
        className="bg-black/95 border-none max-w-4xl p-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onNext();
          if (e.key === "ArrowLeft") onPrev();
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-testid="gallery-lightbox-close-button"
          className="focus-ring absolute right-3 top-3 z-50 rounded-full p-2 bg-white/15 text-white hover:bg-white/25 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {current && (
          <div className="relative">
            <img src={current.url} alt={current.alt || ""} className="w-full max-h-[80vh] object-contain" />
            {current.caption && <p className="text-white/80 text-sm font-body p-4">{current.caption}</p>}
            {images.length > 1 && (
              <>
                <button onClick={onPrev} aria-label="Previous image" className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={onNext} aria-label="Next image" className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function GalleryRoom({ section }) {
  const c = section.content || {};
  const images = Array.isArray(c.images) ? c.images : [];
  const t = themeFor(section.theme);
  const reduced = useReducedMotionPref();
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [api, setApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  useEffect(() => {
    if (!api || reduced || paused || lightboxIdx !== null || images.length <= 1) return;
    const id = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [api, reduced, paused, lightboxIdx, images.length]);

  if (images.length === 0) return null;

  const showNext = () => setLightboxIdx((i) => (i + 1) % images.length);
  const showPrev = () => setLightboxIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="gallery-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow dark={t.isDark}>{c.title || "Through My Eyes"}</RoomEyebrow>
        {c.description && <p className="font-body text-base md:text-lg max-w-[62ch] mb-10 opacity-90">{c.description}</p>}

        <div
          className="relative"
          data-testid="gallery-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <Carousel setApi={setApi} opts={{ loop: images.length > 1, align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {images.map((img, i) => (
                <CarouselItem key={img.url || i} className="pl-4 basis-[78%] sm:basis-[52%] md:basis-[36%] lg:basis-[30%]">
                  <button
                    onClick={() => setLightboxIdx(i)}
                    data-testid="gallery-image-button"
                    className="focus-ring w-full aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden relative group"
                  >
                    <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    {img.caption && (
                      <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs font-body p-3 text-left">
                        {img.caption}
                      </span>
                    )}
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous image"
                data-testid="gallery-carousel-prev"
                className="focus-ring absolute left-1 md:-left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next image"
                data-testid="gallery-carousel-next"
                className="focus-ring absolute right-1 md:-right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </RoomContainer>

      <GalleryLightbox
        images={images}
        activeIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onNext={showNext}
        onPrev={showPrev}
      />
    </RoomWrapper>
  );
}
