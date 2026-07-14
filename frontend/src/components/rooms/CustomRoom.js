import { RoomWrapper, RoomContainer } from "./RoomWrapper";

export default function CustomRoom({ section }) {
  const c = section.content || {};
  const hasContent = c.header || c.subheader || (Array.isArray(c.paragraphs) && c.paragraphs.length > 0);
  if (!hasContent) return null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="custom-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer className="max-w-3xl">
        {c.eyebrow && <p className="font-display text-xs uppercase tracking-[0.16em] opacity-70 mb-4">{c.eyebrow}</p>}
        {c.header && <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">{c.header}</h2>}
        {c.subheader && <p className="font-editorial italic text-xl opacity-90 mb-6">{c.subheader}</p>}
        {Array.isArray(c.paragraphs) && c.paragraphs.map((p, i) => (
          <p key={i} className="font-body text-base opacity-90 mb-4">{p}</p>
        ))}
      </RoomContainer>
    </RoomWrapper>
  );
}
