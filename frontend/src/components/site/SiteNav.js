import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { scrollToElement } from "@/lib/lenisSingleton";

export default function SiteNav({ navItems }) {
  const [active, setActive] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!navItems?.length) return;
    const ids = navItems.map((n) => n.section_id).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
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

  if (!navItems?.length) return null;

  const goTo = (id) => {
    scrollToElement(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop sticky room index */}
      <nav
        data-testid="site-desktop-nav"
        className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3"
        aria-label="Room navigation"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => goTo(item.section_id)}
            data-testid="site-nav-item"
            className="focus-ring group flex items-center gap-2"
            aria-current={active === item.section_id}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                active === item.section_id ? "bg-[var(--surface-blue)] scale-125" : "bg-[var(--border-primary)] group-hover:bg-[var(--accent-highlight)]"
              }`}
            />
            <span
              className={`font-display text-[11px] uppercase tracking-[0.08em] opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--background-primary)] px-2 py-1 rounded-[var(--radius-xs)] shadow-[var(--shadow-quiet)] ${
                active === item.section_id ? "opacity-100 text-[var(--surface-blue)]" : "text-[var(--text-secondary)]"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Mobile drawer */}
      <div className="lg:hidden fixed top-4 right-4 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              data-testid="site-mobile-nav-trigger"
              aria-label="Open room navigation"
              className="focus-ring h-10 w-10 rounded-full bg-[var(--surface-blue-dark)] text-white flex items-center justify-center shadow-[var(--shadow-float)]"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[var(--background-primary)] text-[var(--text-primary)]">
            <div className="grid gap-1 py-2" data-testid="site-mobile-nav-list">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goTo(item.section_id)}
                  className="focus-ring text-left font-display text-sm py-2.5 border-b border-[var(--border-primary)] last:border-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
