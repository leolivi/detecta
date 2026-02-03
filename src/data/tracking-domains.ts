import {TrackerPurpose} from "../types/tracking-enums";
import trackerCoreData from "./tracker-core.json";

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
// load core data (first badge)
Object.entries(trackerCoreData.trackers as Record<string, CompressedTracker>).forEach(
  ([domain, data]) => {
    TRACKER_MAP.set(domain, {
      domain,
      owner: data.o,
      categories: data.c,
      purpose: mapToPurpose(data.c),
      prevalence: data.p,
      fingerprinting: data.f,
    });
  }
);

// load extended data (second badge, lazy load)
setTimeout(async () => {
  try {
    const response = await fetch(chrome.runtime.getURL("src/data/tracker-extended.json"));
    const extendedData = await response.json();
    
    Object.entries(extendedData.trackers as Record<string, CompressedTracker>).forEach(
      ([domain, data]) => {
        if (!TRACKER_MAP.has(domain)) {
          TRACKER_MAP.set(domain, {
            domain,
            owner: data.o,
            categories: data.c,
            purpose: mapToPurpose(data.c),
            prevalence: data.p,
            fingerprinting: data.f,
          });
        }
      }
    );
    console.log(`Loaded ${TRACKER_MAP.size} total trackers`);
  } catch (e) {
    console.warn("Could not load extended trackers", e);
  }
}, 2000);



