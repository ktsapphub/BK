import { useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ExternalLink, Mic, Award, Newspaper, Users } from "lucide-react";

const CATEGORY_ICON = {
  Feature: Newspaper,
  Press: Newspaper,
  Podcast: Mic,
  Speaking: Mic,
  Award: Award,
  "Program Highlight": Award,
  Mentorship: Users,
  Community: Users,
};

export default function ImpactRoom({ section, impactItems }) {
  const c = section.content || {};
  const list = Array.isArray(impactItems) ? impactItems : [];
  const [open, setOpen] = useState(null);

  if (list.length === 0) return null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="media-impact-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow>{c.heading || "Evidence of Impact"}</RoomEyebrow>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-12 opacity-90">{c.intro}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-primary)] rounded-[var(--radius-md)] overflow-hidden" data-testid="media-impact-list">
          {list.map((item) => {
            const Icon = CATEGORY_ICON[item.category] || Newspaper;
            return (
              <button
                key={item.id}
                onClick={() => setOpen(item)}
                data-testid="media-impact-open-dialog"
                className="focus-ring bg-[var(--background-primary)] p-6 text-left flex flex-col gap-3 hover:bg-[var(--background-blue-soft)] transition-colors min-h-[160px]"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="h-10 w-10 rounded-full bg-[var(--background-blue-soft)] text-[var(--surface-blue)] flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                )}
                <div>
                  <p className="font-display text-[10px] uppercase tracking-wide text-[var(--surface-blue)] mb-1">{item.category}</p>
                  <p className="font-display text-sm md:text-base font-semibold leading-snug">{item.title}</p>
                  <p className="font-body text-xs opacity-60 mt-1">{[item.org, item.date].filter(Boolean).join(" \u00b7 ")}</p>
                </div>
              </button>
            );
          })}
        </div>
      </RoomContainer>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="bg-[var(--background-primary)] text-[var(--text-primary)]">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{open.title}</DialogTitle>
                <DialogDescription className="font-body">{[open.org, open.date].filter(Boolean).join(" \u00b7 ")}</DialogDescription>
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
