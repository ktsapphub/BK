import { useState } from "react";
import { Check, Plus, Minus } from "lucide-react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { themeFor } from "@/lib/theme";
import { openCalendlyPopup } from "@/lib/calendly";

// Derives a short, human-readable UTM tag for a service so booked Calendly
// events can be traced back to exactly which service tile they came from
// (e.g. "01_Agile", "02_PO", "03_Speaking", "04_Tech").
function serviceUtmTag(title, index) {
  const t = (title || "").toLowerCase();
  let tag = "Service";
  if (t.includes("agile")) tag = "Agile";
  else if (t.includes("product")) tag = "PO";
  else if (t.includes("mentor") || t.includes("speak")) tag = "Speaking";
  else if (t.includes("tech")) tag = "Tech";
  else if (title) tag = title.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
  return `${String(index + 1).padStart(2, "0")}_${tag}`;
}

export default function ServicesRoom({ section, services, settings }) {
  const c = section.content || {};
  const list = Array.isArray(services) ? services : [];
  const t = themeFor(section.theme);
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => setExpandedId((cur) => (cur === id ? null : id));

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="services-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer>
        <RoomEyebrow dark={t.isDark}>Services</RoomEyebrow>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-4">{c.heading || "How I Can Help"}</h2>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-12 opacity-90">{c.intro}</p>}

        {list.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--border-blue)] p-8 text-center">
            <p className="font-editorial italic text-xl">Consulting by request.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="services-list">
            {list.map((svc, i) => {
              const bullets = (Array.isArray(svc.capabilities) ? svc.capabilities : []).slice(0, 4);
              const isOpen = expandedId === svc.id;
              const number = String(i + 1).padStart(2, "0");

              return (
                <div
                  key={svc.id}
                  data-testid="service-card"
                  data-expanded={isOpen}
                  className="rounded-[var(--radius-md)] overflow-hidden flex flex-col bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_18px_-6px_rgba(0,0,0,0.5)] text-white transition-shadow duration-300"
                >
                  <Collapsible open={isOpen} onOpenChange={() => toggle(svc.id)}>
                    {svc.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img src={svc.image_url} alt={svc.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}

                    <div className="p-6 md:p-7 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="font-display text-xs uppercase tracking-[0.14em] text-white/60 block mb-3" data-testid="service-number">
                            {number}
                          </span>
                          <h3 className="font-display text-lg md:text-xl font-semibold text-white" data-testid="service-title">
                            {svc.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggle(svc.id)}
                        aria-expanded={isOpen}
                        data-testid="service-explore-more-button"
                        className="focus-ring group mt-5 inline-flex w-fit items-center gap-2 rounded-[var(--radius-sm)] border border-white/20 px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10 active:bg-white/15 transition-colors"
                      >
                        {isOpen ? <Minus className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                        {isOpen ? "Show Less" : "Explore More"}
                      </button>

                      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                        <div className="pt-6 mt-6 border-t border-white/10">
                          {svc.description && (
                            <p className="font-body text-sm md:text-base text-white/75 leading-relaxed mb-5" data-testid="service-description">
                              {svc.description}
                            </p>
                          )}
                          {bullets.length > 0 && (
                            <ul className="space-y-2.5 mb-6" data-testid="service-bullets">
                              {bullets.map((cap, ci) => (
                                <li key={ci} className="flex gap-2.5 font-body text-sm text-white/85">
                                  <Check className="h-4 w-4 text-white/50 shrink-0 mt-0.5" aria-hidden="true" />
                                  {cap}
                                </li>
                              ))}
                            </ul>
                          )}
                          {svc.cta_label && (
                            <button
                              type="button"
                              onClick={() =>
                                openCalendlyPopup({
                                  baseUrl: settings?.scheduling_url,
                                  utm: {
                                    utm_source: "ServicesRoom",
                                    utm_medium: "cta",
                                    utm_campaign: "Consulting_Services",
                                    utm_content: serviceUtmTag(svc.title, i),
                                  },
                                  prefill: svc.title ? { customAnswers: { a1: svc.title } } : undefined,
                                })
                              }
                              data-testid="service-cta-button"
                              className="focus-ring inline-flex w-fit items-center rounded-[var(--radius-sm)] bg-gradient-to-b from-zinc-500 via-zinc-700 to-zinc-900 px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:from-zinc-400 hover:via-zinc-600 hover:to-zinc-800 transition-colors"
                            >
                              {svc.cta_label}
                            </button>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
