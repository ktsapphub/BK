import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, X, Linkedin } from "lucide-react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function Portrait({ testimonial, size = "h-full" }) {
  if (testimonial.portrait_url) {
    return (
      <img
        src={testimonial.portrait_url}
        alt={testimonial.portrait_alt || testimonial.name}
        className={`${size} w-full object-cover`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`${size} w-full flex items-center justify-center bg-[var(--surface-blue)]`}>
      <span className="font-display font-bold text-5xl md:text-7xl text-white">{testimonial.name?.[0] || "?"}</span>
    </div>
  );
}

export default function TestimonialsRoom({ section, testimonials }) {
  const c = section.content || {};
  const list = Array.isArray(testimonials) ? testimonials : [];
  const [idx, setIdx] = useState(0);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const active = list[idx] || {};
  const portraitLeft = idx % 2 === 0;
  const next = () => setIdx((i) => (i + 1) % list.length);
  const prev = () => setIdx((i) => (i - 1 + list.length) % list.length);

  useEffect(() => {
    if (list.length === 0) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  if (list.length === 0) return null; // graceful hide: no verified testimonials yet

  let touchStartX = null;
  const onTouchStart = (e) => (touchStartX = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta > 50) prev();
    if (delta < -50) next();
    touchStartX = null;
  };

  const portraitBlock = (
    <div className="w-full md:w-2/5 aspect-[4/5] md:aspect-auto md:h-full">
      <Portrait testimonial={active} />
    </div>
  );

  const quoteBlock = (
    <div className="flex-1 flex flex-col justify-center p-8 md:p-14 relative">
      <Quote className="h-10 w-10 md:h-14 md:w-14 text-[var(--surface-blue)] opacity-40 mb-4" aria-hidden="true" />
      <p data-testid="testimonial-quote" className="font-editorial italic text-xl md:text-3xl leading-snug max-w-xl">
        {active.full_quote}
      </p>
      <div className="mt-8">
        <p className="font-display text-sm font-semibold">{active.name}</p>
        <p className="font-body text-xs opacity-70 mt-0.5">{[active.title, active.org].filter(Boolean).join(", ")}</p>
        {active.relationship && <p className="font-body text-xs opacity-50 mt-0.5">{active.relationship}</p>}
        {active.linkedin_url && (
          <a href={active.linkedin_url} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1.5 mt-2 text-xs font-display text-[var(--surface-blue)] hover:underline">
            <Linkedin className="h-3 w-3" /> View Source
          </a>
        )}
      </div>
    </div>
  );

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="testimonials-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <RoomEyebrow dark>Testimonials</RoomEyebrow>
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em]">{c.heading || "Voices From the Work"}</h2>
          </div>
          {list.length > 1 && (
            <button onClick={() => setArchiveOpen(true)} data-testid="testimonials-view-all-button" className="focus-ring font-display text-xs uppercase tracking-wide underline opacity-80 hover:opacity-100">
              View All Testimonials
            </button>
          )}
        </div>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-10 opacity-90">{c.intro}</p>}

        <div
          data-testid="testimonials-carousel"
          className="relative rounded-[var(--radius-lg)] overflow-hidden border border-white/15 bg-black/10 min-h-[420px] md:min-h-[380px]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row md:min-h-[380px]"
            >
              {portraitLeft ? portraitBlock : null}
              {quoteBlock}
              {!portraitLeft ? portraitBlock : null}
            </motion.div>
          </AnimatePresence>

          {list.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous testimonial" className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 text-white p-2 hover:bg-black/50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={next} aria-label="Next testimonial" className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 text-white p-2 hover:bg-black/50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {list.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6" data-testid="testimonials-progress-dots">
            {list.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setIdx(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-[var(--surface-blue)]" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
              />
            ))}
          </div>
        )}

        {list.length > 2 && (
          <div className="hidden md:flex items-center justify-center gap-3 mt-6" data-testid="testimonials-thumbnails">
            {list.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setIdx(i)}
                className={`h-12 w-12 rounded-full overflow-hidden border-2 transition-all ${i === idx ? "border-[var(--surface-blue)] scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <Portrait testimonial={t} size="h-full" />
              </button>
            ))}
          </div>
        )}
      </RoomContainer>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent data-testid="testimonials-archive-dialog" className="bg-[var(--background-primary)] text-[var(--text-primary)] max-w-2xl max-h-[80vh] overflow-y-auto">
          <button onClick={() => setArchiveOpen(false)} aria-label="Close" className="focus-ring absolute right-4 top-4 rounded-full p-1.5 bg-[var(--background-secondary)] hover:bg-[var(--background-blue-soft)]">
            <X className="h-4 w-4" />
          </button>
          <h3 className="font-display font-bold text-xl mb-4">All Testimonials</h3>
          <div className="space-y-6">
            {list.map((t) => (
              <div key={t.id} className="border-b border-[var(--border-primary)] pb-5 last:border-0">
                <p className="font-editorial italic text-base md:text-lg">“{t.full_quote}”</p>
                <p className="font-display text-sm font-semibold mt-2">{t.name}</p>
                <p className="font-body text-xs opacity-60">{[t.title, t.org].filter(Boolean).join(", ")}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </RoomWrapper>
  );
}
