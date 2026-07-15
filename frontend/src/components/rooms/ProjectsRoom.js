import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { resolveVideoEmbed } from "@/lib/mediaEmbed";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

const STATUS_STYLES = {
  Live: "bg-[var(--background-blue-soft)] text-[var(--surface-blue)] border-[var(--border-blue)]",
  "In Development": "bg-[var(--background-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)]",
  Concept: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  Archived: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  Private: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  "Case Study Available": "bg-[var(--surface-blue)] text-white border-transparent",
};

const AUTOPLAY_INTERVAL_MS = 4500;

function SolutionSlide({ project, distance }) {
  const embed = resolveVideoEmbed(project.video_url);
  const clampedDistance = Math.max(-2, Math.min(2, distance));
  const magnitude = Math.abs(clampedDistance);

  return (
    <div
      data-testid="solutions-slide"
      data-active={distance === 0 ? "true" : "false"}
      className="mx-2 md:mx-4 rounded-[var(--radius-md)] overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-700 via-zinc-900 to-black shadow-[var(--shadow-room)] transition-transform duration-500 ease-out will-change-transform"
      style={{
        transform: `scale(${1 - magnitude * 0.14}) rotateY(${clampedDistance * -22}deg) translateZ(${-magnitude * 70}px)`,
        opacity: 1 - magnitude * 0.35,
        zIndex: 10 - magnitude,
      }}
    >
      <div className="relative aspect-video bg-black">
        {embed ? (
          embed.type === "video" ? (
            <video src={embed.src} controls={distance === 0} muted playsInline preload="metadata" className="w-full h-full object-cover" />
          ) : (
            <>
              <iframe
                src={embed.src}
                title={project.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </>
          )
        ) : project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <Play className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="p-5 md:p-6 text-white">
        <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
          <Badge data-testid="solutions-slide-status" className={`border font-display text-[10px] uppercase tracking-wide ${STATUS_STYLES[project.status] || STATUS_STYLES.Concept}`}>
            {project.status}
          </Badge>
          {project.category && <span className="font-display text-[11px] text-white/50">{project.category}</span>}
        </div>
        <h3 className="font-display font-bold text-xl md:text-2xl mb-2 text-white">{project.title}</h3>
        {project.summary && <p className="font-body text-sm md:text-base text-white/80 leading-relaxed">{project.summary}</p>}
      </div>
    </div>
  );
}

export default function ProjectsRoom({ section, projects }) {
  const c = section.content || {};
  const list = Array.isArray(projects) ? projects : [];
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

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="projects-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow dark={t.isDark}>Projects</RoomEyebrow>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-4">{c.heading || "Solutions"}</h2>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-12 opacity-90">{c.intro}</p>}

        {list.length === 0 ? (
          <EmptyRoomNotice message="Solutions archive is being prepared — reach out via the contact room." />
        ) : (
          <div
            className="relative [perspective:1400px]"
            data-testid="solutions-carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <Carousel setApi={setApi} opts={{ loop: list.length > 1, align: "center" }} className="w-full">
              <CarouselContent className="-ml-0 py-6">
                {list.map((p, i) => (
                  <CarouselItem key={p.id} className="pl-0 basis-[84%] md:basis-[66%] lg:basis-[58%]">
                    <SolutionSlide project={p} distance={i - selectedIndex} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {list.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => api?.scrollPrev()}
                  aria-label="Previous solution"
                  data-testid="solutions-carousel-prev"
                  className="focus-ring absolute left-1 md:-left-3 top-[38%] -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => api?.scrollNext()}
                  aria-label="Next solution"
                  data-testid="solutions-carousel-next"
                  className="focus-ring absolute right-1 md:-right-3 top-[38%] -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[var(--background-primary)]/90 border border-[var(--border-blue)] flex items-center justify-center hover:bg-[var(--background-blue-soft)] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-2 mt-8" data-testid="solutions-carousel-dots">
                  {list.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-label={`Go to ${p.title}`}
                      aria-current={i === selectedIndex}
                      data-testid="solutions-carousel-dot"
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
