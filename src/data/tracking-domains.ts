import {TrackerPurpose} from "../types/tracking-enums";
import trackerData from "./tracker.json";

/* -----
  Known tracker domains dataset 
  sources:
  - DuckDuckGo Tracker Radar:https://github.com/duckduckgo/tracker-radar/tree/main
----- */

export interface TrackerDomain {
  domain: string;
  owner: string | null;
  categories: string[];
  purpose: TrackerPurpose;
  prevalence: number;
  fingerprinting: number;
}

// map categories to match TrackerPurpose
function mapToPurpose(categories: string[]): TrackerPurpose {
  if (categories.some((cat) => cat.includes("Social"))) {
    return TrackerPurpose.SOCIAL;
  }
  if (
    categories.some(
      (cat) => cat.includes("Advertising") || cat.includes("Ad Motivated")
    )
  ) {
    return TrackerPurpose.AD;
  }
  if (
    categories.some(
      (cat) => cat.includes("Analytics") || cat.includes("Audience Measurement")
    )
  ) {
    return TrackerPurpose.ANALYTICS;
  }
  if (categories.some((cat) => cat.includes("Affiliate"))) {
    return TrackerPurpose.AFFILIATE;
  }
  return TrackerPurpose.UNKNOWN;
}

// known tracker domains and their types detectetd in network requests
export const TRACKING_DOMAINS: TrackerDomain[] = trackerData.trackers.map(
  (t) => ({
    domain: t.domain,
    owner: t.owner,
    categories: t.categories,
    purpose: mapToPurpose(t.categories),
    prevalence: t.prevalence,
    fingerprinting: t.fingerprinting,
  })
);
