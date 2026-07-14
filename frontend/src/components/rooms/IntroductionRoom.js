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
      {c.body && (
        <p className="font-body text-base md:text-lg leading-relaxed max-w-[62ch]" data-testid="intro-manifesto">
          {c.body}
        </p>
      )}
      {Array.isArray(c.identity_words) && c.identity_words.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-7">
          {c.identity_words.map((w, i) => (
            <span
              key={i}
              className="font-display text-xs uppercase tracking-[0.1em] rounded-full border border-[var(--border-blue)] px-3 py-1.5"
            >
              {w}
            </span>
          ))}
        </div>
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
