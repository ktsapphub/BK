import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";

export default function ThoughtsRoom({ section, thoughts }) {
  const c = section.content || {};
  const list = Array.isArray(thoughts) ? thoughts : [];
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(list.map((a) => a.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [list]);

  if (list.length === 0) return null;

  const featured = list.find((a) => a.featured) || list[0];
  const rest = list.filter((a) => a.id !== featured.id).filter((a) => category === "All" || a.category === category);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="thoughts-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow>{c.heading || "Notes From the Work"}</RoomEyebrow>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-10 opacity-90">{c.intro}</p>}

        {/* Featured article, editorial spread */}
        <Link to={`/thoughts/${featured.slug || featured.id}`} data-testid="thoughts-featured-article" className="focus-ring group grid md:grid-cols-2 gap-8 items-center mb-14 pb-10 border-b border-[var(--border-primary)]">
          {featured.featured_image && (
            <div className="aspect-[16/10] rounded-[var(--radius-md)] overflow-hidden order-1 md:order-none">
              <img src={featured.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          )}
          <div>
            <span className="font-display text-[10px] uppercase tracking-[0.14em] text-[var(--surface-blue)]">{`Featured \u00b7 ${featured.category}`}</span>
            <h3 className="font-display font-bold text-2xl md:text-3xl mt-2 group-hover:text-[var(--surface-blue)] transition-colors">{featured.title}</h3>
            {featured.excerpt && <p className="font-editorial italic text-base md:text-lg opacity-80 mt-3">{featured.excerpt}</p>}
            {featured.reading_time && <span className="font-body text-xs opacity-50 mt-3 block">{featured.reading_time}</span>}
          </div>
        </Link>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-8" data-testid="thoughts-category-filter">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`focus-ring font-display text-xs uppercase tracking-wide rounded-full px-3 py-1.5 border transition-colors ${
                  category === cat ? "bg-[var(--surface-blue)] text-white border-transparent" : "border-[var(--border-blue)] hover:bg-[var(--background-blue-soft)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <ul className="grid md:grid-cols-2 gap-8" data-testid="thoughts-list">
          {rest.map((article) => (
            <li key={article.id}>
              <Link to={`/thoughts/${article.slug || article.id}`} className="focus-ring group block">
                {article.featured_image && (
                  <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden mb-4">
                    <img src={article.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                <p className="font-display text-[10px] uppercase tracking-wide opacity-60 mb-1.5">{article.category} {article.reading_time ? `\u00b7 ${article.reading_time}` : ""}</p>
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
