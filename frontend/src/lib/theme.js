// Maps CMS 'theme' values to Tailwind classes using design tokens only.
export const THEME_CLASSES = {
  true_white: {
    bg: "bg-[var(--background-primary)]",
    text: "text-[var(--text-primary)]",
    muted: "text-[var(--text-muted)]",
    isDark: false,
  },
  soft_white: {
    bg: "bg-[var(--background-secondary)]",
    text: "text-[var(--text-primary)]",
    muted: "text-[var(--text-muted)]",
    isDark: false,
  },
  pale_blue: {
    bg: "bg-[var(--background-blue-soft)]",
    text: "text-[var(--text-primary)]",
    muted: "text-[var(--text-muted)]",
    isDark: false,
  },
  deep_royal_blue: {
    bg: "bg-[var(--surface-blue-dark)]",
    text: "text-[var(--text-on-blue)]",
    muted: "text-[var(--text-on-blue-muted)]",
    isDark: true,
  },
};

export function themeFor(theme) {
  return THEME_CLASSES[theme] || THEME_CLASSES.true_white;
}
