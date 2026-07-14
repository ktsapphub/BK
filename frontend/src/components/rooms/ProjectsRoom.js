import { Link } from "react-router-dom";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  Live: "bg-[var(--background-blue-soft)] text-[var(--surface-blue)] border-[var(--border-blue)]",
  "In Development": "bg-[var(--background-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)]",
  Concept: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  Archived: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  Private: "bg-[var(--background-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]",
  "Case Study Available": "bg-[var(--surface-blue)] text-white border-transparent",
};

export default function ProjectsRoom({ section, projects }) {
  const c = section.content || {};
  const list = Array.isArray(projects) ? projects : [];

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="projects-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow>Projects</RoomEyebrow>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-4">{c.heading || "Selected Work"}</h2>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-12 opacity-90">{c.intro}</p>}

        {list.length === 0 ? (
          <EmptyRoomNotice message="Work archive is being prepared — reach out via the contact room." />
        ) : (
          <ul className="divide-y divide-[var(--border-blue)]" data-testid="projects-list">
            {list.map((p) => (
              <li key={p.id} className="py-6 md:py-7">
                <Link
                  to={`/projects/${p.slug || p.id}`}
                  data-testid="project-open-detail-link"
                  className="focus-ring group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
                >
                  <span className="font-display text-lg md:text-2xl font-semibold group-hover:text-[var(--surface-blue)] transition-colors">{p.title}</span>
                  <Badge data-testid="project-status-badge" className={`border font-display text-[10px] uppercase tracking-wide ${STATUS_STYLES[p.status] || STATUS_STYLES.Concept}`}>
                    {p.status}
                  </Badge>
                  <span className="font-body text-sm opacity-70 flex-1">{p.summary}</span>
                  <span className="font-display text-xs opacity-50 shrink-0">{p.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
