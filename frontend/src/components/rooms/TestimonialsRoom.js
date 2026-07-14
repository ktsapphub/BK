import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";

export default function TestimonialsRoom({ section, testimonials }) {
  const c = section.content || {};
  const list = Array.isArray(testimonials) ? testimonials : [];
  const [idx, setIdx] = useState(0);

  if (list.length === 0) return null; // graceful hide: no verified testimonials yet

  const active = list[idx];
  const next = () => setIdx((i) => (i + 1) % list.length);
  const prev = () => setIdx((i) => (i - 1 + list.length) % list.length);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="testimonials-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer className="max-w-3xl text-center">
        <RoomEyebrow>{c.heading || "Voices"}</RoomEyebrow>
        <div data-testid="testimonials-carousel" className="relative min-h-[220px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.5 }}
            >
              <p data-testid="testimonial-quote" className="font-editorial italic text-2xl md:text-3xl leading-snug">
                “{active.full_quote}”
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                {active.portrait_url ? (
                  <img src={active.portrait_url} alt={active.portrait_alt || active.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="h-12 w-12 rounded-full bg-[var(--background-blue-soft)] text-[var(--surface-blue)] flex items-center justify-center font-display font-bold">
                    {active.name?.[0] || "?"}
                  </span>
                )}
                <div className="text-left">
                  <p className="font-display text-sm font-semibold flex items-center gap-1.5">
                    {active.name}
                    <BadgeCheck className="h-4 w-4 text-[var(--surface-blue)]" aria-label="Verified" />
                  </p>
                  <p className="font-body text-xs opacity-70">{[active.title, active.org].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {list.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={prev} aria-label="Previous testimonial" className="focus-ring rounded-full border border-[var(--border-blue)] p-2 hover:bg-[var(--background-blue-soft)]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} aria-label="Next testimonial" className="focus-ring rounded-full border border-[var(--border-blue)] p-2 hover:bg-[var(--background-blue-soft)]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
