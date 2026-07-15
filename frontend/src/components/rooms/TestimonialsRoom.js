import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Linkedin } from "lucide-react";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

const AUTOPLAY_INTERVAL_MS = 5000;

function Avatar({ testimonial }) {
  if (testimonial.portrait_url) {
    return (
      <img
        src={testimonial.portrait_url}
        alt={testimonial.portrait_alt || testimonial.name}
        className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover border-2 border-white/20 shrink-0"
        loading="lazy"
      />
    );
  }
  return (
    <div className="h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-600 via-zinc-800 to-black border-2 border-white/20 shrink-0">
      <span className="font-display font-bold text-lg md:text-xl text-white">{testimonial.name?.[0] || "?"}</span>
    </div>
  );
}

function VoiceSlide({ testimonial, distance }) {
  const clampedDistance = Math.max(-2, Math.min(2, distance));
  const magnitude = Math.abs(clampedDistance);
  const meta = [testimonial.title, testimonial.org].filter(Boolean).join(", ");
  const scale = distance === 0 ? 1.08 : Math.max(0.8, 1 - magnitude * 0.15);
  const opacity = distance === 0 ? 1 : Math.max(0.45, 1 - magnitude * 0.35);

  return (
    <div
      data-testid="voices-slide"
      data-active={distance === 0 ? "true" : "false"}
      className="mx-2 md:mx-3 aspect-[4/5] rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-blue)] bg-[var(--background-primary)] shadow-[var(--shadow-room)] transition-transform duration-500 ease-out will-change-transform"
      style={{
        transform: `scale(${scale}) rotateY(${clampedDistance * -14}deg) translateZ(${-magnitude * 40}px)`,
        opacity,
        zIndex: 10 - magnitude,
      }}
    >
      <div className="h-full p-6 md:p-8 flex flex-col items-center text-center justify-center overflow-hidden">
        <Quote className="h-5 w-5 text-[var(--surface-blue)] opacity-40 mb-3 shrink-0" aria-hidden="true" />
        <p data-testid="voices-quote" className="font-editorial italic text-base md:text-lg leading-relaxed text-[var(--text-primary)] mb-5 max-w-[26ch] line-clamp-6">
          {testimonial.full_quote}
        </p>
        <Avatar testimonial={testimonial} />
        <p className="font-display text-sm font-semibold text-[var(--text-primary)] mt-3">{testimonial.name}</p>
        {meta && <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">{meta}</p>}
        {testimonial.linkedin_url && (
          <a
            href={testimonial.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 mt-2 text-xs font-display text-[var(--surface-blue)] hover:underline"
          >
            <Linkedin className="h-3 w-3" /> View Source
          </a>
        )}
      </div>
    </div>
  );
}

export default function TestimonialsRoom({ section, testimonials }) {
  const c = section.content || {};
  const list = Array.isArray(testimonials) ? testimonials : [];
  const t = themeFor(section.theme);
  const reduced = useReducedMotionPref();
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
    if (!api || reduced || paused || list.length <= 1) return;
    const id = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [api, reduced, paused, list.length]);

  if (list.length === 0) return null; // graceful hide: no verified testimonials yet

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="voices-impact-room" sectionType={section.section_type} className="py-24 md:py-28">
      <RoomContainer>
        <div className="text-center mb-10">
          <RoomEyebrow dark={t.isDark}>Voices &amp; Impact</RoomEyebrow>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em]">{c.heading || "Voices and Impact"}</h2>
          {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mx-auto mt-4 opacity-90">{c.intro}</p>}
        </div>

        {list.length === 0 ? (
          <EmptyRoomNotice message="Testimonials are being curated." />
        ) : (
          <div
            className="relative [perspective:1400px]"
            data-testid="voices-carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <Carousel setApi={setApi} opts={{ loop: list.length > 1, align: "center" }} className="w-full">
              <CarouselContent className="-ml-0 py-8">
                {list.map((tm, i) => (
                  <CarouselItem key={tm.id} className="pl-0 basis-[88%] sm:basis-[68%] md:basis-[50%] lg:basis-[40%]">
                    <VoiceSlide testimonial={tm} distance={i - selectedIndex} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {list.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => api?.scrollPrev()}
                  aria-label="Previous testimonial"
                  data-testid="voices-carousel-prev"
                  className="focus-ring absolute left-1 md:-left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => api?.scrollNext()}
                  aria-label="Next testimonial"
                  data-testid="voices-carousel-next"
                  className="focus-ring absolute right-1 md:-right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-2 mt-8" data-testid="voices-carousel-dots">
                  {list.map((tm, i) => (
                    <button
                      key={tm.id}
                      type="button"
                      aria-label={`Go to testimonial from ${tm.name}`}
                      aria-current={i === selectedIndex}
                      data-testid="voices-carousel-dot"
                      onClick={() => api?.scrollTo(i)}
                      className={`focus-ring h-2 rounded-full transition-all ${
                        i === selectedIndex ? "w-6 bg-[var(--surface-blue)]" : "w-2 bg-[var(--border-blue)] hover:bg-[var(--accent-highlight)]"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
