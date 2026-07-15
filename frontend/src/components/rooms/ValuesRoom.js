import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomWrapper, RoomContainer, RoomEyebrow, EmptyRoomNotice } from "./RoomWrapper";

// Deterministic pseudo-random offsets so the constellation looks organic
// but never shifts between renders.
function offsetFor(i, seedA, seedB) {
  const seed = Math.sin(i * seedA) * seedB;
  return (seed - Math.floor(seed)) * 2 - 1; // -1..1
}

export default function ValuesRoom({ section }) {
  const c = section.content || {};
  const items = Array.isArray(c.items) ? c.items : [];
  const [active, setActive] = useState(null);

  return (
    <RoomWrapper id={section.id} theme={section.theme} transitionStyle={section.transition_style} testId="values-room" sectionType={section.section_type} className="py-24 md:py-36">
      <RoomContainer>
        <RoomEyebrow>Values</RoomEyebrow>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.01em] mb-4">{c.heading || "What Actually Drives the Work"}</h2>
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
                    key={i}
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
                const size = 0.85 + (i % 3) * 0.18;
                const yShift = offsetFor(i, 5, 9) * 14;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    data-testid="value-node"
                    onClick={() => setActive(active === i ? null : i)}
                    style={{ transform: `translateY(${yShift}px)` }}
                    whileHover={{ scale: 1.08 }}
                    className="focus-ring group relative"
                  >
                    <span
                      className="block rounded-full bg-[var(--background-blue-soft)] border border-[var(--border-blue)] flex items-center justify-center text-center font-display font-semibold text-[var(--surface-blue)] transition-colors group-hover:bg-[var(--surface-blue)] group-hover:text-white"
                      style={{ width: `${size * 108}px`, height: `${size * 108}px`, fontSize: `${size * 13.5}px` }}
                    >
                      {item.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence mode="wait">
              {active !== null && items[active]?.description && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-10 max-w-xl mx-auto text-center"
                >
                  <p className="font-editorial italic text-lg md:text-xl">{items[active].description}</p>
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
