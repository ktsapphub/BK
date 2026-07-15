import { useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { X } from "lucide-react";

export default function ServicesRoom({ section, services }) {
  const c = section.content || {};
  const list = Array.isArray(services) ? services : [];
  const t = themeFor(section.theme);
  const [open, setOpen] = useState(null);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="services-list">
            {list.map((svc, i) => {
              const variant = i % 3;
              const spanClass = variant === 0 ? "lg:col-span-2" : "";
              const cardStyle =
                variant === 0
                  ? "bg-white/[0.07] border border-white/15"
                  : variant === 1
                  ? "bg-transparent border border-[var(--border-blue)]"
                  : "bg-[var(--surface-blue)]/90 border border-transparent";
              return (
                <button
                  key={svc.id}
                  onClick={() => setOpen(svc)}
                  data-testid="service-open-sheet-button"
                  className={`focus-ring group text-left rounded-[var(--radius-md)] p-6 md:p-7 flex flex-col justify-between min-h-[180px] transition-transform hover:-translate-y-1 ${spanClass} ${cardStyle}`}
                >
                  <div>
                    <span className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-on-blue-muted)] block mb-3">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-display text-lg md:text-xl font-semibold">{svc.title}</h3>
                  </div>
                  <p className="font-body text-sm text-[var(--text-on-blue-muted)] mt-4 line-clamp-2">{svc.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </RoomContainer>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="right" className="bg-[var(--background-primary)] text-[var(--text-primary)] w-full sm:max-w-lg overflow-y-auto">
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close"
            data-testid="service-sheet-close-button"
            className="focus-ring absolute right-4 top-4 z-50 rounded-full p-1.5 bg-[var(--background-secondary)] text-[var(--text-primary)] hover:bg-[var(--background-blue-soft)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">{open.title}</SheetTitle>
                <SheetDescription className="font-body">{open.description}</SheetDescription>
              </SheetHeader>
              {open.image_url && (
                <img src={open.image_url} alt={open.title} className="w-full rounded-[var(--radius-md)] mt-4 aspect-video object-cover" loading="lazy" />
              )}
              {Array.isArray(open.capabilities) && open.capabilities.length > 0 && (
                <div className="mt-6">
                  <p className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">Capabilities</p>
                  <ul className="space-y-2">
                    {open.capabilities.map((cap, i) => (
                      <li key={i} className="font-body text-sm flex gap-2"><span className="text-[var(--surface-blue)]">—</span>{cap}</li>
                    ))}
                  </ul>
                </div>
              )}
              {open.cta_label && (
                <a href={`#${open.cta_href || "contact"}`} className="focus-ring inline-flex mt-8 items-center rounded-[var(--radius-sm)] bg-[var(--surface-blue)] px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-[var(--accent-highlight)]">
                  {open.cta_label}
                </a>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </RoomWrapper>
  );
}
