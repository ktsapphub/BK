export default function SiteFooter({ settings }) {
  if (!settings) return null;
  return (
    <footer className="bg-[var(--surface-blue-dark)] text-[var(--text-on-blue-muted)] py-10" data-testid="site-footer">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-body text-xs">{settings.footer_text}</p>
        <div className="flex items-center gap-5">
          {settings.social_instagram && (
            <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="focus-ring font-display text-xs uppercase tracking-wide hover:text-white">Instagram</a>
          )}
          {settings.social_threads && (
            <a href={settings.social_threads} target="_blank" rel="noopener noreferrer" className="focus-ring font-display text-xs uppercase tracking-wide hover:text-white">Threads</a>
          )}
          {settings.social_linkedin && (
            <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="focus-ring font-display text-xs uppercase tracking-wide hover:text-white">LinkedIn</a>
          )}
        </div>
      </div>
    </footer>
  );
}
