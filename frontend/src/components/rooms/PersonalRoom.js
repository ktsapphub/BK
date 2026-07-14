import { RoomWrapper, RoomContainer } from "./RoomWrapper";

export default function PersonalRoom({ section }) {
  const c = section.content || {};
  if (!c.statement && !c.heading) return null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="personal-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          {c.heading && <h2 className="font-display font-bold text-2xl md:text-3xl mb-6">{c.heading}</h2>}
          {c.statement && <p className="font-editorial text-xl md:text-2xl leading-relaxed">{c.statement}</p>}
          {Array.isArray(c.themes) && c.themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-7">
              {c.themes.map((t, i) => (
                <span key={i} className="font-display text-xs uppercase tracking-[0.1em] rounded-full border border-[var(--border-blue)] px-3 py-1.5">{t}</span>
              ))}
            </div>
          )}
        </div>
        {c.image && (
          <div className="aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden">
            <img src={c.image} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
