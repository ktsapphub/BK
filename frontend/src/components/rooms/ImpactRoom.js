import { useEffect, useRef, useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ExternalLink, Mic, Newspaper, Tv, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveVideoEmbed } from "@/lib/mediaEmbed";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

const CATEGORIES = [
  { key: "Feature", label: "Features", sub: "Digital Publications", icon: Newspaper },
  { key: "Podcast", label: "Podcasts", sub: "Audio Interviews", icon: Mic },
  { key: "TV & Video", label: "TV & Video Appearances", sub: "Broadcast & Video", icon: Tv },
];

const AUTOPLAY_INTERVAL_MS = 4000;

function AnimatedCounter({ target = 30, suffix = "+", duration = 1100 }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (!ref.current || started) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration, reduced]);

  return (
    <span ref={ref} data-testid="impact-counter">
      {value}
      {suffix}
    </span>
  );
}

function ImpactSlide({ item }) {
  const embed = resolveVideoEmbed(item.video_url);
  return (
    <div
      data-testid="impact-slide"
      className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-blue)] bg-[var(--background-primary)] text-[var(--text-primary)] shadow-[var(--shadow-room)] h-full flex flex-col"
    >
      <div className="aspect-video bg-[var(--background-blue-soft)] flex items-center justify-center relative overflow-hidden">
        {embed ? (
          embed.type === "video" ? (
            <video src={embed.src} controls className="w-full h-full object-cover" preload="metadata" />
          ) : (
            <iframe
              src={embed.src}
              title={item.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          )
        ) : item.image_url ? (
          <img src={item.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Newspaper className="h-8 w-8 text-[var(--surface-blue)] opacity-50" aria-hidden="true" />
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="font-display text-[10px] uppercase tracking-wide text-[var(--surface-blue)] mb-1.5">
          {[item.org, item.date].filter(Boolean).join(" \u00b7 ")}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug mb-2">{item.title}</h3>
        {item.description && <p className="font-body text-sm opacity-75 leading-relaxed line-clamp-3 mb-4">{item.description}</p>}
        {item.external_link && (
          <a
            href={item.external_link}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="impact-slide-link"
            className="focus-ring mt-auto inline-flex items-center gap-1.5 font-display text-xs font-semibold text-[var(--surface-blue)] hover:underline"
          >
            View Full Story <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ImpactRoom({ section, impactItems }) {
  const c = section.content || {};
  const list = Array.isArray(impactItems) ? impactItems : [];
  const t = themeFor(section.theme);
  const reduced = useReducedMotionPref();
  const grouped = CATEGORIES.map((cat) => ({ ...cat, items: list.filter((i) => i.category === cat.key) }));
  const firstNonEmpty = grouped.find((g) => g.items.length > 0)?.key || null;
  const [activeCategory, setActiveCategory] = useState(firstNonEmpty);
  const [api, setApi] = useState(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api || reduced || paused) return;
    const id = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [api, reduced, paused, activeCategory]);

  useEffect(() => {
    if (!api) return;
    api.scrollTo(0, true);
  }, [api, activeCategory]);

  if (list.length === 0) return null;

  const active = grouped.find((g) => g.key === activeCategory) || null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="media-impact-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow dark={t.isDark}>{c.heading || "Where You May Have Seen Me"}</RoomEyebrow>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-8 opacity-90">{c.intro}</p>}

        <div className="flex items-baseline gap-3 mb-10">
          <span className="font-display text-5xl md:text-6xl font-bold tracking-[-0.02em]">
            <AnimatedCounter target={30} />
          </span>
          <span className="font-body text-sm md:text-base opacity-70 max-w-[26ch]">
            Media placements across publications, podcasts, and broadcast
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" data-testid="impact-category-tiles">
          {grouped.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                disabled={cat.items.length === 0}
                data-testid={`impact-tile-${cat.key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                aria-pressed={isActive}
                className={`focus-ring group rounded-[var(--radius-md)] p-6 text-left transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${
                  isActive
                    ? "bg-gradient-to-b from-zinc-600 via-zinc-800 to-black text-white border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_-6px_rgba(0,0,0,0.55)]"
                    : "bg-white/5 border-white/15 hover:bg-gradient-to-b hover:from-zinc-600 hover:via-zinc-800 hover:to-black hover:text-white hover:border-transparent"
                }`}
              >
                <Icon className="h-5 w-5 mb-3 opacity-80" aria-hidden="true" />
                <p className="font-display text-lg font-semibold">{cat.label}</p>
                <p className="font-body text-xs opacity-60 mt-1">
                  {cat.sub} &middot; {cat.items.length} placement{cat.items.length === 1 ? "" : "s"}
                </p>
              </button>
            );
          })}
        </div>

        {active && active.items.length > 0 && (
          <div
            className="relative"
            data-testid="impact-carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <Carousel setApi={setApi} opts={{ loop: active.items.length > 1, align: "start" }} className="w-full">
              <CarouselContent className="-ml-4">
                {active.items.map((item) => (
                  <CarouselItem key={item.id} className="pl-4 basis-[85%] sm:basis-[60%] md:basis-[42%] lg:basis-[32%]">
                    <ImpactSlide item={item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {active.items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => api?.scrollPrev()}
                  aria-label="Previous"
                  data-testid="impact-carousel-prev"
                  className="focus-ring absolute left-1 md:-left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => api?.scrollNext()}
                  aria-label="Next"
                  data-testid="impact-carousel-next"
                  className="focus-ring absolute right-1 md:-right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
