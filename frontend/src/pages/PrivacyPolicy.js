import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.getGlobalSettings().then(setSettings).catch(() => {});
  }, []);

  const contactEmail = settings?.contact_email || "brettonjkey@icloud.com";
  const siteTitle = settings?.site_title || "Bretton J. Key";

  return (
    <div className="min-h-screen bg-[var(--background-primary)] text-[var(--text-primary)]" data-testid="privacy-policy-page">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-16 md:py-24">
        <Link to="/" data-testid="privacy-back-link" className="focus-ring inline-flex items-center gap-2 font-display text-xs uppercase tracking-wide text-[var(--text-muted)] hover:text-[var(--surface-blue)] mb-10">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">Privacy Policy</h1>
        <p className="font-body text-sm opacity-60 mb-12">Last updated: January 2026</p>

        <div className="space-y-10 font-body text-sm md:text-base leading-relaxed opacity-90">
          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">Overview</h2>
            <p>
              This Privacy Policy explains how {siteTitle} ("I", "me", or "my") collects, uses, and protects information you
              provide through this website, including through the "Let's Connect" form and any other inquiry or newsletter
              sign-up forms on this site.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">Information I Collect</h2>
            <p className="mb-3">When you submit an inquiry or sign up for updates, I may collect:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your name, email address, and phone number (if provided)</li>
              <li>The reason for your inquiry and any related details you choose to share (e.g., project type, event details, message content)</li>
              <li>Your consent choices and the exact consent wording and version you agreed to, along with the date/time of consent</li>
              <li>Your preferred contact method</li>
              <li>The page or section of the site you submitted the form from</li>
              <li>Basic technical information used for spam and abuse prevention (e.g., submission timing)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">How Your Information Is Used</h2>
            <p className="mb-3">Information submitted through this site is used only to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Respond to your inquiry by email, phone call, or text message, according to the consent you provide</li>
              <li>Keep a record of communications related to your request</li>
              <li>Send occasional updates about projects, applications, services, and events — only if you separately opt in to marketing communications</li>
              <li>Maintain the security and integrity of this website (e.g., preventing spam submissions)</li>
            </ul>
            <p className="mt-3">Your information is never sold, rented, or shared with third parties for their own marketing purposes.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">Contact Methods &amp; Consent</h2>
            <p>
              I will only contact you by email, phone call, or text message regarding a specific inquiry if you have checked the
              required consent box on the relevant form. Consent for marketing updates is always separate, optional, and
              unchecked by default. You may withdraw consent, or ask not to be contacted by phone or text, at any time by
              replying to any message from me or by emailing{" "}
              <a href={`mailto:${contactEmail}`} className="focus-ring underline hover:text-[var(--surface-blue)]">
                {contactEmail}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">Data Retention</h2>
            <p>
              Inquiry and consent records are retained for as long as reasonably necessary to respond to your request, maintain
              accurate business records, and comply with legal obligations. If you request deletion (see below), your record will
              be removed unless retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">Your Rights</h2>
            <p className="mb-3">You may, at any time, request to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access the personal information I hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Delete your information from my records</li>
              <li>Opt out of marketing communications while still allowing responses to an active inquiry</li>
            </ul>
            <p className="mt-3">
              To make a request, email{" "}
              <a href={`mailto:${contactEmail}`} className="focus-ring underline hover:text-[var(--surface-blue)]">
                {contactEmail}
              </a>{" "}
              and I will respond as promptly as possible.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">Security</h2>
            <p>
              Reasonable technical and organizational measures are used to protect the information you share, including secure
              storage and rate-limiting/spam protection on all public forms. No method of transmission or storage is 100% secure,
              but I take reasonable steps to safeguard your information.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">Changes to This Policy</h2>
            <p>
              This policy may be updated occasionally. Material changes to how consent is worded will result in a new consent
              version being introduced for future submissions; prior consent records are never altered retroactively.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg mb-2 text-[var(--text-primary)]">Contact</h2>
            <p>
              Questions about this policy can be directed to{" "}
              <a href={`mailto:${contactEmail}`} className="focus-ring underline hover:text-[var(--surface-blue)]">
                {contactEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
