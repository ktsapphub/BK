import { useEffect, useMemo, useState } from "react";
import { publicApi } from "@/lib/api";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { scrollToElement } from "@/lib/lenisSingleton";
import RoomRenderer from "@/components/rooms/RoomRenderer";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [pageData, setPageData] = useState(null);
  const [supplementary, setSupplementary] = useState(null);
  const [navItems, setNavItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  useLenisScroll(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [page, careerEntries, testimonials, projects, services, thoughts, impactItems, nav, siteSettings] =
          await Promise.all([
            publicApi.getPage("home"),
            publicApi.getCareerEntries(),
            publicApi.getTestimonials(),
            publicApi.getProjects(),
            publicApi.getServices(),
            publicApi.getThoughts(),
            publicApi.getImpactItems(),
            publicApi.getNavigation(),
            publicApi.getGlobalSettings(),
          ]);
        if (!mounted) return;
        setPageData(page);
        setSupplementary({ careerEntries, testimonials, projects, services, thoughts, impactItems, settings: siteSettings });
        setNavItems(nav);
        setSettings(siteSettings);
        if (siteSettings?.seo_default_title) document.title = siteSettings.seo_default_title;
      } catch (e) {
        if (mounted) setError("Unable to load the site right now. Please try again shortly.");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const sections = useMemo(() => pageData?.sections || [], [pageData]);

  const handleSkipIntro = () => {
    sessionStorage.setItem("bk_skip_intro", "1");
    const second = sections[1];
    if (second) {
      scrollToElement(second.id);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background-primary)] text-[var(--text-primary)] px-6 text-center">
        <p className="font-body text-base">{error}</p>
      </div>
    );
  }

  if (!pageData || !supplementary) {
    return (
      <div className="min-h-screen bg-[var(--background-primary)] p-8 space-y-6">
        <Skeleton className="h-72 w-full rounded-[var(--radius-md)]" />
        <Skeleton className="h-40 w-full rounded-[var(--radius-md)]" />
        <Skeleton className="h-40 w-full rounded-[var(--radius-md)]" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-primary)]">
      <SiteNav navItems={navItems} />
      <main>
        {sections.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center text-center px-6">
            <p className="font-editorial italic text-2xl text-[var(--text-secondary)]">
              This site is being curated. Please check back soon.
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <RoomRenderer key={section.id} section={section} data={supplementary} onSkipIntro={handleSkipIntro} />
          ))
        )}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
