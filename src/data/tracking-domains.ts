import {TrackerPurpose} from "../types/tracking-enums";
import trackerDataRaw from "./tracker.json";

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

interface CompressedTracker {
  o: string | null;     
  c: string[];           
  p: number;             
  f: number;             
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

export const TRACKER_MAP = new Map<string, TrackerDomain>();

// known tracker domains and their types detectetd in network requests
Object.entries(trackerDataRaw.trackers).forEach(([domain, data]: [string, CompressedTracker]) => {
  TRACKER_MAP.set(domain, {
    domain,
    owner: data.o,
    categories: data.c,
    purpose: mapToPurpose(data.c),
    prevalence: data.p,
    fingerprinting: data.f,
  });
});



