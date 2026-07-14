{
  "project": {
    "name": "Bretton J. Key — Cinematic CMS-driven Personal Site",
    "app_type": "hybrid_fullstack",
    "audience": [
      "prospective clients/employers",
      "professional network/recruiters",
      "conference/mentorship audiences",
      "Bretton as sole CMS admin"
    ],
    "north_star": "Feels like walking through a sequence of gallery rooms (cinematic/editorial), not a scrolling resume template."
  },
  "brand_attributes": {
    "tone": ["editorial", "cinematic", "masculine", "clean", "confident", "grounded", "service-oriented"],
    "anti_patterns": [
      "SaaS template look",
      "fraternity flyer energy",
      "default shadcn card-grid portfolio",
      "scroll-jacking",
      "continuous glow/bounce/spin",
      "long mandatory intro"
    ],
    "royal_blue_usage": {
      "meaning": "Signals Phi Beta Sigma affiliation through color + values only.",
      "rules": [
        "Never use crests/shields/Greek letters.",
        "Use royal blue only on short key phrases, labels, and accents — never full paragraphs.",
        "Prefer blue as a 'directional light' (borders, rules, focus rings, badges) rather than fills everywhere."
      ]
    }
  },
  "design_tokens": {
    "source_of_truth": "USER_CHOICES palette + typography. Do not use raw hex in components; reference CSS variables only.",
    "css_custom_properties": {
      "colors": {
        "--background-primary": "#FFFFFF",
        "--background-secondary": "#F7F9FC",
        "--background-blue-soft": "#EEF5FC",
        "--surface-blue": "#0057B8",
        "--surface-blue-dark": "#003B7A",
        "--accent-highlight": "#1677D2",
        "--text-primary": "#111827",
        "--text-secondary": "#374151",
        "--text-muted": "#6B7280",
        "--text-on-blue": "#FFFFFF",
        "--text-on-blue-muted": "rgba(255,255,255,0.78)",
        "--border-primary": "#E5E7EB",
        "--border-blue": "rgba(0,87,184,0.24)",
        "--focus-ring": "#1677D2"
      },
      "typography": {
        "--font-display": "Urbanist, ui-sans-serif, system-ui",
        "--font-body": "Lexend, ui-sans-serif, system-ui",
        "--font-editorial": "Fraunces, ui-serif, Georgia",
        "--tracking-display": "-0.02em",
        "--leading-body": "1.6"
      },
      "radii": {
        "--radius-xs": "8px",
        "--radius-sm": "10px",
        "--radius-md": "14px",
        "--radius-lg": "18px"
      },
      "shadows": {
        "--shadow-quiet": "0 1px 0 rgba(17,24,39,0.06)",
        "--shadow-room": "0 18px 50px rgba(17,24,39,0.10)",
        "--shadow-float": "0 10px 30px rgba(0,87,184,0.10)"
      },
      "spacing": {
        "--space-1": "4px",
        "--space-2": "8px",
        "--space-3": "12px",
        "--space-4": "16px",
        "--space-5": "20px",
        "--space-6": "24px",
        "--space-8": "32px",
        "--space-10": "40px",
        "--space-12": "48px",
        "--space-16": "64px",
        "--space-20": "80px",
        "--space-24": "96px"
      }
    },
    "tailwind_mapping_guidance": {
      "rule": "Use Tailwind for layout/spacing; use CSS variables for colors (e.g., bg-[var(--background-secondary)]).",
      "examples": [
        "bg-[var(--background-primary)] text-[var(--text-primary)]",
        "border border-[var(--border-primary)]",
        "ring-2 ring-[var(--focus-ring)] ring-offset-2 ring-offset-[var(--background-primary)]",
        "text-[var(--accent-highlight)] (only for short phrases)"
      ]
    },
    "strict_color_constraints": [
      "No ivory/beige/cream/brass/bronze/gold/amber/yellow tints anywhere in UI.",
      "No purple for AI/chat (not relevant here, but keep palette strict)."
    ]
  },
  "typography_system": {
    "font_pairing": {
      "headings_nav_labels_numbers": "Urbanist",
      "body_copy_forms_resume_details_articles": "Lexend",
      "pull_quotes_testimonials_founder_story_emotional_statements": "Fraunces"
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-[var(--font-display)] tracking-[var(--tracking-display)]",
      "h2": "text-base md:text-lg font-[var(--font-display)] uppercase tracking-[0.12em]",
      "h3": "text-xl md:text-2xl font-[var(--font-display)]",
      "body": "text-sm md:text-base font-[var(--font-body)] leading-[var(--leading-body)]",
      "small": "text-xs md:text-sm font-[var(--font-body)] text-[var(--text-muted)]"
    },
    "editorial_rules": [
      "Fraunces only for pull quotes/testimonials/founder-story emphasis; keep it sparse for impact.",
      "Royal blue text only for short phrases (<= 6–10 words) or numeric highlights; never full paragraphs.",
      "Use generous line breaks and max-width for reading: prose blocks max-w-[68ch]."
    ]
  },
  "layout_system": {
    "global_grid": {
      "container": "mx-auto w-full max-w-6xl px-5 sm:px-8",
      "columns": "12-col mental model; implement with CSS grid: grid-cols-12 gap-6",
      "baseline": "4px spacing increments; prefer space-y-10/12/16 for room sections",
      "room_height": "Each 'room' should feel like a scene: min-h-[85svh] with internal vertical rhythm."
    },
    "section_color_rhythm": {
      "rule": "Follow approved rhythm via background tokens + photography/masking; avoid mechanical alternation.",
      "sequence": [
        "deep blue",
        "white",
        "pale blue",
        "white",
        "soft white",
        "deep blue",
        "white",
        "pale/white",
        "deep blue",
        "white",
        "soft/pale",
        "blue-to-white"
      ],
      "implementation": {
        "deep_blue_room": "bg-[var(--surface-blue-dark)] text-[var(--text-on-blue)]",
        "white_room": "bg-[var(--background-primary)] text-[var(--text-primary)]",
        "pale_blue_room": "bg-[var(--background-blue-soft)] text-[var(--text-primary)]",
        "soft_white_room": "bg-[var(--background-secondary)] text-[var(--text-primary)]",
        "blue_to_white": "Allowed only as a section background overlay (<=20% viewport) using subtle mask/gradient; never on text blocks."
      }
    },
    "room_choreography": {
      "concept": "Rooms are discrete scenes with a threshold (doorway) and a focal object (hero image, quote, timeline, case study).",
      "threshold_patterns": [
        "Doorway reveal: content enters through a vertical mask from center",
        "Curtain reveal: two panels slide apart",
        "Spotlight reveal: radial mask reveals image/quote",
        "Editorial page turn: subtle skew + shadow + clip-path"
      ],
      "navigation": {
        "type": "Section-based nav that only shows visible published rooms",
        "behavior": [
          "Sticky left rail on desktop (room index + current room label)",
          "Bottom sheet nav on mobile (Drawer) with room list",
          "Deep links per room: /#room-values etc",
          "Scroll restoration + back/forward supported"
        ]
      }
    }
  },
  "public_site_components": {
    "principle": "Public site uses custom editorial components (avoid default shadcn card-grid look). Use shadcn primitives only where they disappear (Dialog, Sheet, Tabs, Accordion, Carousel, Tooltip).",
    "component_path": {
      "shadcn_primitives": [
        "/app/frontend/src/components/ui/dialog.jsx",
        "/app/frontend/src/components/ui/sheet.jsx",
        "/app/frontend/src/components/ui/tabs.jsx",
        "/app/frontend/src/components/ui/accordion.jsx",
        "/app/frontend/src/components/ui/carousel.jsx",
        "/app/frontend/src/components/ui/tooltip.jsx",
        "/app/frontend/src/components/ui/badge.jsx",
        "/app/frontend/src/components/ui/button.jsx",
        "/app/frontend/src/components/ui/separator.jsx",
        "/app/frontend/src/components/ui/scroll-area.jsx"
      ]
    },
    "section_type_layouts": {
      "hero": {
        "layout": "Full-bleed cinematic frame with letterbox bars (top/bottom) + rotating words. Left-aligned copy; right-side portrait or abstract gallery frame.",
        "structure": [
          "Top: minimal nav + room index",
          "Center: H1 + rotating word (Urbanist) + short blue phrase",
          "Bottom: 'Skip intro' + scroll cue + current availability badge"
        ],
        "empty_state": "If hero media missing, fallback to typographic hero with subtle noise background and a thin blue rule.",
        "data_testids": [
          "hero-rotating-words",
          "hero-skip-intro-button",
          "hero-primary-cta-button"
        ]
      },
      "introduction": {
        "layout": "Editorial two-column: left is a short manifesto; right is a 'service in motion' metric stack.",
        "empty_state": "If metrics missing, show 2–3 placeholder skeleton rows (Skeleton) and hide labels.",
        "data_testids": ["intro-manifesto", "intro-metrics"]
      },
      "values": {
        "layout": "Values as 'museum labels': vertical list with numbered markers + short descriptions; optional hover reveals a longer note.",
        "interaction": "Hover/focus reveals a side note panel (Collapsible) with a soft focus reveal.",
        "empty_state": "If no values, hide room from nav (CMS published rooms only).",
        "data_testids": ["values-list"]
      },
      "founder_story": {
        "layout": "Narrative with image sequence: pinned image column (GSAP ScrollTrigger) + flowing text chapters.",
        "interaction": "As user scrolls chapters, image crossfades with mask reveal; reduced-motion uses simple fade.",
        "empty_state": "If images missing, render chapters as typographic story with Fraunces pull quotes.",
        "data_testids": ["founder-story-room", "founder-story-chapter"]
      },
      "resume": {
        "layout": "Interactive timeline: left rail years; right panel details. Desktop: split; mobile: accordion timeline.",
        "interaction": "Click year -> panel swaps with doorway reveal; keyboard accessible.",
        "empty_state": "If entries missing, show 'Résumé currently being curated' + contact CTA.",
        "data_testids": ["resume-timeline", "resume-entry"]
      },
      "services": {
        "layout": "Services as 'capability dossiers': each service opens a full-screen Sheet with capabilities, outcomes, process.",
        "interaction": "Hover on service title reveals a thin blue underline that animates left-to-right.",
        "empty_state": "If no services, show a single 'Consulting by request' CTA.",
        "data_testids": ["services-list", "service-open-sheet-button"]
      },
      "projects": {
        "listing_layout": "Editorial list (not cards): each row is a project title + status badge + one-line thesis + right-aligned year.",
        "detail_layout": "Case study page: hero frame + sections (Problem, Approach, Outcome, Artifacts).",
        "status_badges": ["Live", "In Development", "Concept", "Archived", "Private", "Case Study Available"],
        "empty_state": "If no projects, show 'Work archive is being prepared' + link to contact.",
        "data_testids": ["projects-list", "project-status-badge", "project-open-detail-link"]
      },
      "thoughts": {
        "listing_layout": "Article index with filters (topic, year) + reading time; typography-forward.",
        "reader_layout": "Article reader with max-w-[68ch], sticky progress indicator (Progress), and footnotes.",
        "empty_state": "If no articles, show 'Notes in progress' + newsletter/contact CTA.",
        "data_testids": ["thoughts-list", "article-reader"]
      },
      "testimonials": {
        "layout": "Fraunces pull-quote wall: one quote at a time (Carousel) with portrait + verification tag.",
        "interaction": "Soft focus reveal on quote change; no autoplay.",
        "empty_state": "If none, hide room.",
        "data_testids": ["testimonials-carousel", "testimonial-quote"]
      },
      "media_impact": {
        "layout": "Media/impact log distinct from testimonials: rows with type (podcast/video/article), outlet, title, date.",
        "interaction": "Dialog opens embedded media; lazy-load iframe only when opened.",
        "empty_state": "If none, hide room.",
        "data_testids": ["media-impact-list", "media-impact-open-dialog"]
      },
      "personal": {
        "layout": "Personal/values section: quiet white room with a single strong Fraunces line + supporting bullets.",
        "empty_state": "If missing, hide room.",
        "data_testids": ["personal-room"]
      },
      "gallery": {
        "layout": "Gallery as film-strip: horizontal scroll area (ScrollArea) with lightbox (Dialog).",
        "interaction": "Click image -> Dialog lightbox with next/prev; keyboard arrows supported.",
        "empty_state": "If no images, hide room.",
        "data_testids": ["gallery-strip", "gallery-lightbox"]
      },
      "contact": {
        "layout": "Split: left is scheduling link + availability; right is form.",
        "interaction": "Form uses shadcn Input/Textarea; submit shows Sonner toast.",
        "empty_state": "If scheduling link missing, show form only.",
        "data_testids": ["contact-form", "contact-submit-button", "contact-scheduling-link"]
      },
      "custom": {
        "layout": "CMS-defined blocks rendered via a safe component registry; unknown blocks render a neutral 'Unsupported section type' message in admin only.",
        "data_testids": ["custom-room"]
      }
    }
  },
  "admin_cms_design": {
    "goal": "Clean, utilitarian, efficient for one admin. Uses same tokens for consistency but avoids cinematic theatrics.",
    "layout": {
      "shell": "Left sidebar (NavigationMenu) + top bar (search, preview, user) + main content.",
      "density": "Higher information density than public site; smaller paddings; minimal motion.",
      "pages": {
        "login": "Centered panel, strong Urbanist heading, Lexend body, single primary button.",
        "dashboard": "Quick stats + recent edits + inquiries inbox preview.",
        "section_editor": "Tabs: Editor / History / Settings. Drag reorder list with clear drop indicator.",
        "media_library": "Grid with AspectRatio thumbnails + Dialog preview + delete confirm.",
        "crud": "Table-based lists with filters, pagination, and row actions.",
        "version_history": "Dialog or right-side Sheet with version list + preview + rollback confirm."
      }
    },
    "shadcn_components_to_use": {
      "forms": ["form.jsx", "input.jsx", "textarea.jsx", "select.jsx", "checkbox.jsx", "switch.jsx", "label.jsx"],
      "structure": ["tabs.jsx", "table.jsx", "pagination.jsx", "breadcrumb.jsx", "separator.jsx", "scroll-area.jsx"],
      "overlays": ["dialog.jsx", "alert-dialog.jsx", "sheet.jsx", "popover.jsx", "tooltip.jsx"],
      "feedback": ["sonner.jsx", "progress.jsx", "skeleton.jsx", "badge.jsx"]
    },
    "data_testids": {
      "login": ["admin-login-form", "admin-login-submit-button"],
      "nav": ["admin-sidebar-nav", "admin-topbar-search"],
      "editor": ["admin-section-reorder-list", "admin-section-publish-toggle", "admin-version-history-open"],
      "media": ["admin-media-upload-button", "admin-media-delete-button"],
      "inquiries": ["admin-inquiries-table"]
    }
  },
  "motion_and_transitions": {
    "approved_transition_styles": [
      "fade",
      "slide",
      "mask reveal",
      "curtain reveal",
      "doorway reveal",
      "spotlight reveal",
      "depth transition",
      "editorial page turn",
      "soft focus reveal",
      "none"
    ],
    "mapping_guidance": {
      "hero": ["mask reveal", "soft focus reveal"],
      "room_entry": ["doorway reveal", "curtain reveal", "fade"],
      "timeline_panel_swap": ["doorway reveal", "slide"],
      "gallery_lightbox": ["depth transition", "fade"],
      "article_reader": ["none", "fade"],
      "admin": ["fade", "none"]
    },
    "implementation_notes": {
      "framer_motion": {
        "use_for": ["component entrance", "panel swaps", "presence animations"],
        "pattern": "Use <AnimatePresence mode='wait'> with variants controlling opacity/transform only.",
        "reduced_motion": "Use useReducedMotion() to switch to minimal opacity-only transitions."
      },
      "gsap_scrolltrigger": {
        "use_for": ["pinned founder story image sequence", "mask reveals tied to scroll"],
        "pattern": "Pin the media column; animate clipPath/maskPosition with scrub so scroll remains user-controlled.",
        "performance": [
          "Lazy-load images",
          "Pause off-screen animations via IntersectionObserver",
          "Avoid heavy blur filters on large areas"
        ]
      },
      "lenis": {
        "rule": "Smooth scroll allowed but never trap scroll; ensure skip-intro and deep links still work.",
        "scroll_restoration": "Maintain scroll restoration with React Router + manual restoration when Lenis enabled."
      }
    },
    "skip_intro": {
      "behavior": [
        "Always visible in hero",
        "Skips to first published room after hero",
        "Sets a session flag so intro animations are reduced on return"
      ],
      "data_testid": "hero-skip-intro-button"
    }
  },
  "imagery_and_texture": {
    "treatment": {
      "cinematic_depth": [
        "Use letterbox bars (solid) to frame hero media",
        "Use subtle noise overlay (CSS) on backgrounds",
        "Use blue as edge-light: thin borders, rules, focus rings",
        "Use duotone-like feel via overlay layers using --surface-blue-dark at low opacity (no warm tints)"
      ],
      "masking": [
        "Prefer clip-path polygons and soft radial masks for reveals",
        "Avoid heavy gradients; if used, keep to section background overlays <=20% viewport"
      ]
    },
    "image_urls": {
      "hero_portrait_options": [
        {
          "url": "https://images.unsplash.com/photo-1610527271230-8395d6fa5ec3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHxjaW5lbWF0aWMlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMGJsdWUlMjBzdWl0JTIwZWRpdG9yaWFsfGVufDB8fHxibHVlfDE3ODQwNTgwMDd8MA&ixlib=rb-4.1.0&q=85",
          "description": "Cinematic professional portrait with cool blue tones (hero/right frame)."
        },
        {
          "url": "https://images.unsplash.com/photo-1718951872939-eabdce9ebd20?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHw0fHxjaW5lbWF0aWMlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMGJsdWUlMjBzdWl0JTIwZWRpdG9yaWFsfGVufDB8fHxibHVlfDE3ODQwNTgwMDd8MA&ixlib=rb-4.1.0&q=85",
          "description": "Editorial suit portrait; works well behind a doorway mask reveal."
        }
      ],
      "gallery_room_reference": [
        {
          "url": "https://images.unsplash.com/photo-1627216661719-6d85c225bfab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBnYWxsZXJ5JTIwaW50ZXJpb3IlMjBjaW5lbWF0aWMlMjBibHVlJTIwbGlnaHR8ZW58MHx8fGJsdWV8MTc4NDA1ODAxMnww&ixlib=rb-4.1.0&q=85",
          "description": "Minimal gallery corridor reference for 'rooms' metaphor (use as optional background/texture)."
        }
      ],
      "texture_noise_options": [
        {
          "url": "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxlZGl0b3JpYWwlMjB0ZXh0dXJlJTIwZ3JhaW4lMjBwYXBlciUyMGNsb3NlJTIwdXB8ZW58MHx8fGJsYWNrX2FuZF93aGl0ZXwxNzg0MDU4MDIxfDA&ixlib=rb-4.1.0&q=85",
          "description": "Subtle paper/plaster texture; use as low-opacity overlay for editorial depth."
        }
      ]
    }
  },
  "accessibility_and_states": {
    "focus": {
      "rule": "All interactive elements must have visible focus ring using --focus-ring.",
      "tailwind": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-primary)]"
    },
    "reduced_motion": {
      "rule": "Every transition style must have reduced-motion fallback (brief fade, preserve content order).",
      "implementation": "Use prefers-reduced-motion + Framer Motion useReducedMotion; disable ScrollTrigger pinning and use simple fades."
    },
    "empty_states": {
      "rule": "CMS-driven: if required fields missing, hide room from nav and render a graceful placeholder only if the room is explicitly published.",
      "patterns": [
        "Skeleton for loading",
        "Muted copy + CTA for empty lists",
        "No broken media frames"
      ]
    },
    "testing": {
      "rule": "All interactive and key informational elements MUST include data-testid (kebab-case, role-based).",
      "examples": [
        "data-testid='projects-list'",
        "data-testid='project-open-detail-link'",
        "data-testid='admin-section-publish-toggle'",
        "data-testid='contact-submit-button'"
      ]
    }
  },
  "libraries_and_scaffolds": {
    "required": ["framer-motion", "gsap", "gsap/ScrollTrigger", "@studio-freight/lenis"],
    "optional": ["react-intersection-observer (or custom IntersectionObserver)", "react-hook-form (admin forms)", "zod (optional validation)"] ,
    "installation_notes": {
      "gsap": "npm i gsap",
      "framer_motion": "npm i framer-motion",
      "lenis": "npm i @studio-freight/lenis"
    },
    "js_scaffolds": {
      "doorway_reveal_variant": "// Framer Motion variants (JS)\nexport const doorwayReveal = {\n  hidden: { opacity: 0, clipPath: 'inset(0 48% 0 48% round 16px)', y: 12 },\n  show: { opacity: 1, clipPath: 'inset(0 0% 0 0% round 16px)', y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },\n  exit: { opacity: 0, clipPath: 'inset(0 48% 0 48% round 16px)', y: -8, transition: { duration: 0.35 } }\n};\n",
      "scrolltrigger_pinned_image_sequence": "// GSAP ScrollTrigger pinned media column (JS)\nimport gsap from 'gsap';\nimport { ScrollTrigger } from 'gsap/ScrollTrigger';\n\ngsap.registerPlugin(ScrollTrigger);\n\nexport function initPinnedSequence({ pinEl, panels }) {\n  const ctx = gsap.context(() => {\n    panels.forEach((panel, i) => {\n      gsap.fromTo(panel,\n        { autoAlpha: i === 0 ? 1 : 0 },\n        {\n          autoAlpha: 1,\n          scrollTrigger: {\n            trigger: panel,\n            start: 'top center',\n            end: 'bottom center',\n            scrub: true\n          }\n        }\n      );\n    });\n\n    ScrollTrigger.create({\n      trigger: pinEl,\n      start: 'top top',\n      end: 'bottom bottom',\n      pin: true,\n      pinSpacing: true\n    });\n  }, pinEl);\n\n  return () => ctx.revert();\n}\n"
    }
  },
  "instructions_to_main_agent": [
    "Replace default CRA App.css styles; do not keep spinning logo animation. Ensure no centered .App text alignment.",
    "In index.css, override shadcn :root tokens to map to USER_CHOICES palette variables (keep shadcn variables but set them from the provided tokens).",
    "Load Google Fonts: Urbanist, Lexend, Fraunces (weights: 300–800 as needed).",
    "Public site: build a 'RoomRenderer' that renders ordered CMS sections; nav only lists published/visible rooms.",
    "Implement transitions per-room using approved transition_style; always provide reduced-motion fallback.",
    "Admin: use shadcn components heavily; keep motion minimal; prioritize speed and clarity.",
    "Every interactive/key info element must include data-testid in kebab-case."
  ]
}

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
