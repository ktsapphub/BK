// Declarative content schemas per section_type, used by the generic
// DynamicContentForm in the admin CMS to render the correct fields.
// Field types: text | textarea | image | boolean | select | array_string | array_object | object

export const SECTION_TYPES = [
  "hero", "introduction", "values", "logos", "thoughts", "resume", "services",
  "projects", "testimonials", "media", "impact",
  "personal", "gallery", "contact", "custom",
];

export const THEMES = [
  { value: "true_white", label: "True White" },
  { value: "soft_white", label: "Soft White" },
  { value: "pale_blue", label: "Pale Blue" },
  { value: "deep_royal_blue", label: "Deep Royal Blue" },
];

export const TRANSITIONS = [
  "fade", "slide", "mask-reveal", "curtain-reveal", "doorway-reveal",
  "spotlight-reveal", "depth-transition", "editorial-page-turn",
  "soft-focus-reveal", "none",
];

const ctaFields = [{ name: "label", type: "text", label: "Label" }, { name: "href", type: "text", label: "Link / href" }];

export const CONTENT_SCHEMAS = {
  hero: [
    { name: "eyebrow", type: "text", label: "Eyebrow" },
    { name: "heading", type: "text", label: "Heading" },
    { name: "rotating_words", type: "array_string", label: "Rotating Words" },
    { name: "subheading", type: "textarea", label: "Subheading" },
    { name: "bg_image_url", type: "image", label: "Background Image" },
    { name: "alignment", type: "select", label: "Alignment", options: ["left", "center", "right"] },
    { name: "availability_badge", type: "text", label: "Availability Badge" },
    { name: "primary_cta", type: "object", label: "Primary CTA", fields: ctaFields },
    { name: "secondary_cta", type: "object", label: "Secondary CTA", fields: ctaFields },
  ],
  introduction: [
    { name: "portrait_url", type: "image", label: "Portrait" },
    { name: "heading", type: "text", label: "Heading" },
    { name: "lead", type: "textarea", label: "Lead / Pull Quote (Fraunces editorial line)" },
    { name: "body", type: "textarea", label: "Body" },
    { name: "identity_words", type: "array_string", label: "Identity Words (kinetic sequence)" },
    { name: "badge", type: "text", label: "Badge" },
    { name: "image_position", type: "select", label: "Image Position", options: ["left", "right"] },
    { name: "layout_direction", type: "select", label: "Layout Direction", options: ["ltr", "rtl"] },
    { name: "metrics", type: "array_object", label: "Metrics", fields: [{ name: "label", type: "text" }, { name: "value", type: "text" }] },
  ],
  values: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
    { name: "items", type: "array_object", label: "Values", fields: [{ name: "title", type: "text" }, { name: "image", type: "image" }, { name: "description", type: "textarea" }] },
  ],
  logos: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
    { name: "items", type: "array_object", label: "Organizations", fields: [{ name: "name", type: "text" }, { name: "logo_url", type: "image" }] },
  ],
  resume: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
  ],
  services: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
  ],
  projects: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
  ],
  testimonials: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
  ],
  media: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
  ],
  impact: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
  ],
  thoughts: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "intro", type: "textarea", label: "Intro" },
  ],
  personal: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "statement", type: "textarea", label: "Statement" },
    { name: "themes", type: "array_string", label: "Themes" },
    { name: "image", type: "image", label: "Image" },
  ],
  gallery: [
    { name: "title", type: "text", label: "Title" },
    { name: "description", type: "textarea", label: "Description" },
    { name: "images", type: "array_object", label: "Images", fields: [{ name: "url", type: "image" }, { name: "caption", type: "text" }, { name: "alt", type: "text" }] },
  ],
  contact: [
    { name: "heading", type: "text", label: "Heading" },
    { name: "description", type: "textarea", label: "Description" },
    { name: "email", type: "text", label: "Email" },
    { name: "phone", type: "text", label: "Phone" },
    { name: "location", type: "text", label: "Location" },
    { name: "scheduling_url", type: "text", label: "Scheduling URL" },
    { name: "confirmation_message", type: "textarea", label: "Confirmation Message" },
  ],
  custom: [
    { name: "eyebrow", type: "text", label: "Eyebrow" },
    { name: "header", type: "text", label: "Header" },
    { name: "subheader", type: "text", label: "Subheader" },
    { name: "paragraphs", type: "array_string", label: "Paragraphs" },
  ],
};

export function getContentSchema(sectionType) {
  return CONTENT_SCHEMAS[sectionType] || CONTENT_SCHEMAS.custom;
}
