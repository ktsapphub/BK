import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import ConnectForm from "@/components/connect/ConnectForm";
import { Mail, Phone, MapPin, CalendarClock, Linkedin, Download } from "lucide-react";

export default function ContactRoom({ section, settings, projects }) {
  const c = section.content || {};

  const actions = [
    c.scheduling_url && { label: "Schedule a Conversation", href: c.scheduling_url, icon: CalendarClock, external: true },
    { label: "Send a Message", href: "#contact-form-anchor", icon: Mail, scrollTo: true },
    settings?.social_linkedin && { label: "Connect on LinkedIn", href: settings.social_linkedin, icon: Linkedin, external: true },
    settings?.resume_pdf_url && { label: "Download Résumé", href: settings.resume_pdf_url, icon: Download, external: true },
  ].filter(Boolean);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="contact-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer className="grid md:grid-cols-2 gap-14">
        <div>
          <RoomEyebrow dark>Contact</RoomEyebrow>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-5">{c.heading || "What Could We Move Forward Together?"}</h2>
          {c.description && <p className="font-body text-base md:text-lg opacity-90 max-w-md mb-8">{c.description}</p>}

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8" data-testid="contact-actions">
              {actions.map((a, i) => (
                <a
                  key={i}
                  href={a.href}
                  target={a.external ? "_blank" : undefined}
                  rel={a.external ? "noopener noreferrer" : undefined}
                  data-testid={`contact-action-${i}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-blue)] px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wide hover:bg-white/10"
                >
                  <a.icon className="h-3.5 w-3.5" /> {a.label}
                </a>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {c.email && (
              <a href={`mailto:${c.email}`} className="focus-ring flex items-center gap-3 font-body text-sm hover:text-[var(--accent-highlight)]">
                <Mail className="h-4 w-4" /> {c.email}
              </a>
            )}
            {c.phone && (
              <p className="flex items-center gap-3 font-body text-sm"><Phone className="h-4 w-4" /> {c.phone}</p>
            )}
            {c.location && (
              <p className="flex items-center gap-3 font-body text-sm"><MapPin className="h-4 w-4" /> {c.location}</p>
            )}
          </div>
        </div>

        <div id="contact-form-anchor" data-testid="contact-form-panel" className="bg-[var(--background-primary)] text-[var(--text-primary)] rounded-[var(--radius-md)] p-6 md:p-8 shadow-[var(--shadow-room)]">
          <ConnectForm
            settings={settings}
            projects={projects}
            sourcePage="/"
            sourceSection={section.id}
            sourceChannel="contact_section"
            idPrefix="contact-connect"
          />
        </div>
      </RoomContainer>
    </RoomWrapper>
  );
}
