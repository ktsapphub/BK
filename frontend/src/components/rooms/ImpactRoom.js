import { useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

export default function ImpactRoom({ section, impactItems }) {
  const c = section.content || {};
  const list = Array.isArray(impactItems) ? impactItems : [];
  const [open, setOpen] = useState(null);

  if (list.length === 0) return null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="media-impact-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow>{c.heading || "Media & Impact"}</RoomEyebrow>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-10 opacity-90">{c.intro}</p>}
        <ul className="divide-y divide-[var(--border-blue)]" data-testid="media-impact-list">
          {list.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setOpen(item)}
                data-testid="media-impact-open-dialog"
                className="focus-ring w-full flex flex-wrap items-center gap-3 py-5 text-left group"
              >
                <span className="font-display text-[10px] uppercase tracking-wide rounded-full border border-[var(--border-blue)] px-2.5 py-1">{item.category}</span>
                <span className="font-display text-base md:text-lg font-semibold group-hover:text-[var(--surface-blue)] transition-colors">{item.title}</span>
                <span className="font-body text-sm opacity-60">{item.org}</span>
                <span className="font-body text-xs opacity-50 ml-auto">{item.date}</span>
              </button>
            </li>
          ))}
        </ul>
      </RoomContainer>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="bg-[var(--background-primary)] text-[var(--text-primary)]">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{open.title}</DialogTitle>
                <DialogDescription className="font-body">{[open.org, open.date].filter(Boolean).join(" · ")}</DialogDescription>
              </DialogHeader>
              {open.image_url && <img src={open.image_url} alt={open.title} className="w-full rounded-[var(--radius-md)] aspect-video object-cover" loading="lazy" />}
              {open.description && <p className="font-body text-sm opacity-90 mt-2">{open.description}</p>}
              {open.external_link && (
                <a href={open.external_link} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1.5 mt-4 font-display text-sm text-[var(--surface-blue)] hover:underline">
                  View Source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </RoomWrapper>
  );
}
