import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Link2, Linkedin, Twitter } from "lucide-react";

export default function ArticleReader() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [allThoughts, setAllThoughts] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    setArticle(null);
    setNotFound(false);
    window.scrollTo({ top: 0, behavior: "auto" });
    publicApi
      .getThought(slug)
      .then((a) => mounted && setArticle(a))
      .catch(() => mounted && setNotFound(true));
    publicApi
      .getThoughts()
      .then((list) => mounted && setAllThoughts(Array.isArray(list) ? list : []))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [slug]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    const others = allThoughts.filter((a) => a.id !== article.id);
    const sameCategory = others.filter((a) => a.category === article.category);
    const rest = others.filter((a) => a.category !== article.category);
    return [...sameCategory, ...rest].slice(0, 3);
  }, [article, allThoughts]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy link. Please copy the URL manually.");
    }
  };

  const shareTargets = article
    ? [
        {
          label: "Share on LinkedIn",
          icon: Linkedin,
          href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        },
        {
          label: "Share on X",
          icon: Twitter,
          href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`,
        },
      ]
    : [];

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-[var(--background-primary)]">
        <p className="font-editorial italic text-2xl">This article could not be found.</p>
        <Link to="/" className="focus-ring font-display text-sm text-[var(--surface-blue)] hover:underline">Back to home</Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen p-8 space-y-6 bg-[var(--background-primary)]">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <article data-testid="article-reader" className="min-h-screen bg-[var(--background-primary)] text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-[68ch] px-5 sm:px-8 py-16 md:py-24">
        <Link to="/#thoughts" className="focus-ring inline-flex items-center gap-2 font-display text-xs uppercase tracking-wide text-[var(--text-muted)] hover:text-[var(--surface-blue)] mb-10">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Thoughts
        </Link>
        <p className="font-display text-xs uppercase tracking-wide opacity-60 mb-3">
          {article.category} {article.reading_time ? `· ${article.reading_time}` : ""}
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-6">{article.title}</h1>
        {article.excerpt && <p className="font-editorial italic text-lg md:text-xl opacity-90 mb-8">{article.excerpt}</p>}
        {article.featured_image && (
          <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden mb-10 border border-[var(--border-blue)]">
            <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="font-body text-base leading-[1.8] space-y-5">
          {(article.body || "").split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Share */}
        <div data-testid="article-share-block" className="flex flex-wrap items-center gap-3 mt-14 pt-8 border-t border-[var(--border-primary)]">
          <span className="font-display text-xs uppercase tracking-wide opacity-60 mr-1">Share this note</span>
          {shareTargets.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              data-testid={`article-share-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="focus-ring inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--border-blue)] text-[var(--text-primary)] hover:bg-[var(--background-blue-soft)] hover:text-[var(--surface-blue)] transition-colors"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy article link"
            data-testid="article-share-copy-link"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border-blue)] px-4 py-2 font-display text-xs uppercase tracking-wide hover:bg-[var(--background-blue-soft)] hover:text-[var(--surface-blue)] transition-colors"
          >
            <Link2 className="h-3.5 w-3.5" /> Copy Link
          </button>
        </div>
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="border-t border-[var(--border-primary)] bg-[var(--background-secondary)]">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-16 md:py-20">
            <p className="font-display text-xs md:text-sm uppercase tracking-[0.16em] text-[var(--text-muted)] mb-8">
              More Thoughts
            </p>
            <div data-testid="article-related-list" className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/thoughts/${rel.slug || rel.id}`}
                  data-testid="article-related-link"
                  className="focus-ring group block"
                >
                  {rel.featured_image && (
                    <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden mb-4 border border-[var(--border-blue)]">
                      <img src={rel.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <p className="font-display text-[10px] uppercase tracking-wide opacity-60 mb-1.5">{rel.category}</p>
                  <h3 className="font-display font-semibold text-lg group-hover:text-[var(--surface-blue)] transition-colors">{rel.title}</h3>
                  {rel.excerpt && <p className="font-body text-sm opacity-70 mt-2 line-clamp-2">{rel.excerpt}</p>}
                  <span className="inline-flex items-center gap-1.5 mt-3 font-display text-xs text-[var(--surface-blue)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Read note <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
