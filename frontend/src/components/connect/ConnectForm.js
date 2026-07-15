import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import {
  REASON_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  SPEAKING_MODE_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  PREFERRED_CONTACT_OPTIONS,
  DEFAULT_CONTACT_CONSENT_TEXT,
  DEFAULT_CONTACT_CONSENT_SUPPORTING_TEXT,
  DEFAULT_CONTACT_CONSENT_VERSION,
  DEFAULT_MARKETING_CONSENT_TEXT,
  CONSENT_MISSING_ERROR,
  MESSAGE_MAX_LENGTH,
  REASON_NEXT_STEPS,
  emptyConnectFormState,
  isConnectFormDirty,
} from "@/lib/connectOptions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function makeSubmissionId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Shared "Let's Connect" inquiry form — mounted both inline in the Contact
// room and inside the floating ConnectDialog, so both surfaces use identical
// fields, validation, consent wording, and the same backend endpoint.
// `idPrefix` keeps DOM ids/data-testids unique when both instances are
// mounted on the page at the same time (e.g. Contact section + floating dialog).
export default function ConnectForm({
  settings,
  projects = [],
  initialProjectId = "",
  sourcePage = "",
  sourceSection = "",
  sourceChannel = "contact_section",
  onDirtyChange,
  onSuccess,
  className = "",
  idPrefix = "connect",
}) {
  const [form, setForm] = useState(() => emptyConnectFormState({ use_app_project_id: initialProjectId }));
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const submissionIdRef = useRef(makeSubmissionId());

  const fid = (name) => `${idPrefix}-${name}`;

  useEffect(() => {
    if (initialProjectId) setForm((f) => (f.use_app_project_id ? f : { ...f, use_app_project_id: initialProjectId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectId]);

  useEffect(() => {
    onDirtyChange?.(isConnectFormDirty(form));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const consentText = settings?.contact_consent_text || DEFAULT_CONTACT_CONSENT_TEXT;
  const consentSupportingText = settings?.contact_consent_supporting_text || DEFAULT_CONTACT_CONSENT_SUPPORTING_TEXT;
  const consentVersion = settings?.contact_consent_version || DEFAULT_CONTACT_CONSENT_VERSION;
  const marketingText = settings?.marketing_consent_text || DEFAULT_MARKETING_CONSENT_TEXT;
  const newsletterEnabled = settings?.newsletter_enabled !== false;

  const emailValid = EMAIL_RE.test(form.email.trim());
  const isValid = Boolean(form.name.trim() && emailValid && form.reason && form.message.trim() && form.contact_consent);

  const contactOptions = useMemo(() => {
    const hasPhone = Boolean(form.phone.trim());
    return PREFERRED_CONTACT_OPTIONS.filter((opt) => hasPhone || !["Phone call", "Text message"].includes(opt));
  }, [form.phone]);

  const inquiryProjects = useMemo(() => projects.filter((p) => p.available_for_inquiry), [projects]);

  const resetForNewMessage = () => {
    setForm(emptyConnectFormState());
    setSubmitted(false);
    setAttemptedSubmit(false);
    setConsentError(false);
    submissionIdRef.current = makeSubmissionId();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setErrorState(false);
    if (!form.contact_consent) {
      setConsentError(true);
      return;
    }
    if (!isValid) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        contact_consent_text: consentText,
        contact_consent_version: consentVersion,
        marketing_consent_text: form.marketing_consent ? marketingText : null,
        source_page: sourcePage || (typeof window !== "undefined" ? window.location.pathname : ""),
        source_section: sourceSection || null,
        source_channel: sourceChannel,
        submission_id: submissionIdRef.current,
      };
      await publicApi.submitInquiry(payload);
      if (form.marketing_consent && form.email) {
        publicApi.subscribeNewsletter(form.email).catch(() => {});
      }
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setErrorState(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid={fid("success-state")} className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2.5 text-[var(--surface-blue)]">
          <CheckCircle2 className="h-5 w-5" />
          <h3 className="font-display font-bold text-xl">Thank You for Reaching Out</h3>
        </div>
        <p className="font-body text-sm md:text-base opacity-90">
          I received your message and will follow up using the contact information you provided.
        </p>
        {form.reason && REASON_NEXT_STEPS[form.reason] && (
          <p className="font-body text-sm opacity-70">{REASON_NEXT_STEPS[form.reason]}</p>
        )}
        <button
          type="button"
          onClick={resetForNewMessage}
          data-testid={fid("send-another-button")}
          className="focus-ring mt-2 font-display text-xs uppercase tracking-wide text-[var(--surface-blue)] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid={fid("form")} className={`space-y-4 ${className}`} noValidate>
      {errorState && (
        <div role="alert" data-testid={fid("error-banner")} className="rounded-[var(--radius-sm)] border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-display text-sm font-semibold text-destructive">Your Message Could Not Be Sent</p>
            <p className="font-body text-xs text-destructive/90 mt-0.5">
              Please check your connection and try again, or use the contact information in the website footer.
            </p>
          </div>
        </div>
      )}

      {/* Honeypot — hidden from sighted/keyboard users, invisible bait for bots */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
        <label htmlFor={fid("company")}>Company</label>
        <input id={fid("company")} name="company" type="text" tabIndex={-1} autoComplete="off" value={form.hp} onChange={(e) => setField("hp")(e.target.value)} />
      </div>

      <div>
        <Label htmlFor={fid("name")}>Name</Label>
        <Input
          id={fid("name")}
          data-testid={fid("name-input")}
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setField("name")(e.target.value)}
          aria-invalid={attemptedSubmit && !form.name.trim()}
          required
        />
      </div>

      <div>
        <Label htmlFor={fid("email")}>Email</Label>
        <Input
          id={fid("email")}
          type="email"
          data-testid={fid("email-input")}
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setField("email")(e.target.value)}
          aria-invalid={attemptedSubmit && !emailValid}
          required
        />
      </div>

      <div>
        <Label htmlFor={fid("phone")}>Phone (optional)</Label>
        <Input
          id={fid("phone")}
          type="tel"
          data-testid={fid("phone-input")}
          placeholder="(555) 123-4567 or +44 20 1234 5678"
          value={form.phone}
          onChange={(e) => setField("phone")(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={fid("reason")}>Reason for connecting</Label>
        <Select value={form.reason} onValueChange={setField("reason")}>
          <SelectTrigger id={fid("reason")} data-testid={fid("reason-select")} aria-invalid={attemptedSubmit && !form.reason}>
            <SelectValue placeholder="What would you like to connect about?" />
          </SelectTrigger>
          <SelectContent className="!z-[80]">
            {REASON_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt} data-testid={fid(`reason-option-${slugify(opt)}`)}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conditional fields per reason */}
      {form.reason === "I have a project for you" && (
        <div className="grid sm:grid-cols-2 gap-4" data-testid={fid("conditional-project")}>
          <div>
            <Label htmlFor={fid("project-type")}>Project type</Label>
            <Select value={form.project_type} onValueChange={setField("project_type")}>
              <SelectTrigger id={fid("project-type")} data-testid={fid("project-type-select")}>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent className="!z-[80]">
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={fid("project-stage")}>Stage</Label>
            <Select value={form.project_stage} onValueChange={setField("project_stage")}>
              <SelectTrigger id={fid("project-stage")} data-testid={fid("project-stage-select")}>
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
              <SelectContent className="!z-[80]">
                {PROJECT_STAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {form.reason === "Let me pick your brain" && (
        <div data-testid={fid("conditional-pick-brain")}>
          <Label htmlFor={fid("pick-brain-topic")}>What's on your mind?</Label>
          <Textarea
            id={fid("pick-brain-topic")}
            data-testid={fid("pick-brain-topic-input")}
            rows={3}
            value={form.pick_brain_topic}
            onChange={(e) => setField("pick_brain_topic")(e.target.value)}
          />
          <p className="font-body text-xs opacity-60 mt-1.5">Larger advisory asks may fit a scheduled consult better.</p>
        </div>
      )}

      {form.reason === "Speaking engagement" && (
        <div className="grid sm:grid-cols-2 gap-4" data-testid={fid("conditional-speaking")}>
          <div>
            <Label htmlFor={fid("speaking-org")}>Organization</Label>
            <Input id={fid("speaking-org")} data-testid={fid("speaking-org-input")} value={form.speaking_org} onChange={(e) => setField("speaking_org")(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={fid("speaking-event")}>Event name</Label>
            <Input id={fid("speaking-event")} data-testid={fid("speaking-event-input")} value={form.speaking_event} onChange={(e) => setField("speaking_event")(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={fid("speaking-date")}>Event date</Label>
            <Input id={fid("speaking-date")} type="date" data-testid={fid("speaking-date-input")} value={form.speaking_date} onChange={(e) => setField("speaking_date")(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={fid("speaking-location")}>Event location</Label>
            <Input id={fid("speaking-location")} data-testid={fid("speaking-location-input")} value={form.speaking_location} onChange={(e) => setField("speaking_location")(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={fid("speaking-mode")}>Virtual or in-person</Label>
            <Select value={form.speaking_mode} onValueChange={setField("speaking_mode")}>
              <SelectTrigger id={fid("speaking-mode")} data-testid={fid("speaking-mode-select")}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="!z-[80]">
                {SPEAKING_MODE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={fid("speaking-audience")}>Audience size</Label>
            <Input id={fid("speaking-audience")} data-testid={fid("speaking-audience-input")} value={form.speaking_audience_size} onChange={(e) => setField("speaking_audience_size")(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={fid("speaking-topic")}>Topic</Label>
            <Input id={fid("speaking-topic")} data-testid={fid("speaking-topic-input")} value={form.speaking_topic} onChange={(e) => setField("speaking_topic")(e.target.value)} />
          </div>
        </div>
      )}

      {form.reason === "I want to use your app(s)" && (
        <div data-testid={fid("conditional-use-app")}>
          <Label htmlFor={fid("use-app")}>Which app?</Label>
          <Select value={form.use_app_project_id} onValueChange={setField("use_app_project_id")}>
            <SelectTrigger id={fid("use-app")} data-testid={fid("use-app-select")}>
              <SelectValue placeholder={inquiryProjects.length ? "Select a project" : "No projects currently open for inquiries"} />
            </SelectTrigger>
            <SelectContent className="!z-[80]">
              {inquiryProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {form.reason === "Partnership or collaboration" && (
        <div data-testid={fid("conditional-partnership")}>
          <Label htmlFor={fid("partnership-type")}>Partnership type</Label>
          <Select value={form.partnership_type} onValueChange={setField("partnership_type")}>
            <SelectTrigger id={fid("partnership-type")} data-testid={fid("partnership-type-select")}>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent className="!z-[80]">
              {PARTNERSHIP_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor={fid("message")}>Tell me a little more</Label>
        <Textarea
          id={fid("message")}
          data-testid={fid("message-input")}
          rows={4}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder="Share a few details about your project, question, opportunity, or interest."
          value={form.message}
          onChange={(e) => setField("message")(e.target.value)}
          aria-invalid={attemptedSubmit && !form.message.trim()}
          required
        />
        <p className="font-body text-[11px] opacity-50 mt-1 text-right">{form.message.length}/{MESSAGE_MAX_LENGTH}</p>
      </div>

      {contactOptions.length > 0 && (
        <div>
          <Label>Preferred contact method</Label>
          <RadioGroup
            value={form.preferred_contact_method}
            onValueChange={setField("preferred_contact_method")}
            data-testid={fid("preferred-contact-group")}
            className="grid grid-cols-2 gap-2 mt-1.5"
          >
            {contactOptions.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={fid(`contact-${slugify(opt)}`)} data-testid={fid(`preferred-contact-${slugify(opt)}`)} />
                <Label htmlFor={fid(`contact-${slugify(opt)}`)} className="font-normal text-sm cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <div className="pt-1 space-y-2">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id={fid("consent")}
            data-testid={fid("consent-checkbox")}
            checked={form.contact_consent}
            onCheckedChange={(v) => {
              setField("contact_consent")(Boolean(v));
              if (v) setConsentError(false);
            }}
            aria-required="true"
            aria-invalid={consentError}
            aria-describedby={`${fid("consent-supporting")}${consentError ? ` ${fid("consent-error")}` : ""}`}
            className="mt-0.5"
          />
          <Label htmlFor={fid("consent")} className="text-xs font-normal leading-snug opacity-90">
            {consentText}
          </Label>
        </div>
        <p id={fid("consent-supporting")} className="font-body text-[11px] opacity-60 leading-snug pl-6">
          {consentSupportingText} Your information will be used to respond to this inquiry and managed according to the website's{" "}
          <Link to="/privacy" data-testid={fid("privacy-link")} className="focus-ring underline hover:text-[var(--surface-blue)]">
            Privacy Policy
          </Link>
          .
        </p>
        {consentError && (
          <p id={fid("consent-error")} role="alert" data-testid={fid("consent-error")} className="font-body text-xs text-destructive pl-6">
            {CONSENT_MISSING_ERROR}
          </p>
        )}
      </div>

      {newsletterEnabled && (
        <div className="flex items-start gap-2.5">
          <Checkbox
            id={fid("marketing-consent")}
            data-testid={fid("marketing-checkbox")}
            checked={form.marketing_consent}
            onCheckedChange={(v) => setField("marketing_consent")(Boolean(v))}
            className="mt-0.5"
          />
          <Label htmlFor={fid("marketing-consent")} className="text-xs font-normal leading-snug opacity-80">
            {marketingText}
          </Label>
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        data-testid={fid("submit-button")}
        className="focus-ring w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-blue)] px-5 py-3 font-display text-sm font-semibold text-white hover:bg-[var(--accent-highlight)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
