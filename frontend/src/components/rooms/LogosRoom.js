import { Building2 } from "lucide-react";
import { RoomWrapper, RoomContainer, RoomEyebrow } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";

function LogoTile({ item }) {
  if (item.logo_url) {
    return (
      <div
        data-testid="logo-tile"
        className="shrink-0 h-16 w-40 md:h-20 md:w-48 rounded-[var(--radius-sm)] border border-[var(--border-blue)] bg-[var(--background-primary)]/60 flex items-center justify-center px-5"
      >
        <img src={item.logo_url} alt={item.name || "Partner organization"} className="max-h-11 md:max-h-14 max-w-full object-contain" loading="lazy" />
      </div>
    );
  }
  return (
    <div
      data-testid="logo-tile"
      className="shrink-0 h-16 w-40 md:h-20 md:w-48 rounded-[var(--radius-sm)] border border-[var(--border-blue)] bg-[var(--background-primary)]/40 flex flex-col items-center justify-center gap-1.5 px-4"
    >
      <Building2 className="h-4 w-4 opacity-40" aria-hidden="true" />
      <span className="font-display text-[11px] uppercase tracking-[0.08em] opacity-60 text-center leading-tight">
        {item.name || "Organization"}
      </span>
    </div>
  );
}

export default function LogosRoom({ section }) {
  const c = section.content || {};
  const items = Array.isArray(c.items) ? c.items : [];
  const t = themeFor(section.theme);

  if (items.length === 0) return null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="logos-room" sectionType={section.section_type} className="py-16 md:py-20" noise={false}>
      <RoomContainer>
        {(c.heading || c.intro) && (
          <div className="mb-8 md:mb-10 text-center">
            {c.heading && <RoomEyebrow dark={t.isDark}>{c.heading}</RoomEyebrow>}
            {c.intro && <p className="font-body text-sm md:text-base opacity-70 max-w-[52ch] mx-auto">{c.intro}</p>}
          </div>
        )}
      </RoomContainer>

      <div className="relative w-full overflow-hidden group [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" data-testid="logos-marquee">
        <div className="flex items-center gap-4 md:gap-6 w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[...items, ...items].map((item, i) => (
            <LogoTile key={i} item={item} />
          ))}
        </div>
      </div>
    </RoomWrapper>
  );
}
