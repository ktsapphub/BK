import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

const STATUS_STYLES = {
  Live: "bg-[var(--background-blue-soft)] text-[var(--surface-blue)] border-[var(--border-blue)]",
  "In Development": "bg-[var(--background-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)]",
  Concept: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  Archived: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  Private: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  "Case Study Available": "bg-[var(--surface-blue)] text-white border-transparent",
};

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    publicApi
      .getProject(slug)
      .then((p) => mounted && setProject(p))
      .catch(() => mounted && setNotFound(true));
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-[var(--background-primary)]">
        <p className="font-editorial italic text-2xl">This project could not be found.</p>
        <Link to="/" className="focus-ring font-display text-sm text-[var(--surface-blue)] hover:underline">Back to home</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen p-8 space-y-6 bg-[var(--background-primary)]">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-72 w-full rounded-[var(--radius-md)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-primary)] text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-16 md:py-24">
        <Link to="/#projects" className="focus-ring inline-flex items-center gap-2 font-display text-xs uppercase tracking-wide text-[var(--text-muted)] hover:text-[var(--surface-blue)] mb-10">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <Badge className={`border font-display text-[10px] uppercase tracking-wide ${STATUS_STYLES[project.status] || STATUS_STYLES.Concept}`}>{project.status}</Badge>
          {project.category && <span className="font-display text-xs uppercase tracking-wide opacity-60">{project.category}</span>}
        </div>
        <h1 className="font-display font-bold text-3xl md:text-5xl tracking-[-0.01em] mb-6">{project.title}</h1>
        {project.summary && <p className="font-editorial italic text-xl md:text-2xl opacity-90 mb-10">{project.summary}</p>}

        {project.thumbnail_url && (
          <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden mb-12 shadow-[var(--shadow-room)]">
            <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-10">
          {project.problem && (
            <div>
              <h2 className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2">Problem</h2>
              <p className="font-body text-sm md:text-base opacity-90">{project.problem}</p>
            </div>
          )}
          {project.solution && (
            <div>
              <h2 className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2">Approach</h2>
              <p className="font-body text-sm md:text-base opacity-90">{project.solution}</p>
            </div>
          )}
        </div>

        {Array.isArray(project.outcomes) && project.outcomes.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">Outcomes</h2>
            <ul className="space-y-2">
              {project.outcomes.map((o, i) => (
                <li key={i} className="font-body text-sm md:text-base flex gap-2"><span className="text-[var(--surface-blue)]">—</span>{o}</li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(project.features) && project.features.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">Features</h2>
            <div className="flex flex-wrap gap-2">
              {project.features.map((f, i) => (
                <span key={`${i}-${String(f).slice(0, 30)}`} className="font-display text-xs rounded-full border border-[var(--border-blue)] px-3 py-1">{f}</span>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((t, i) => (
              <span key={`${i}-${String(t).slice(0, 30)}`} className="font-body text-xs rounded-full bg-[var(--background-secondary)] px-3 py-1">{t}</span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-12">
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-blue)] px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-[var(--accent-highlight)]">
              Visit Live <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {project.case_study_url && (
            <a href={project.case_study_url} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-blue)] px-5 py-2.5 font-display text-sm font-semibold hover:bg-[var(--background-blue-soft)]">
              Case Study <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-blue)] px-5 py-2.5 font-display text-sm font-semibold hover:bg-[var(--background-blue-soft)]">
              Repository <Github className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
