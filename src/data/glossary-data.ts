import {CursorIcons, type CursorIconType} from "@/types/cursor";

export interface GlossaryEntry {
  icon: string;
  category: string;
  description: string;
  type: "method" | "purpose";
}

function getIconUrl(key: NonNullable<CursorIconType>): string {
  return CursorIcons[key];
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  // Tracking Methods
  {
    icon: getIconUrl("AFFILIATE"),
    category: "Affiliate",
    description: "Links that earn commission when you make a purchase",
    type: "method",
  },
  {
    icon: getIconUrl("SHORTENER"),
    category: "URL Shortener",
    description: "Shortened links (bit.ly, t.co) that track clicks",
    type: "method",
  },
  {
    icon: getIconUrl("REDIRECTOR"),
    category: "Redirector",
    description: "Links that redirect through tracking servers",
    type: "method",
  },
  {
    icon: getIconUrl("URL_DECORATION"),
    category: "URL Parameters",
    description: "Tracking parameters added to URLs (utm_, fbclid, gclid)",
    type: "method",
  },

  // Tracking Purposes
  {
    icon: getIconUrl("AD"),
    category: "Advertising",
    description: "Ad networks and advertising trackers",
    type: "purpose",
  },
  {
    icon: getIconUrl("ANALYTICS"),
    category: "Analytics",
    description: "Website analytics and behavior tracking",
    type: "purpose",
  },
  {
    icon: getIconUrl("SOCIAL"),
    category: "Social Media",
    description: "Social media widgets and sharing trackers",
    type: "purpose",
  },
  {
    icon: getIconUrl("UNKNOWN"),
    category: "Unknown",
    description: "Unclassified tracking method or purpose",
    type: "purpose",
  },
];
