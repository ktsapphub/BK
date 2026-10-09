import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, FileText, Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RESUME_PAGES, resumeUrl } from "@/lib/resume";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function formatRange(entry) {
  const start = entry.start_date || "";
  const end = entry.is_current ? "Present" : entry.end_date || "";
  return [start, end].filter(Boolean).join(" \u2014 ");
}

export default function ResumeRoom({ section, careerEntries, settings }) {
  const c = section.content || {};
  const entries = Array.isArray(careerEntries) ? careerEntries : [];
  const t = themeFor(section.theme);
  const [activeId, setActiveId] = useState(entries[0]?.id);
  const active = entries.find((e) => e.id === activeId) || entries[0];
  const pdf = resumeUrl(settings);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="resume-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-4">
          <div>
            <RoomEyebrow dark={t.isDark}>Résumé</RoomEyebrow>
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em]">{c.heading || "Twenty Years in Motion"}</h2>
          </div>
          <div className="flex gap-3">
            <ResumeButton pdf={pdf} />
            {settings?.social_linkedin && (
              <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" data-testid="resume-linkedin-link" className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-blue)] px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide hover:bg-[var(--background-blue-soft)]">
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            )}
          </div>
        </div>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[64ch] mb-12 opacity-90">{c.intro}</p>}

        {entries.length === 0 ? (
          <EmptyRoomNotice message="Résumé currently being curated — reach out via the contact room for details." />
        ) : (
          <>
            {/* Desktop: milestone rail + detail panel */}
            {/* The rail scrolls on its own and is about as tall as one role's story, so long
                careers don't leave a tall empty gap beside the text. */}
            <div className="hidden md:grid grid-cols-[260px_1fr] gap-10 items-start" data-testid="resume-timeline">
              <div
                data-lenis-prevent
                data-testid="resume-rail"
                aria-label="Roles, newest first. Scroll for earlier roles."
                className="max-h-[400px] overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin] [mask-image:linear-gradient(to_bottom,black_88%,transparent)]"
              >
              <div className="relative pl-7 pt-1 pb-8">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border-blue)]" aria-hidden="true" />
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setActiveId(entry.id)}
                    data-testid="resume-entry"
                    className="focus-ring relative block w-full text-left pb-4 group"
                  >
                    <span
                      className={`absolute -left-7 top-1 h-3.5 w-3.5 rounded-full border-2 transition-all ${
                        activeId === entry.id ? "bg-[var(--surface-blue)] border-[var(--surface-blue)] scale-110" : "bg-[var(--background-primary)] border-[var(--border-blue)] group-hover:border-[var(--surface-blue)]"
                      }`}
                    />
                    <span className={`font-display text-sm block transition-colors ${activeId === entry.id ? "text-[var(--surface-blue)] font-semibold" : "opacity-70 group-hover:opacity-100"}`}>
                      {formatRange(entry)}
                    </span>
                    <span className={`font-display text-xs block mt-0.5 ${activeId === entry.id ? "opacity-90" : "opacity-50"}`}>{entry.title}</span>
                  </button>
                ))}
              </div>
              </div>
              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, clipPath: "inset(0 40% 0 40% round 12px)" }}
                    animate={{ opacity: 1, clipPath: "inset(0 0% 0 0% round 12px)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                  >
                    <h3 className="font-display font-bold text-xl md:text-2xl">{active.title}</h3>
                    <p className="font-body text-sm opacity-80 mt-1">
                      {active.org}{active.location ? ` \u00b7 ${active.location}` : ""}
                    </p>
                    {active.description && <p className="font-body text-sm md:text-base mt-4 opacity-90 max-w-[62ch]">{active.description}</p>}
                    {Array.isArray(active.achievements) && active.achievements.length > 0 && (
                      <ul className="mt-5 space-y-2">
                        {active.achievements.map((a, i) => (
                          <li key={`${active.id}-ach-${i}`} className="font-body text-sm md:text-base flex gap-2">
                            <span className="text-[var(--surface-blue)] mt-1">—</span>
                            <span className="opacity-90">{a}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {Array.isArray(active.skills) && active.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-5">
                        {active.skills.map((s, i) => (
                          <span key={`${active.id}-skill-${i}`} className="font-display text-xs rounded-full border border-[var(--border-blue)] px-3 py-1">{s}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile: accordion timeline */}
            <Accordion type="single" collapsible className="md:hidden">
              {entries.map((entry) => (
                <AccordionItem key={entry.id} value={entry.id}>
                  <AccordionTrigger className="font-display text-left">
                    <span>
                      {entry.title}
                      <span className="block text-xs opacity-70 font-body">{entry.org} · {formatRange(entry)}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    {entry.description && <p className="text-sm opacity-90 mb-3">{entry.description}</p>}
                    {Array.isArray(entry.achievements) && (
                      <ul className="space-y-2">
                        {entry.achievements.map((a, i) => (
                          <li key={`${entry.id}-ach-${i}`} className="text-sm opacity-90">— {a}</li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}

// "Résumé" opens the pages in a scrollable overlay with the full PDF one tap away.
// Page images look the same on every browser (iOS Safari shows only page 1 of an embedded PDF).
function ResumeButton({ pdf }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid="resume-download-button" className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-blue)] px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide hover:bg-[var(--background-blue-soft)]">
        <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Résumé
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="resume-overlay" className="max-w-3xl w-[calc(100vw-24px)] p-0 gap-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--background-primary)]">
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 pr-12 border-b border-[var(--border-blue)]">
            <DialogTitle className="font-display font-bold text-lg">Résumé</DialogTitle>
            <DialogDescription className="sr-only">Two-page résumé preview. Scroll to read, or download the full PDF.</DialogDescription>
            <div className="ml-auto flex gap-2">
              <a href={pdf} download="Bretton_Key_Resume.pdf" data-testid="resume-overlay-download" className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-blue)] px-3.5 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
                <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download full version
              </a>
              <a href={pdf} target="_blank" rel="noopener noreferrer" aria-label="Open the PDF in a new tab" className="focus-ring hidden sm:inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border-blue)] px-2.5 py-2 hover:bg-[var(--background-blue-soft)]">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div data-lenis-prevent className="max-h-[78vh] overflow-y-auto overscroll-contain bg-[var(--background-blue-soft)] p-3 sm:p-5 space-y-4" data-testid="resume-overlay-pages">
            {RESUME_PAGES.map((src, i) => (
              <img key={src} src={src} alt={`Bretton Key résumé, page ${i + 1} of ${RESUME_PAGES.length}`} width="935" height="1210" className="block w-full h-auto bg-white shadow-[var(--shadow-room)] rounded-sm" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
