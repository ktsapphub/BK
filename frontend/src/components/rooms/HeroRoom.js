import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { RoomWrapper, RoomContainer } from "./RoomWrapper";
import { scrollToElement } from "@/lib/lenisSingleton";

export default function HeroRoom({ section, onSkipIntro }) {
  const c = section.content || {};
  const words = Array.isArray(c.rotating_words) && c.rotating_words.length ? c.rotating_words : null;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!words) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words]);

  const alignment = c.alignment === "center" ? "items-center text-center" : c.alignment === "right" ? "items-end text-right" : "items-start text-left";

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="hero-room" sectionType={section.section_type} className="min-h-[92svh] flex flex-col">
      {/* Letterbox bars for cinematic frame */}
      <div className="absolute top-0 left-0 right-0 h-3 md:h-4 bg-[var(--surface-blue-dark)] z-20" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-3 md:h-4 bg-[var(--surface-blue-dark)] z-20" aria-hidden="true" />

      {c.bg_image_url ? (
        <div className="absolute inset-0">
          <img src={c.bg_image_url} alt="" className="w-full h-full object-cover opacity-[0.28]" loading="eager" />
          <div className="absolute inset-0 bg-[var(--surface-blue-dark)] mix-blend-multiply opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-blue-dark)] via-transparent to-transparent" />
        </div>
      ) : null}

      <RoomContainer className={`relative z-10 flex-1 flex flex-col justify-center py-28 md:py-32`}>
        <div className={`flex flex-col ${alignment} max-w-3xl`}>
          {c.eyebrow && (
            <p className="font-display text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--text-on-blue-muted)] mb-5">
              {c.eyebrow}
            </p>
          )}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-7xl tracking-[-0.02em] text-[var(--text-on-blue)] leading-[1.05]" data-testid="hero-heading">
            {c.heading || "Untitled"}
          </h1>
          {words && (
            <div className="h-12 md:h-14 mt-3 overflow-hidden" data-testid="hero-rotating-words">
              <AnimatePresence mode="wait">
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45 }}
                  className="font-editorial italic text-2xl md:text-4xl text-[var(--accent-highlight)]"
                >
                  {words[idx]}
                </motion.p>
              </AnimatePresence>
            </div>
          )}
          {c.subheading && (
            <p className="font-body text-base md:text-lg text-[var(--text-on-blue-muted)] mt-6 max-w-xl leading-relaxed">
              {c.subheading}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-9">
            {c.primary_cta?.label && (
              <a
                href={`#${c.primary_cta.href || ""}`}
                onClick={(e) => {
                  if (!c.primary_cta.href?.startsWith("http")) {
                    e.preventDefault();
                    scrollToElement(c.primary_cta.href);
                  }
                }}
                data-testid="hero-primary-cta-button"
                className="focus-ring inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--surface-blue)] px-6 py-3 font-display text-sm font-semibold text-white hover:bg-[var(--accent-highlight)] transition-colors"
              >
                {c.primary_cta.label}
              </a>
            )}
            {c.secondary_cta?.label && (
              <a
                href={c.secondary_cta.href || "#"}
                target={c.secondary_cta.href?.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                data-testid="hero-secondary-cta-button"
                className="focus-ring inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border-blue)] px-6 py-3 font-display text-sm font-semibold text-[var(--text-on-blue)] hover:bg-white/10 transition-colors"
              >
                {c.secondary_cta.label}
              </a>
            )}
          </div>
          {c.availability_badge && (
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-display uppercase tracking-[0.14em] text-[var(--text-on-blue-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-highlight)]" />
              {c.availability_badge}
            </span>
          )}
        </div>
      </RoomContainer>

      <div className="relative z-10 pb-10 flex items-center justify-between px-5 sm:px-8 max-w-6xl mx-auto w-full">
        <button
          type="button"
          onClick={onSkipIntro}
          data-testid="hero-skip-intro-button"
          className="focus-ring font-display text-xs uppercase tracking-[0.14em] text-[var(--text-on-blue-muted)] hover:text-[var(--text-on-blue)] transition-colors"
        >
          Skip Intro
        </button>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="h-5 w-5 text-[var(--text-on-blue-muted)]" aria-hidden="true" />
        </motion.div>
      </div>
    </RoomWrapper>
  );
}
