import { useState } from "react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Phone, MapPin, CalendarClock } from "lucide-react";

export default function ContactRoom({ section }) {
  const c = section.content || {};
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
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
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Something went wrong sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="contact-room" sectionType={section.section_type} className="py-24 md:py-32">
      <RoomContainer className="grid md:grid-cols-2 gap-14">
        <div>
          <RoomEyebrow dark>Contact</RoomEyebrow>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-5">{c.heading || "Build Together"}</h2>
          {c.description && <p className="font-body text-base md:text-lg opacity-90 max-w-md mb-8">{c.description}</p>}
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
            {c.scheduling_url && (
              <a
                href={c.scheduling_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="contact-scheduling-link"
                className="focus-ring inline-flex items-center gap-2 mt-4 font-display text-sm font-semibold rounded-[var(--radius-sm)] border border-[var(--border-blue)] px-5 py-2.5 hover:bg-white/10"
              >
                <CalendarClock className="h-4 w-4" /> Schedule Time
              </a>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} data-testid="contact-form" className="bg-[var(--background-primary)] text-[var(--text-primary)] rounded-[var(--radius-md)] p-6 md:p-8 shadow-[var(--shadow-room)]">
          {submitted ? (
            <p className="font-editorial italic text-lg">{c.confirmation_message || "Thank you — your message has been received."}</p>
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
              <button
                type="submit"
                disabled={submitting}
                data-testid="contact-submit-button"
                className="focus-ring w-full rounded-[var(--radius-sm)] bg-[var(--surface-blue)] px-5 py-3 font-display text-sm font-semibold text-white hover:bg-[var(--accent-highlight)] disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </div>
          )}
        </form>
      </RoomContainer>
    </RoomWrapper>
  );
}
