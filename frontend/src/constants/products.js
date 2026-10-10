// Bretton's products and services (KTS Guides catalog, checked against live Stripe and
// Gumroad on 2026-10-09). Prices are one-time, USD. Edit here to change the carousel.
export const PRODUCTS = [
  {
    id: "workflow-toolkit", name: "Workflow Mapping & SOP Toolkit", price: "$18", kind: "Digital kit",
    summary: "Turn any process into a diagram and a document someone new could follow, without you in the room.",
    details: [
      "7-page PDF: a four-step method, a diagram picker, three diagram templates, a worked onboarding example, an interview question bank and a fillable SOP template.",
      "The SOP template, question bank and diagram guide as an editable Excel workbook.",
      "For small business owners, operations leads, and anyone who is the only person who knows how something works.",
    ],
    href: "https://ktsguides.gumroad.com/l/workflow", cta: "Buy on Gumroad",
  },
  {
    id: "pmp-bank", name: "PMP Practice Question Bank", price: "$20", kind: "Digital kit",
    summary: "500 original scenario questions on the 2026 PMP exam outline, each with a short explanation of why the best answer wins.",
    details: [
      "Print-ready 102-page PDF with the answer key at the back, plus an Excel version you can filter by domain, task and approach.",
      "Matches the outline weights across all 26 tasks, in predictive, agile and hybrid approaches, with calculations worked out.",
      "Not affiliated with or endorsed by PMI. Contains no real exam questions. No guarantee of exam results.",
    ],
    href: "https://ktsguides.gumroad.com/l/pmp", cta: "Buy on Gumroad",
  },
  {
    id: "test-plan-kit", name: "The Test Plan Kit", price: "$29", kind: "Digital kit",
    summary: "A 6-page guide with worked examples plus an Excel tracker that calls GO or NO-GO from your own release rules.",
    details: [
      "Worked examples: test strategy map, test plan, test cases, defect report and release gate.",
      "Emailed within 1 business day of purchase.",
    ],
    href: "https://buy.stripe.com/14A6oHcJR14R4uBb8Dbo40a", cta: "Buy",
  },
  {
    id: "quick-look", name: "Process Quick-Look", price: "$47", kind: "Service · 30 min",
    summary: "Thirty minutes mapping one slow workflow live, then the three fixes to make first.",
    details: [
      "A one-page summary with the 3 fixes to make first, within 2 business days.",
      "After paying, book your 30 minutes and reply to the receipt describing the process.",
    ],
    href: "https://buy.stripe.com/8x2fZh6lt5l7bX3gsXbo409", cta: "Book",
  },
  {
    id: "pmp-session", name: "PMP Study Plan Session", price: "$97", kind: "Service · 45 min 1:1",
    summary: "A personal PMP study plan from a PMP-certified program leader.",
    details: [
      "45 minutes 1:1: a study plan, exam-day strategy and what to practice first.",
      "After paying, book your session and send your target exam date and study materials so far.",
    ],
    href: "https://buy.stripe.com/eVqdR96lteVH4uB90vbo408", cta: "Book",
  },
  {
    id: "a11y-audit", name: "Accessibility Quick Audit", price: "$197", kind: "Service · WCAG 2.2 AA",
    summary: "One page or flow checked against WCAG 2.2 AA, with plain-language findings and fixes.",
    details: [
      "Each finding has a priority and a fix, delivered in 5 business days, plus a second look after you fix them.",
      "A findings report, not a legal opinion or certification.",
    ],
    href: "https://buy.stripe.com/7sYbJ1dNV14R4uBdgLbo40b", cta: "Book",
  },
  {
    id: "workflow-snapshot", name: "Workflow Snapshot", price: "$397", kind: "Service · 45 min",
    summary: "A walkthrough of one process, a current-state map, and the three fixes to make first, in writing.",
    details: [
      "45-minute walkthrough, current-state process map and written recommendations.",
      "Full refund if it isn't useful.",
    ],
    href: "https://buy.stripe.com/3cI3cv9xF9Bn5yF2C7bo405", cta: "Book",
  },
  {
    id: "map-and-fix", name: "Process Map & Fix", price: "$750 deposit", kind: "Project",
    summary: "Current and future-state process maps, an entity diagram, an SOP and an implementation plan.",
    details: [
      "The deposit starts the engagement; the balance is due on delivery.",
      "After paying, book a kickoff and complete the intake form.",
    ],
    href: "https://buy.stripe.com/eVqdR939h4h36CJ1y3bo407", cta: "Start",
  },
];
