import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

// Auto-scrolls a native overflow-x container whose children are rendered twice,
// wrapping at half the scroll width for a seamless loop. Touch swipes stay native
// (auto-scroll resumes 1.5s after the finger lifts); pauses on hover/focus.
// With prefers-reduced-motion it stays static but remains swipeable.
export function useAutoScroll(speed = 40) {
  const ref = useRef(null);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let pos = el.scrollLeft;
    let last = performance.now();
    let paused = false;
    let resume;
    let raf;
    const pause = () => { paused = true; clearTimeout(resume); };
    const play = (delay = 0) => {
      clearTimeout(resume);
      resume = setTimeout(() => { pos = el.scrollLeft; paused = false; }, delay);
    };
    const onTouchEnd = () => play(1500);
    const tick = (now) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const half = el.scrollWidth / 2;
      if (!paused && half > el.clientWidth) {
        pos += (speed * dt) / 1000;
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      } else if (half > 0 && el.scrollLeft >= half) {
        el.scrollLeft -= half; // user swiped past the seam
      }
      raf = requestAnimationFrame(tick);
    };
    const events = [
      ["mouseenter", pause], ["mouseleave", () => play()],
      ["focusin", pause], ["focusout", () => play()],
      ["touchstart", pause], ["touchend", onTouchEnd], ["touchcancel", onTouchEnd],
    ];
    events.forEach(([e, h]) => el.addEventListener(e, h, { passive: true }));
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resume);
      events.forEach(([e, h]) => el.removeEventListener(e, h));
    };
  }, [reduced, speed]);

  return ref;
}
