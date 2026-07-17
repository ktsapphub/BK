import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

// Auto-links any email address found in a line of text (e.g. the {{contact_email}}
// placeholder once substituted) without needing raw HTML in the CMS field.
function renderWithMailto(text) {
  const parts = text.split(EMAIL_RE);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={`mailto:${part}`} className="focus-ring underline hover:text-[var(--surface-blue)]">
        {part}
      </a>
    ) : (
      part
    )
  );
}

// Lightweight markdown-lite parser for the CMS-editable privacy policy field:
// "## Heading" starts a new section, blank lines separate paragraphs, and
// consecutive "- " lines become a bullet list. Kept intentionally simple so
// the site owner can edit everything from a single textarea in Settings.
function parsePolicyContent(raw, contactEmail) {
  const text = (raw || "").replace(/\{\{\s*contact_email\s*\}\}/g, contactEmail);
  const lines = text.split("\n");
  const blocks = [];
  let current = { heading: null, content: [] };

  lines.forEach((line) => {
    if (line.startsWith("## ")) {
      if (current.heading || current.content.length) blocks.push(current);
      current = { heading: line.slice(3).trim(), content: [] };
    } else {
      current.content.push(line);
    }
  });
  blocks.push(current);

  return blocks
    .filter((b) => b.heading || b.content.some((l) => l.trim()))
    .map((block) => {
      const groups = [];
      let buffer = [];
      let mode = null;
      const flush = () => {
        if (buffer.length) groups.push({ type: mode, lines: buffer });
        buffer = [];
      };
      block.content.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          flush();
          mode = null;
          return;
        }
        const isBullet = trimmed.startsWith("- ");
        const lineMode = isBullet ? "ul" : "p";
        if (mode && mode !== lineMode) flush();
        mode = lineMode;
        buffer.push(isBullet ? trimmed.slice(2) : trimmed);
      });
      flush();
      return { heading: block.heading, groups };
    });
}

export default function PrivacyPolicy() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.getGlobalSettings().then(setSettings).catch(() => {});
  }, []);

  const contactEmail = settings?.contact_email || "brettonjkey@icloud.com";
  const updatedDate = settings?.privacy_policy_updated_date || "";
  const blocks = parsePolicyContent(settings?.privacy_policy_content, contactEmail);

  return (
    <div className="min-h-screen bg-[var(--background-primary)] text-[var(--text-primary)]" data-testid="privacy-policy-page">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-16 md:py-24">
        <Link to="/" data-testid="privacy-back-link" className="focus-ring inline-flex items-center gap-2 font-display text-xs uppercase tracking-wide text-[var(--text-muted)] hover:text-[var(--surface-blue)] mb-10">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">Privacy Policy</h1>
        {updatedDate && <p className="font-body text-sm opacity-60 mb-12" data-testid="privacy-updated-date">Last updated: {updatedDate}</p>}

        {settings === null ? (
          <p className="text-sm opacity-60">Loading…</p>
        ) : blocks.length === 0 ? (
          <p className="text-sm opacity-60">The privacy policy has not been added yet.</p>
        ) : (
          <div className="space-y-10 font-body text-sm md:text-base leading-relaxed opacity-90" data-testid="privacy-policy-content">
            {blocks.map((block, i) => (
              <section key={i}>
                {block.heading && <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">{block.heading}</h2>}
                {block.groups.map((g, gi) =>
                  g.type === "ul" ? (
                    <ul key={gi} className="list-disc pl-5 space-y-1.5 mb-3">
                      {g.lines.map((l, li) => (
                        <li key={li}>{renderWithMailto(l)}</li>
                      ))}
                    </ul>
                  ) : (
                    g.lines.map((l, li) => (
                      <p key={li} className="mb-3">
                        {renderWithMailto(l)}
                      </p>
                    ))
                  )
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
