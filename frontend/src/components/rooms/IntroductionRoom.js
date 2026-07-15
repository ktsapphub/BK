import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";

export default function IntroductionRoom({ section }) {
  const c = section.content || {};
  const t = themeFor(section.theme);
  const imageOnRight = (c.image_position || "right") === "right";

  const textBlock = (
    <div className="flex-1">
      <RoomEyebrow dark={t.isDark}>{c.badge || "Introduction"}</RoomEyebrow>
      <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-6" data-testid="intro-heading">
        {c.heading || "Introduction"}
      </h2>
      {c.lead && (
        <p className="font-editorial italic text-xl md:text-2xl leading-snug mb-5 max-w-[56ch]" data-testid="intro-lead">
          {c.lead}
        </p>
      )}
      {c.body && (
        <p className="font-body text-base md:text-lg leading-relaxed max-w-[62ch]" data-testid="intro-manifesto">
          {c.body}
        </p>
      )}
      {Array.isArray(c.identity_words) && c.identity_words.length > 0 && (
        <p className="font-display text-sm md:text-base mt-8 leading-relaxed" data-testid="intro-kinetic-words">
          {c.identity_words.map((w, i) => (
            <span key={i} className="inline-block">
              <span className={i % 2 === 0 ? "text-[var(--surface-blue)] font-semibold" : "opacity-70"}>{w}</span>
              {i < c.identity_words.length - 1 && <span className="opacity-30 mx-2">/</span>}
            </span>
          ))}
        </p>
      )}
      {Array.isArray(c.metrics) && c.metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-6 mt-10 max-w-md" data-testid="intro-metrics">
          {c.metrics.map((m, i) => (
            <div key={i}>
              <p className="font-display font-extrabold text-2xl md:text-3xl text-[var(--surface-blue)]">{m.value}</p>
              <p className="font-body text-xs md:text-sm mt-1 opacity-80">{m.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const imageBlock = c.portrait_url ? (
    <div className="flex-1 flex justify-center">
      <div className="relative w-full max-w-sm aspect-[4/5] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-room)] border border-[var(--border-primary)]">
        <img src={c.portrait_url} alt="Portrait of Bretton J. Key" className="w-full h-full object-cover" loading="lazy" />
      </div>
    </div>
  ) : null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="introduction-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer className={`flex flex-col ${imageOnRight ? "md:flex-row" : "md:flex-row-reverse"} gap-12 md:gap-16 items-center`}>
        {textBlock}
        {imageBlock}
      </RoomContainer>
    </RoomWrapper>
  );
}
