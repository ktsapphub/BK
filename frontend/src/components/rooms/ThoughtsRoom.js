import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Play, ArrowUpRight } from "lucide-react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { resolveVideoEmbed } from "@/lib/mediaEmbed";

const PAGE_SIZE = 5;

function ArticleMedia({ article }) {
  const embed = resolveVideoEmbed(article.video_url);
  if (embed) {
    return (
      <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden bg-black" data-testid="thought-video-embed">
        {embed.type === "video" ? (
          <video src={embed.src} controls className="w-full h-full object-cover" preload="metadata" />
        ) : (
          <iframe
            src={embed.src}
            title={article.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
    );
  }
  if (article.featured_image) {
    return (
      <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden">
        <img src={article.featured_image} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }
  return null;
}

export default function ThoughtsRoom({ section, thoughts }) {
  const c = section.content || {};
  const list = Array.isArray(thoughts) ? thoughts : [];
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set(list.map((a) => a.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [list]);

  if (list.length === 0) return null;

  const featured = list.find((a) => a.featured) || list[0];
  const filtered = list.filter((a) => a.id !== featured.id).filter((a) => category === "All" || a.category === category);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const featuredEmbed = resolveVideoEmbed(featured.video_url);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="thoughts-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow>{c.heading || "Notes From the Work"}</RoomEyebrow>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-10 opacity-90">{c.intro}</p>}

        {/* Featured article, editorial spread */}
        <Link
          to={`/thoughts/${featured.slug || featured.id}`}
          data-testid="thoughts-featured-article"
          className="focus-ring group grid md:grid-cols-2 gap-8 items-center mb-14 pb-10 border-b border-[var(--border-primary)]"
        >
          <div className="relative aspect-[16/10] rounded-[var(--radius-md)] overflow-hidden order-1 md:order-none">
            {featured.featured_image && (
              <img src={featured.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            )}
            {featuredEmbed && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--surface-blue)]">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </span>
            )}
          </div>
          <div>
            <span className="font-display text-[10px] uppercase tracking-[0.14em] text-[var(--surface-blue)]">{`Featured · ${featured.category || ""}`}</span>
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
                onClick={() => changeCategory(cat)}
                data-testid={`thoughts-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                aria-pressed={category === cat}
                className={`focus-ring font-display text-xs uppercase tracking-wide rounded-full px-3 py-1.5 border transition-colors ${
                  category === cat ? "bg-[var(--surface-blue)] text-white border-transparent" : "border-[var(--border-blue)] hover:bg-[var(--background-blue-soft)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {pageItems.length === 0 ? (
          <p className="font-body text-sm text-[var(--text-muted)] italic">No notes in this category yet.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full" data-testid="thoughts-accordion-list">
            {pageItems.map((article) => (
              <AccordionItem key={article.id} value={article.id} className="border-[var(--border-primary)]">
                <AccordionTrigger data-testid="thoughts-accordion-trigger" className="hover:no-underline items-start gap-4 py-5">
                  <div className="flex items-start gap-4 flex-1 text-left">
                    {article.featured_image && (
                      <div className="hidden sm:block w-20 h-20 rounded-[var(--radius-sm)] overflow-hidden shrink-0">
                        <img src={article.featured_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-display text-[10px] uppercase tracking-wide opacity-60 mb-1.5">
                        {article.category} {article.reading_time ? `· ${article.reading_time}` : ""}
                      </p>
                      <h3 className="font-display font-semibold text-lg md:text-xl">{article.title}</h3>
                      {article.excerpt && <p className="font-body text-sm opacity-70 mt-1.5 line-clamp-2">{article.excerpt}</p>}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-0 sm:pl-24 space-y-4" data-testid="thoughts-accordion-content">
                    <ArticleMedia article={article} />
                    {article.excerpt && <p className="font-editorial italic text-base opacity-85">{article.excerpt}</p>}
                    <Link
                      to={`/thoughts/${article.slug || article.id}`}
                      data-testid="thoughts-accordion-read-more"
                      className="focus-ring inline-flex items-center gap-1.5 font-display text-xs uppercase tracking-wide text-[var(--surface-blue)] hover:underline"
                    >
                      Read full note <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-10" data-testid="thoughts-pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  data-testid="thoughts-pagination-prev"
                  aria-disabled={safePage === 1}
                  className={safePage === 1 ? "pointer-events-none opacity-40" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    if (safePage > 1) setPage(safePage - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === safePage}
                    data-testid={`thoughts-pagination-page-${p}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  data-testid="thoughts-pagination-next"
                  aria-disabled={safePage === totalPages}
                  className={safePage === totalPages ? "pointer-events-none opacity-40" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    if (safePage < totalPages) setPage(safePage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
