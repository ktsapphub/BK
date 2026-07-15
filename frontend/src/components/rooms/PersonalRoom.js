import { useEffect, useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { themeFor } from "@/lib/theme";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

const AUTOPLAY_INTERVAL_MS = 3000;

// "Beyond the Work" — combines the former Personal statement room with the
// former "Through My Eyes" gallery: header/sub-header/paragraph + a single
// portrait image on the right, and an auto-moving image carousel in place
// of the old Faith/Family/Community theme pills.
export default function PersonalRoom({ section }) {
  const c = section.content || {};
  const t = themeFor(section.theme);
  const images = Array.isArray(c.gallery_images) ? c.gallery_images : [];
  const reduced = useReducedMotionPref();
  const [api, setApi] = useState(null);
  const [paused, setPaused] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    if (!api || reduced || paused || lightboxIdx !== null || images.length <= 1) return;
    const id = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [api, reduced, paused, lightboxIdx, images.length]);

  if (!c.statement && !c.heading) return null;

  const showNext = () => setLightboxIdx((i) => (i + 1) % images.length);
  const showPrev = () => setLightboxIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="personal-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          {c.eyebrow && <RoomEyebrow dark={t.isDark}>{c.eyebrow}</RoomEyebrow>}
          {c.heading && (
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-6" data-testid="personal-heading">
              {c.heading}
            </h2>
          )}
          {c.statement && (
            <p className="font-editorial text-xl md:text-2xl leading-relaxed" data-testid="personal-statement">
              {c.statement}
            </p>
          )}

          {images.length > 0 && (
            <div
              className="relative mt-9"
              data-testid="personal-gallery-carousel"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              <Carousel setApi={setApi} opts={{ loop: images.length > 1, align: "start" }} className="w-full">
                <CarouselContent className="-ml-3">
                  {images.map((img, i) => (
                    <CarouselItem key={i} className="pl-3 basis-[62%] sm:basis-[46%]">
                      <button
                        type="button"
                        onClick={() => setLightboxIdx(i)}
                        data-testid="personal-gallery-image-button"
                        className="focus-ring w-full aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden relative group"
                      >
                        <img
                          src={img.url}
                          alt={img.alt || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {img.caption && (
                          <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[11px] font-body p-2.5 text-left">
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
                    data-testid="personal-gallery-prev-button"
                    className="focus-ring absolute left-1 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => api?.scrollNext()}
                    aria-label="Next image"
                    data-testid="personal-gallery-next-button"
                    className="focus-ring absolute right-1 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {c.image && (
          <div className="aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden">
            <img src={c.image} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
      </RoomContainer>

      {images.length > 0 && (
        <Dialog open={lightboxIdx !== null} onOpenChange={(v) => !v && setLightboxIdx(null)}>
          <DialogContent
            data-testid="personal-gallery-lightbox"
            className="bg-black/95 border-none max-w-4xl p-0"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") showNext();
              if (e.key === "ArrowLeft") showPrev();
            }}
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              aria-label="Close"
              data-testid="personal-gallery-lightbox-close-button"
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
      )}
    </RoomWrapper>
  );
}
