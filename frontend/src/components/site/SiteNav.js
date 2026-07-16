import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Briefcase, Download, Linkedin, CalendarClock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { scrollToElement } from "@/lib/lenisSingleton";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { openCalendlyPopup } from "@/lib/calendly";

// Minimal floating site navigation.
// - Desktop: vertical chapter-index edge rail + progress line (left), and a
//   persistent quick-actions capsule (top-right) that stays available at all
//   scroll depths.
// - Mobile: hamburger trigger opens an accessible right-side drawer with
//   large tap targets, a visible close control, and the same quick actions.
// - Colors automatically adapt to the theme (light/dark) of whichever room
//   is currently in view, read from each room's `data-theme-dark` attribute.
export default function SiteNav({ navItems, sections, settings }) {
  const [activeId, setActiveId] = useState(null);
  const [activeDark, setActiveDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemRefs = useRef({});
  const progress = useScrollProgress();

  useEffect(() => {
    if (!navItems?.length) return;
    const ids = navItems.map((n) => n.section_id).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            setActiveDark(entry.target.getAttribute("data-theme-dark") === "true");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [navItems]);

  const goTo = useCallback((id) => {
    scrollToElement(id);
    if (window.history?.replaceState) window.history.replaceState(null, "", `#${id}`);
    setMobileOpen(false);
  }, []);

  const handleRailKeyDown = (e, idx) => {
    if (!navItems?.length) return;
    const focusItem = (i) => itemRefs.current[navItems[i]?.section_id]?.focus();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem((idx + 1) % navItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem((idx - 1 + navItems.length) % navItems.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(navItems.length - 1);
    }
  };

  const persistentActions = useMemo(() => {
    const list = [];
    const projectsSection = sections?.find((s) => s.section_type === "projects");
    if (projectsSection) {
      list.push({
        key: "view-work",
        label: "View Work",
        icon: Briefcase,
        href: `#${projectsSection.id}`,
        onClick: (e) => {
          e.preventDefault();
          goTo(projectsSection.id);
        },
      });
    }
    if (settings?.resume_pdf_url) {
      list.push({ key: "download-resume", label: "Download Résumé", icon: Download, href: settings.resume_pdf_url, external: true });
    }
    if (settings?.social_linkedin) {
      list.push({ key: "connect-linkedin", label: "Connect on LinkedIn", icon: Linkedin, href: settings.social_linkedin, external: true });
    }
    if (settings?.scheduling_url) {
      list.push({
        key: "schedule-call",
        label: "Schedule a Conversation",
        icon: CalendarClock,
        href: settings.scheduling_url,
        onClick: (e) => {
          e.preventDefault();
          openCalendlyPopup({
            baseUrl: settings.scheduling_url,
            utm: { utm_source: "NavBar", utm_medium: "cta", utm_campaign: "Site_Wide", utm_content: "schedule_a_conversation" },
          });
        },
      });
    }
    return list;
  }, [sections, settings, goTo]);

  if (!navItems?.length) return null;

  return (
    <>
      {/* Site brand mark — logo image if configured via Admin > Appearance, else site title text */}
      <a
        href="#hero"
        onClick={(e) => {
          e.preventDefault();
          goTo(navItems[0]?.section_id || "hero");
        }}
        data-testid="site-header-brand"
        aria-label={settings?.site_title ? `${settings.site_title} — back to top` : "Back to top"}
        className="focus-ring fixed left-6 top-6 z-40 flex items-center gap-2"
      >
        {settings?.site_logo_url ? (
          <img src={settings.site_logo_url} alt={settings?.site_title || "Site logo"} className="h-9 w-auto max-w-[160px] object-contain" />
        ) : settings?.site_title ? (
          <span className={`font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors duration-300 ${activeDark ? "text-white" : "text-[var(--text-primary)]"}`}>
            {settings.site_title}
          </span>
        ) : null}
      </a>

      {/* Desktop: vertical chapter index + edge rail progress line */}
      <div className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-40">
        <div className="relative pl-4">
          <div
            aria-hidden="true"
            className={`absolute inset-y-0 left-0 w-[2px] rounded-full transition-colors duration-300 ${
              activeDark ? "bg-white/15" : "bg-[var(--border-blue)]"
            }`}
          />
          <motion.div
            aria-hidden="true"
            className={`absolute left-0 top-0 w-[2px] rounded-full transition-colors duration-300 ${
              activeDark ? "bg-white/80" : "bg-[var(--surface-blue)]"
            }`}
            style={{ height: `${Math.round(progress * 100)}%` }}
            data-testid="site-nav-progress-line"
          />
          <nav data-testid="site-desktop-nav" aria-label="Room navigation" className="flex flex-col gap-3.5">
            {navItems.map((item, idx) => {
              const isActive = activeId === item.section_id;
              return (
                <a
                  key={item.id}
                  ref={(el) => (itemRefs.current[item.section_id] = el)}
                  href={`#${item.section_id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(item.section_id);
                  }}
                  onKeyDown={(e) => handleRailKeyDown(e, idx)}
                  data-testid="site-nav-item"
                  aria-current={isActive ? "true" : undefined}
                  className="focus-ring group relative flex items-center gap-3.5 py-0.5"
                >
                  <span
                    className={`relative h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300 ${
                      isActive
                        ? activeDark
                          ? "bg-white scale-[1.4]"
                          : "bg-[var(--surface-blue)] scale-[1.4]"
                        : activeDark
                        ? "bg-white/35 group-hover:bg-white/70"
                        : "bg-[var(--border-primary)] group-hover:bg-[var(--accent-highlight)]"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="site-nav-active-marker"
                        className={`absolute -inset-1 rounded-full border ${
                          activeDark ? "border-white/50" : "border-[var(--surface-blue)]/50"
                        }`}
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                  </span>
                  <span
                    className={`relative font-display text-[11px] uppercase tracking-[0.08em] whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? `${activeDark ? "text-white" : "text-[var(--surface-blue)]"} font-semibold translate-x-0.5 opacity-100`
                        : `${activeDark ? "text-white/55" : "text-[var(--text-muted)]"} font-normal opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-1 left-0 h-px rounded-full transition-all duration-300 ${isActive ? "w-full" : "w-0"} ${
                        activeDark ? "bg-white" : "bg-[var(--surface-blue)]"
                      }`}
                    />
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop: persistent quick-actions capsule */}
      {persistentActions.length > 0 && (
        <TooltipProvider delayDuration={200}>
          <div
            role="group"
            aria-label="Quick actions"
            data-testid="site-quick-actions"
            className={`hidden lg:flex fixed top-6 right-6 z-40 items-center gap-1.5 rounded-full backdrop-blur-md px-2 py-2 shadow-[var(--shadow-float)] border transition-colors duration-300 ${
              activeDark ? "bg-white/10 border-white/15" : "bg-[var(--background-primary)]/90 border-[var(--border-primary)]"
            }`}
          >
            {persistentActions.map((action) => (
              <Tooltip key={action.key}>
                <TooltipTrigger asChild>
                  <a
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    onClick={action.onClick}
                    aria-label={action.label}
                    data-testid={`site-quick-action-${action.key}`}
                    className={`focus-ring flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      activeDark ? "text-white hover:bg-white/15" : "text-[var(--text-primary)] hover:bg-[var(--background-blue-soft)]"
                    }`}
                  >
                    <action.icon className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom">{action.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      )}

      {/* Mobile: hamburger trigger + accessible drawer */}
      <div className="lg:hidden fixed top-4 right-4 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              data-testid="site-mobile-nav-trigger"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="focus-ring h-11 w-11 rounded-full bg-[var(--surface-blue-dark)] text-white flex items-center justify-center shadow-[var(--shadow-float)]"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            data-testid="site-mobile-nav-drawer"
            className="bg-[var(--background-primary)] text-[var(--text-primary)] w-[86vw] max-w-sm p-0 flex flex-col gap-0"
          >
            <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border-primary)]">
              <span className="font-display text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Navigate</span>
              <SheetClose asChild>
                <button
                  data-testid="site-mobile-nav-close-button"
                  aria-label="Close navigation menu"
                  className="focus-ring h-9 w-9 rounded-full flex items-center justify-center hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </SheetClose>
            </div>

            <nav aria-label="Room navigation" data-testid="site-mobile-nav-list" className="flex-1 overflow-y-auto px-2 py-3">
              {navItems.map((item) => {
                const isActive = activeId === item.section_id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.section_id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(item.section_id);
                    }}
                    data-testid="site-mobile-nav-item"
                    aria-current={isActive ? "true" : undefined}
                    className={`focus-ring flex min-h-[48px] items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3 font-display text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--background-blue-soft)] text-[var(--surface-blue)] font-semibold"
                        : "text-[var(--text-primary)] hover:bg-[var(--background-secondary)]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--surface-blue)]" />}
                  </a>
                );
              })}
            </nav>

            {persistentActions.length > 0 && (
              <div className="border-t border-[var(--border-primary)] px-2 py-3 space-y-1" data-testid="site-mobile-nav-actions">
                <p className="px-3 pb-1 font-display text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Quick Actions</p>
                {persistentActions.map((action) => (
                  <a
                    key={action.key}
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    onClick={action.onClick}
                    data-testid={`site-mobile-nav-action-${action.key}`}
                    className="focus-ring flex min-h-[48px] items-center gap-3 rounded-[var(--radius-sm)] px-3 font-display text-sm text-[var(--text-primary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <action.icon className="h-4 w-4 text-[var(--surface-blue)]" />
                    {action.label}
                  </a>
                ))}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
