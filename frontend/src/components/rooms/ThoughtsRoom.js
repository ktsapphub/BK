import { Link } from "react-router-dom";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";

export default function ThoughtsRoom({ section, thoughts }) {
  const c = section.content || {};
  const list = Array.isArray(thoughts) ? thoughts : [];

  if (list.length === 0) return null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="thoughts-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow>{c.heading || "Thoughts"}</RoomEyebrow>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-10 opacity-90">{c.intro}</p>}
        <ul className="grid md:grid-cols-2 gap-8" data-testid="thoughts-list">
          {list.map((article) => (
            <li key={article.id}>
              <Link to={`/thoughts/${article.slug || article.id}`} className="focus-ring group block">
                {article.featured_image && (
                  <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden mb-4">
                    <img src={article.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                <p className="font-display text-[10px] uppercase tracking-wide opacity-60 mb-1.5">{article.category} {article.reading_time ? `· ${article.reading_time}` : ""}</p>
                <h3 className="font-display font-semibold text-lg md:text-xl group-hover:text-[var(--surface-blue)] transition-colors">{article.title}</h3>
                {article.excerpt && <p className="font-body text-sm opacity-70 mt-2">{article.excerpt}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </RoomContainer>
    </RoomWrapper>
  );
}
