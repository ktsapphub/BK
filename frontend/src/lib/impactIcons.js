import { Newspaper, Mic, Tv, Video, Award, Mic2, BookOpen, Globe } from "lucide-react";

// Must match IMPACT_ICONS in backend/models.py.
export const IMPACT_ICONS = { Newspaper, Mic, Tv, Video, Award, Mic2, BookOpen, Globe };

// Shown when the categories API fails; same as the seeded migration.
export const FALLBACK_IMPACT_CATEGORIES = [
  { key: "Feature", label: "Features", subtitle: "Digital Publications", icon: "Newspaper" },
  { key: "Podcast", label: "Podcasts", subtitle: "Audio Interviews", icon: "Mic" },
  { key: "TV & Video", label: "TV & Video Appearances", subtitle: "Broadcast & Video", icon: "Tv" },
];
