import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

gsap.registerPlugin(ScrollTrigger);

export default function FounderStoryRoom({ section }) {
  const c = section.content || {};
  const chapters = Array.isArray(c.chapters) ? c.chapters : [];
  const pinRef = useRef(null);
  const panelRefs = useRef([]);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (reduced || chapters.length === 0 || !pinRef.current) return;
    const ctx = gsap.context(() => {
      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        gsap.fromTo(
          panel,
          { autoAlpha: i === 0 ? 1 : 0 },
          {
            autoAlpha: 1,
            scrollTrigger: {
              trigger: `[data-chapter="${i}"]`,
              start: "top center",
              end: "bottom center",
              scrub: true,
            },
          }
        );
      });
    }, pinRef);
    return () => ctx.revert();
  }, [reduced, chapters.length]);

  if (chapters.length === 0 && !c.heading) return null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="founder-story-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow dark>Founder Story</RoomEyebrow>
        <h2 className="font-editorial italic text-3xl md:text-5xl mb-14 max-w-2xl">{c.heading}</h2>
        {chapters.length === 0 ? (
          <EmptyRoomNotice message="Founder story coming soon." />
        ) : (
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start" ref={pinRef}>
            <div className="relative aspect-[4/5] rounded-[var(--radius-md)] overflow-hidden md:sticky md:top-24 shadow-[var(--shadow-room)]">
              {chapters.map((ch, i) => (
                <img
                  key={i}
                  ref={(el) => (panelRefs.current[i] = el)}
                  src={ch.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                />
              ))}
            </div>
            <div className="space-y-16">
              {chapters.map((ch, i) => (
                <p
                  key={i}
                  data-chapter={i}
                  data-testid="founder-story-chapter"
                  className="font-editorial text-xl md:text-2xl leading-relaxed"
                >
                  {ch.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
