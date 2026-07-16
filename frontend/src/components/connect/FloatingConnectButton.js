import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { publicApi } from "@/lib/api";
import ConnectDialog from "./ConnectDialog";

// Persistent "Let's Connect" pill — mounted once at the app root, visible on
// every public route (hidden on /admin, and hidden while its own dialog is
// open). Automatically swaps colors depending on whether the room currently
// rendered underneath the button is a dark or light themed section.
export default function FloatingConnectButton() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [settings, setSettings] = useState(null);
  const [projects, setProjects] = useState([]);
  const buttonRef = useRef(null);

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    publicApi.getGlobalSettings().then(setSettings).catch(() => {});
    publicApi.getProjects().then(setProjects).catch(() => {});
  }, []);

  const updateTheme = useCallback(() => {
    if (!buttonRef.current || typeof document === "undefined") return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, window.innerWidth - 4), rect.left + rect.width / 2);
    const y = Math.min(Math.max(0, window.innerHeight - 4), rect.top + rect.height / 2);
    const el = document.elementFromPoint(x, y);
    const themedAncestor = el?.closest?.("[data-theme-dark]");
    if (themedAncestor) setIsDark(themedAncestor.getAttribute("data-theme-dark") === "true");
  }, []);

  useEffect(() => {
    if (isAdminRoute || open) return;
    const raf1 = requestAnimationFrame(updateTheme);
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        updateTheme();
        raf = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isAdminRoute, open, updateTheme, location.pathname]);

  if (isAdminRoute) return null;

  const projectMatch = location.pathname.match(/^\/projects\/([^/]+)\/?$/);
  const routeProjectKey = projectMatch ? projectMatch[1] : "";
  const matchedProject = routeProjectKey ? projects.find((p) => p.slug === routeProjectKey || p.id === routeProjectKey) : null;

  return (
    <>
      {!open && (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Let's Connect — open contact form"
          data-testid="floating-connect-button"
          className={`fixed z-[60] inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-5 py-3.5 font-display text-sm font-semibold transition-colors duration-200 focus-ring ${
            isDark
              ? "bg-white text-[var(--surface-blue-dark)] border-white/70 hover:bg-[var(--background-blue-soft)]"
              : "bg-[var(--surface-blue)] text-white border-[var(--surface-blue)]/60 hover:bg-[var(--surface-blue-dark)]"
          }`}
          style={{
            right: "max(24px, env(safe-area-inset-right))",
            bottom: "max(24px, env(safe-area-inset-bottom))",
            boxShadow: isDark
              ? "inset 0 1px 0 rgba(255,255,255,0.7), 0 12px 30px -8px rgba(0,20,60,0.55), 0 4px 10px -2px rgba(0,20,60,0.35)"
              : "inset 0 1px 0 rgba(255,255,255,0.25), 0 12px 30px -8px rgba(0,20,60,0.5), 0 4px 10px -2px rgba(0,20,60,0.35)",
          }}
        >
          {/* Glowing pulse ring — a soft blurred halo rather than a flat filled disc, for depth */}
          <span
            aria-hidden="true"
            data-testid="floating-connect-button-pulse"
            className="absolute inset-0 rounded-full pointer-events-none animate-ping"
            style={{
              animationDuration: "2.4s",
              background: "transparent",
              boxShadow: isDark
                ? "0 0 0 2px rgba(255,255,255,0.55), 0 0 22px 6px rgba(255,255,255,0.3)"
                : "0 0 0 2px rgba(0,87,184,0.55), 0 0 22px 6px rgba(0,87,184,0.3)",
            }}
          />
          <MessageCircle className="relative h-4 w-4" aria-hidden="true" />
          <span className="relative">Let's Connect</span>
        </button>
      )}

      <ConnectDialog
        open={open}
        onOpenChange={setOpen}
        settings={settings}
        projects={projects}
        initialProjectId={matchedProject?.id || ""}
        sourcePage={location.pathname}
        sourceSection={location.hash ? location.hash.replace("#", "") : ""}
        triggerRef={buttonRef}
      />
    </>
  );
}
