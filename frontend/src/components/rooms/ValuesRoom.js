import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";
import { themeFor } from "@/lib/theme";

// Deterministic pseudo-random offsets so the constellation looks organic
// but never shifts between renders.
function offsetFor(i, seedA, seedB) {
  const seed = Math.sin(i * seedA) * seedB;
  return (seed - Math.floor(seed)) * 2 - 1; // -1..1
}

const NODE_SIZE = 116; // px — every node is now the same size

export default function ValuesRoom({ section }) {
  const c = section.content || {};
  const items = Array.isArray(c.items) ? c.items : [];
  const t = themeFor(section.theme);
  const [active, setActive] = useState(null);
  const activeItem = active !== null ? items[active] : null;

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="values-room" sectionType={section.section_type} className="py-24 md:py-36">
      <RoomContainer>
        <RoomEyebrow dark={t.isDark}>Values</RoomEyebrow>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-4">{c.heading || "What Drives Me"}</h2>
        {c.intro && <p className="font-body text-base md:text-lg max-w-[62ch] mb-16 opacity-90">{c.intro}</p>}

        {items.length === 0 ? (
          <EmptyRoomNotice message="Values are being curated." />
        ) : (
          <div className="relative" data-testid="values-constellation">
            {/* connecting lines (decorative) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" aria-hidden="true">
              {items.map((_, i) =>
                i > 0 ? (
                  <line
                    key={`line-${i}`}
                    x1={`${8 + ((i - 1) % 5) * 20 + offsetFor(i - 1, 3, 7) * 4}%`}
                    y1={`${20 + Math.floor((i - 1) / 5) * 42 + offsetFor(i - 1, 5, 9) * 8}%`}
                    x2={`${8 + (i % 5) * 20 + offsetFor(i, 3, 7) * 4}%`}
                    y2={`${20 + Math.floor(i / 5) * 42 + offsetFor(i, 5, 9) * 8}%`}
                    stroke="var(--border-blue)"
                    strokeWidth="1"
                  />
                ) : null
              )}
            </svg>
            <div className="relative flex flex-wrap justify-center gap-x-4 gap-y-10 md:gap-x-8 py-8 min-h-[280px] items-center">
              {items.map((item, i) => {
                const yShift = offsetFor(i, 5, 9) * 14;
                const isActive = active === i;
                return (
                  <motion.button
                    key={`${item.title || "value"}-${i}`}
                    type="button"
                    data-testid="value-node"
                    aria-pressed={isActive}
                    onClick={() => setActive(active === i ? null : i)}
                    style={{ transform: `translateY(${yShift}px)` }}
                    whileHover={{ scale: 1.08 }}
                    className="focus-ring group relative"
                  >
                    <span
                      className={`block rounded-full border flex items-center justify-center text-center font-display font-semibold text-sm transition-colors ${
                        isActive
                          ? "bg-gradient-to-b from-zinc-600 via-zinc-800 to-black text-white border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.4),0_8px_18px_-6px_rgba(0,0,0,0.65)]"
                          : "bg-[var(--background-blue-soft)] text-[var(--surface-blue)] border-[var(--border-blue)] group-hover:bg-gradient-to-b group-hover:from-zinc-600 group-hover:via-zinc-800 group-hover:to-black group-hover:text-white group-hover:border-transparent"
                      }`}
                      style={{ width: `${NODE_SIZE}px`, height: `${NODE_SIZE}px` }}
                    >
                      {item.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence mode="wait">
              {activeItem && (activeItem.description || activeItem.image) && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  data-testid="value-highlight-card"
                  className="mt-10 max-w-md mx-auto rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-blue)] bg-white shadow-[var(--shadow-room)]"
                >
                  {activeItem.image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={activeItem.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5 text-center">
                    <p className="font-display text-xs uppercase tracking-[0.14em] text-[var(--surface-blue)] mb-2">{activeItem.title}</p>
                    {activeItem.description && <p className="font-editorial italic text-base md:text-lg text-black">{activeItem.description}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {active === null && (
              <p className="text-center font-body text-xs uppercase tracking-[0.14em] opacity-50 mt-4">Tap a point to illuminate it</p>
            )}
          </div>
        )}
      </RoomContainer>
    </RoomWrapper>
  );
}
