import {CursorStyles} from "@/types/cursor";

export interface GlossaryEntry {
  icon: CursorStyles;
  category: string;
  description: string;
  type: "method" | "purpose";
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  // Tracking Methods
  {
    icon: CursorStyles.AFFILIATE,
    category: "Affiliate",
    description: "Links that earn commission when you make a purchase",
    type: "method",
  },
  {
    icon: CursorStyles.SHORTENER,
    category: "URL Shortener",
    description: "Shortened links (bit.ly, t.co) that track clicks",
    type: "method",
  },
  {
    icon: CursorStyles.REDIRECTOR,
    category: "Redirector",
    description: "Links that redirect through tracking servers",
    type: "method",
  },
  {
    icon: CursorStyles.URL_DECORATION,
    category: "URL Parameters",
    description: "Tracking parameters added to URLs (utm_, fbclid, gclid)",
    type: "method",
  },

  // Tracking Purposes
  {
    icon: CursorStyles.AD,
    category: "Advertising",
    description: "Ad networks and advertising trackers",
    type: "purpose",
  },
  {
    icon: CursorStyles.ANALYTICS,
    category: "Analytics",
    description: "Website analytics and behavior tracking",
    type: "purpose",
  },
  {
    icon: CursorStyles.SOCIAL,
    category: "Social Media",
    description: "Social media widgets and sharing trackers",
    type: "purpose",
  },
  {
    icon: CursorStyles.UNKNOWN,
    category: "Unknown",
    description: "Unclassified tracking method or purpose",
    type: "purpose",
  },
];
