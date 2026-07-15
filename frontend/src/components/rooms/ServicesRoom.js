import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";
import { Check } from "lucide-react";

export default function ServicesRoom({ section, services }) {
  const c = section.content || {};
  const list = Array.isArray(services) ? services : [];
  const t = themeFor(section.theme);

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
              return (
                <div
                  key={svc.id}
                  data-testid="service-card"
                  className="rounded-[var(--radius-md)] overflow-hidden flex flex-col bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_18px_-6px_rgba(0,0,0,0.5)] text-white"
                >
                  {svc.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img src={svc.image_url} alt={svc.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-6 md:p-7 flex flex-col flex-1">
                    <span className="font-display text-xs uppercase tracking-[0.14em] text-white/60 block mb-3">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-display text-lg md:text-xl font-semibold text-white mb-3">{svc.title}</h3>
                    {svc.description && (
                      <p className="font-body text-sm md:text-base text-white/75 leading-relaxed mb-5">{svc.description}</p>
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
                      <a
                        href={`#${svc.cta_href || "contact"}`}
                        data-testid="service-cta-link"
                        className="focus-ring mt-auto inline-flex w-fit items-center rounded-[var(--radius-sm)] border border-white/20 px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10 transition-colors"
                      >
                        {svc.cta_label}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
