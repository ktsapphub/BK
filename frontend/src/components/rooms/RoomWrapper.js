import { motion } from "framer-motion";
import { themeFor } from "@/lib/theme";
import { getRoomVariant } from "@/lib/motionVariants";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

export function RoomWrapper({ id, theme, transitionStyle, children, testId, className = "", noise = true, sectionType }) {
  const t = themeFor(theme);
  const reduced = useReducedMotionPref();
  const variant = getRoomVariant(transitionStyle, reduced);

  return (
    <motion.section
      id={id}
      data-testid={testId}
      data-section-type={sectionType}
      className={`relative w-full overflow-hidden ${t.bg} ${t.text} ${className}`}
      initial="hidden"
      animate="show"
      variants={variant}
    >
      {noise && <div className="room-noise" aria-hidden="true" />}
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

export function RoomContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function RoomEyebrow({ children, dark = false }) {
  return (
    <p
      className={`font-display text-xs md:text-sm uppercase tracking-[0.16em] mb-4 ${
        dark ? "text-[var(--text-on-blue-muted)]" : "text-[var(--text-muted)]"
      }`}
    >
      {children}
    </p>
  );
}

export function EmptyRoomNotice({ message }) {
  return (
    <p className="font-body text-sm text-[var(--text-muted)] italic">{message}</p>
  );
}
