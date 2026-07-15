// Single source of truth for the "Let's Connect" inquiry form. Shared by the
// FloatingConnectButton dialog AND the inline Contact room form so both stay
// in perfect sync (same options, same validation, same wording).

export const REASON_OPTIONS = [
  "I have a project for you",
  "Let me pick your brain",
  "Speaking engagement",
  "I want to use your app(s)",
  "Partnership or collaboration",
  "Something else",
];

export const PROJECT_TYPE_OPTIONS = [
  "Website/landing page",
  "Web app",
  "Mobile app",
  "Product strategy",
  "Program/project leadership",
  "Process improvement",
  "AI-enabled solution",
  "Consulting",
  "Other",
];

export const PROJECT_STAGE_OPTIONS = ["Idea", "Planning", "In development", "Needs improvement", "Ready to launch", "Not sure"];

export const SPEAKING_MODE_OPTIONS = ["Virtual", "In-person", "Either / Not sure"];

export const PARTNERSHIP_TYPE_OPTIONS = [
  "Business partnership",
  "Product integration",
  "Affiliate/referral",
  "Community initiative",
  "Investor conversation",
  "Content/media collaboration",
  "Other",
];

export const PREFERRED_CONTACT_OPTIONS = ["Email", "Phone call", "Text message", "Any of these is fine"];

export const DEFAULT_CONTACT_CONSENT_TEXT =
  "I agree that Bretton Key may contact me by email, phone call, or text message regarding this inquiry. Message and data rates may apply.";
export const DEFAULT_CONTACT_CONSENT_SUPPORTING_TEXT =
  "Consent applies only to communications related to this request unless you separately choose to receive marketing updates. You may ask not to be contacted by phone or text at any time.";
export const DEFAULT_CONTACT_CONSENT_VERSION = "contact-consent-v1";
export const DEFAULT_MARKETING_CONSENT_TEXT =
  "Yes, I would also like to receive occasional updates from Bretton about projects, applications, services, and events.";
export const CONSENT_MISSING_ERROR = "Please provide consent so Bretton can respond to your inquiry.";

export const MESSAGE_MAX_LENGTH = 1500;

export const REASON_NEXT_STEPS = {
  "I have a project for you": "I'll review the details you shared and follow up about scope, fit, and next steps.",
  "Let me pick your brain": "I'll take a look and get back to you. For bigger advisory asks, I may suggest a scheduled consult instead.",
  "Speaking engagement": "I'll check the event details and confirm availability with you directly.",
  "I want to use your app(s)": "I'll follow up with next steps to get you set up.",
  "Partnership or collaboration": "I'll review the opportunity and reach out to discuss further.",
  "Something else": "I'll read what you shared and follow up as soon as I can.",
};

export function emptyConnectFormState(overrides = {}) {
  return {
    name: "",
    email: "",
    phone: "",
    reason: "",
    project_type: "",
    project_stage: "",
    pick_brain_topic: "",
    speaking_org: "",
    speaking_event: "",
    speaking_date: "",
    speaking_location: "",
    speaking_mode: "",
    speaking_audience_size: "",
    speaking_topic: "",
    use_app_project_id: "",
    partnership_type: "",
    message: "",
    preferred_contact_method: "",
    contact_consent: false,
    marketing_consent: false,
    hp: "",
    ...overrides,
  };
}

// Returns true if the form currently has any user-entered content worth
// warning about before discarding (used by the floating dialog).
export function isConnectFormDirty(form) {
  const blank = emptyConnectFormState();
  return Object.keys(blank).some((key) => key !== "hp" && form[key] && form[key] !== blank[key]);
}
