import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function ArticleReader() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    publicApi
      .getThought(slug)
      .then((a) => mounted && setArticle(a))
      .catch(() => mounted && setNotFound(true));
    return () => {
      mounted = false;
    };
  }, [slug]);

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
          <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden mb-10">
            <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="font-body text-base leading-[1.8] space-y-5">
          {(article.body || "").split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
