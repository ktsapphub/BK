import { useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Phone, MapPin, CalendarClock, Linkedin, Download } from "lucide-react";

export default function ContactRoom({ section, settings }) {
  const c = section.content || {};
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [subscribe, setSubscribe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await publicApi.submitInquiry(form);
      toast.success(res.message || c.confirmation_message || "Message sent.");
      if (subscribe) {
        publicApi.subscribeNewsletter(form.email).catch(() => {});
      }
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Something went wrong sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const actions = [
    c.scheduling_url && { label: "Schedule a Conversation", href: c.scheduling_url, icon: CalendarClock, external: true },
    { label: "Send a Message", href: "#contact-form-anchor", icon: Mail, scrollTo: true },
    settings?.social_linkedin && { label: "Connect on LinkedIn", href: settings.social_linkedin, icon: Linkedin, external: true },
    settings?.resume_pdf_url && { label: "Download R\u00e9sum\u00e9", href: settings.resume_pdf_url, icon: Download, external: true },
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

        <form id="contact-form-anchor" onSubmit={handleSubmit} data-testid="contact-form" className="bg-[var(--background-primary)] text-[var(--text-primary)] rounded-[var(--radius-md)] p-6 md:p-8 shadow-[var(--shadow-room)]">
          {submitted ? (
            <p className="font-editorial italic text-lg">{c.confirmation_message || "Thank you \u2014 your message has been received."}</p>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <Input id="contact-name" data-testid="contact-name-input" value={form.name} onChange={update("name")} required />
              </div>
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" type="email" data-testid="contact-email-input" value={form.email} onChange={update("email")} required />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone (optional)</Label>
                <Input id="contact-phone" data-testid="contact-phone-input" value={form.phone} onChange={update("phone")} />
              </div>
              <div>
                <Label htmlFor="contact-subject">Subject (optional)</Label>
                <Input id="contact-subject" data-testid="contact-subject-input" value={form.subject} onChange={update("subject")} />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" data-testid="contact-message-input" rows={4} value={form.message} onChange={update("message")} required />
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox id="newsletter-optin" data-testid="contact-newsletter-checkbox" checked={subscribe} onCheckedChange={setSubscribe} />
                <Label htmlFor="newsletter-optin" className="text-xs font-normal opacity-80 leading-snug">
                  Occasional thoughts on technology, leadership, entrepreneurship, building useful products, and what I am learning along the way.
                </Label>
              </div>
              <button
                type="submit"
                disabled={submitting}
                data-testid="contact-submit-button"
                className="focus-ring w-full rounded-[var(--radius-sm)] bg-[var(--surface-blue)] px-5 py-3 font-display text-sm font-semibold text-white hover:bg-[var(--accent-highlight)] disabled:opacity-60"
              >
                {submitting ? "Sending\u2026" : "Send Message"}
              </button>
            </div>
          )}
        </form>
      </RoomContainer>
    </RoomWrapper>
  );
}
