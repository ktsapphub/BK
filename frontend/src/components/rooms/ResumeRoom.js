import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function formatRange(entry) {
  const start = entry.start_date || "";
  const end = entry.is_current ? "Present" : entry.end_date || "";
  return [start, end].filter(Boolean).join(" — ");
}

export default function ResumeRoom({ section, careerEntries }) {
  const c = section.content || {};
  const entries = Array.isArray(careerEntries) ? careerEntries : [];
  const [activeId, setActiveId] = useState(entries[0]?.id);
  const active = entries.find((e) => e.id === activeId) || entries[0];

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="resume-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow>Résumé</RoomEyebrow>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-4">{c.heading || "Career Timeline"}</h2>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-12 opacity-90">{c.intro}</p>}

        {entries.length === 0 ? (
          <EmptyRoomNotice message="Résumé currently being curated — reach out via the contact room for details." />
        ) : (
          <>
            {/* Desktop: split timeline */}
            <div className="hidden md:grid grid-cols-[220px_1fr] gap-10" data-testid="resume-timeline">
              <div className="space-y-1 border-l border-[var(--border-blue)] pl-5">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setActiveId(entry.id)}
                    data-testid="resume-entry"
                    className={`focus-ring block w-full text-left py-2.5 font-display text-sm transition-colors ${
                      activeId === entry.id ? "text-[var(--surface-blue)] font-semibold" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {formatRange(entry)}
                    {entry.is_current && <span className="ml-2 text-[10px] uppercase tracking-wide rounded-full bg-[var(--background-blue-soft)] text-[var(--surface-blue)] px-2 py-0.5">Current</span>}
                  </button>
                ))}
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
                      {active.org}{active.location ? ` · ${active.location}` : ""}
                    </p>
                    {active.description && <p className="font-body text-sm md:text-base mt-4 opacity-90 max-w-[62ch]">{active.description}</p>}
                    {Array.isArray(active.achievements) && active.achievements.length > 0 && (
                      <ul className="mt-5 space-y-2">
                        {active.achievements.map((a, i) => (
                          <li key={i} className="font-body text-sm md:text-base flex gap-2">
                            <span className="text-[var(--surface-blue)] mt-1">—</span>
                            <span className="opacity-90">{a}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {Array.isArray(active.skills) && active.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-5">
                        {active.skills.map((s, i) => (
                          <span key={i} className="font-display text-xs rounded-full border border-[var(--border-blue)] px-3 py-1">{s}</span>
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
                          <li key={i} className="text-sm opacity-90">— {a}</li>
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
