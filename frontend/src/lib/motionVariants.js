// Framer Motion variants mapped to CMS-approved transition_style values.
// All variants animate only opacity/transform (+ clipPath) per performance rules.

const EASE = [0.22, 1, 0.36, 1];

export const roomVariants = {
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
  },
  slide: {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  },
  "mask-reveal": {
    hidden: { opacity: 0, clipPath: "inset(0% 0% 100% 0% round 0px)" },
    show: { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 0px)", transition: { duration: 0.8, ease: EASE } },
  },
  "curtain-reveal": {
    hidden: { opacity: 0, scaleX: 0.94 },
    show: { opacity: 1, scaleX: 1, transition: { duration: 0.7, ease: EASE } },
  },
  "doorway-reveal": {
    hidden: { opacity: 0, clipPath: "inset(0 48% 0 48% round 16px)", y: 12 },
    show: { opacity: 1, clipPath: "inset(0 0% 0 0% round 16px)", y: 0, transition: { duration: 0.7, ease: EASE } },
  },
  "spotlight-reveal": {
    hidden: { opacity: 0, scale: 0.985 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
  },
  "depth-transition": {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
  },
  "editorial-page-turn": {
    hidden: { opacity: 0, rotateX: 4, y: 20 },
    show: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.7, ease: EASE } },
  },
  "soft-focus-reveal": {
    hidden: { opacity: 0, filter: "blur(6px)" },
    show: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
  },
  none: {
    hidden: { opacity: 1 },
    show: { opacity: 1 },
  },
};

export const reducedVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

export function getRoomVariant(transitionStyle, reduced) {
  if (reduced) return reducedVariant;
  return roomVariants[transitionStyle] || roomVariants.fade;
}
