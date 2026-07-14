import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";

export default function ValuesRoom({ section }) {
  const c = section.content || {};
  const items = Array.isArray(c.items) ? c.items : [];

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="values-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow>Values</RoomEyebrow>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-4">{c.heading || "What Drives Me"}</h2>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-12 opacity-90">{c.intro}</p>}
        {items.length === 0 ? (
          <EmptyRoomNotice message="Values are being curated." />
        ) : (
          <ol className="divide-y divide-[var(--border-blue)]" data-testid="values-list">
            {items.map((item, i) => (
              <li key={i} className="group flex gap-6 py-6 md:py-8 transition-transform hover:translate-x-1">
                <span className="font-display text-sm text-[var(--surface-blue)] mt-1 w-10 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display font-semibold text-lg md:text-xl mb-1.5">{item.title}</h3>
                  {item.description && <p className="font-body text-sm md:text-base opacity-80 max-w-[58ch]">{item.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
